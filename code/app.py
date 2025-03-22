import os
import shutil
import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from src.data_loader import get_historical_data, get_realtime_data
from src.anomaly_detection import train_entity_models, predict_anomaly
from src.mapping import map_anomaly_to_bucket
from src.insights import generate_insights
from src.config import DATA_DIR, HISTORICAL_DATA_PATH, CURRENT_DATA_PATH

app = FastAPI(title="Reconciliation Data API with Insights")

# Ensure the data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

@app.post("/upload/historical")
async def upload_historical(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    file_path = HISTORICAL_DATA_PATH
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        historical_df = get_historical_data(file_path)
        return JSONResponse(content={"message": f"Historical data uploaded successfully. Shape: {historical_df.shape}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/realtime")
async def upload_realtime(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    file_path = CURRENT_DATA_PATH
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        historical_df = get_historical_data()  # uses default config path
        realtime_df = get_realtime_data(historical_df, file_path)
        return JSONResponse(content={"message": f"Real-time data uploaded successfully. Shape: {realtime_df.shape}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test")
async def test_pipeline():
    try:
        historical_df = get_historical_data()
        realtime_df = get_realtime_data(historical_df)
        entity_models = train_entity_models(historical_df)
        realtime_predictions = []
        for _, row in realtime_df.iterrows():
            new_entry = {
                'Company': row['Company'],
                'Account': row['Account'],
                'AU': row['AU'],
                'Primary Account': row['Primary Account'],
                'Secondary Account': row['Secondary Account'],
                'GL Balance': row['GL Balance'],
                'iHub Balance': row['iHub Balance']
            }
            label, score = predict_anomaly(new_entry, entity_models)
            prediction = {
                'Company': row['Company'],
                'Account': row['Account'],
                'AU': row['AU'],
                'Primary Account': row['Primary Account'],
                'Secondary Account': row['Secondary Account'],
                'GL Balance': row['GL Balance'],
                'iHub Balance': row['iHub Balance'],
                'predicted_label': label,
                'anomaly_score': score
            }
            if label == "Anomaly":
                prediction["Balance Difference"] = row['GL Balance'] - row['iHub Balance']
                prediction["anomaly_bucket"] = map_anomaly_to_bucket(prediction)
            else:
                prediction["anomaly_bucket"] = None
            realtime_predictions.append(prediction)
        
        pred_df = pd.DataFrame(realtime_predictions)
        anomalies_df = pred_df[pred_df['predicted_label'] == "Anomaly"].copy()
        anomalies_df['Bucket Description'] = anomalies_df['anomaly_bucket'].apply(
            lambda x: str(x)  # You can also use your ANOMALY_BUCKETS mapping here if desired
        )
        
        # Generate insights using GPT-4
        insights_text = generate_insights(anomalies_df)
        
        # Optionally, export anomalies and insights to files
        anomalies_output_file = os.path.join(DATA_DIR, "anomalies_output.csv")
        insights_output_file = os.path.join(DATA_DIR, "insights_output.txt")
        anomalies_df.to_csv(anomalies_output_file, index=False)
        with open(insights_output_file, "w") as f:
            f.write(insights_text)
        
        return JSONResponse(content={
            "message": "Test pipeline executed successfully.",
            "anomaly_count": len(anomalies_df),
            "sample_insights": insights_text[:500]  # return first 500 characters of insights
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Reconciliation Data API with Insights is running."}

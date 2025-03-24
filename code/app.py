import os
import shutil
import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from src.data_loader import get_historical_data, get_realtime_data
from src.anomaly_detection import train_entity_models, predict_anomaly
from src.mapping import map_anomaly_to_bucket
from src.insights_openai import generate_insights
from src.config import DATA_DIR, set_historical_path, set_realtime_path
from fastapi.middleware.cors import CORSMiddleware
from src.predict_anomaly import run_anomaly_prediction_pipeline
import traceback

app = FastAPI(title="Reconciliation Data API with Insights")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # You can restrict this to specific domains later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure the data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

@app.post("/upload/historical")
async def upload_historical(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    file_path = os.path.join(DATA_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
     # ✅ Update config path dynamically
    set_historical_path(file.filename)
    
    try:
        historical_df = get_historical_data(file_path)
        return JSONResponse(content={"message": f"Historical data uploaded successfully. Shape: {historical_df.shape}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/realtime")
async def upload_realtime(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    file_path = os.path.join(DATA_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
     # ✅ Update config path dynamically
    set_realtime_path(file.filename)
    try:
        historical_df = get_historical_data()  # uses default config path
        realtime_df = get_realtime_data(historical_df, file_path)
        return JSONResponse(content={"message": f"Real-time data uploaded successfully. Shape: {realtime_df.shape}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import FileResponse

@app.get("/test")
async def test_pipeline():
    try:
        historical_df = get_historical_data()
        realtime_df = get_realtime_data(historical_df)
        entity_models = train_entity_models(historical_df)

        export_df, full_output_path = run_anomaly_prediction_pipeline(realtime_df, entity_models)

        # Convert to JSON for UI
        output_json = export_df.to_dict(orient="records")
        df = pd.DataFrame(output_json)
         # Calculate and print summary
        total_impact = float(df["Balance Difference"].sum())
       
        return JSONResponse(content={
            "message": "Anomalies detected successfully.",
            "anomaly_count": len(output_json),
            "total_impact" : total_impact,
            "data": output_json  # 👈 Cleaned output for UI
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

    
@app.get("/insights")
async def get_insights():
    try:
        insights_data = generate_insights()
        return JSONResponse(content={
            "message": "AI Insights generated successfully.",
            "insights_data": insights_data
        })
    except Exception as e:
        import traceback
        print("❌ Exception in /insights:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



@app.get("/")
async def root():
    return {"message": "Reconciliation Data API with Insights is running."}

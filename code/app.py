import os
import shutil
import pandas as pd
from fastapi import FastAPI, File, UploadFile, HTTPException, APIRouter, Query
from fastapi.responses import JSONResponse
from src.data_loader import get_historical_data, get_realtime_data
from src.anomaly_detection import train_entity_models, predict_anomaly
from src.mapping import map_anomaly_to_bucket
from src.insights_openai import generate_insights
from src.config import DATA_DIR, set_historical_path, set_realtime_path
from fastapi.middleware.cors import CORSMiddleware
from src.predict_anomaly import run_anomaly_prediction_pipeline
import traceback
from fastapi import Request
from src.rule_based_suggestions import generate_rule_based_suggestions
from fastapi import Form
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


router = APIRouter()

app = FastAPI(title="Reconciliation Data API with Insights")
app.include_router(router, prefix="/recon")


app.add_middleware(
     CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure the data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# Util to auto-detect header row
def load_csv_with_auto_header(path):
    preview = pd.read_csv(path, header=None, nrows=5)
    for i in range(len(preview)):
        row = preview.iloc[i]
        if "MatchStatus" in row.values and "TRADEID" in row.values:
            return pd.read_csv(path, skiprows=i)
    raise ValueError("Could not detect proper header row with expected columns like 'MatchStatus' or 'TRADEID'.")

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
async def get_insights(request: Request):
    try:
        # Get API key from query parameter
        openai_key = request.query_params.get("openai_key")
        if not openai_key:
            raise HTTPException(status_code=400, detail="Missing OpenAI API key")
        
        insights_data = generate_insights(openai_key=openai_key)
        return JSONResponse(content={
            "message": "AI Insights generated successfully.",
            "insights_data": insights_data
        })
    except Exception as e:
        import traceback
        print("❌ Exception in /insights:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/upload-reconciliation")
async def upload_reconciliation_file(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(".csv"):
            raise HTTPException(status_code=400, detail="Only CSV files are supported.")

        raw_path = os.path.join(DATA_DIR, file.filename)
        with open(raw_path, "wb") as f:
            f.write(await file.read())

        df = load_csv_with_auto_header(raw_path)

        total_issue_count = len(df)
        match_status_stats = df["MatchStatus"].value_counts().to_dict()

        catalyst_cols = [col for col in df.columns if col.strip().startswith("Catalyst")]
        impact_cols = [col for col in df.columns if col.strip().startswith("Impact")]
        common_cols = [col for col in df.columns if not col.strip().startswith("Catalyst") and not col.strip().startswith("Impact")]

        catalyst_df = df[common_cols + catalyst_cols].copy()
        impact_df = df[common_cols + impact_cols].copy()

        catalyst_path = os.path.join(DATA_DIR, "catalyst_data.csv")
        impact_path = os.path.join(DATA_DIR, "impact_data.csv")
        catalyst_df.to_csv(catalyst_path, index=False)
        impact_df.to_csv(impact_path, index=False)

        return JSONResponse(content={
            "message": "Reconciliation file processed and split successfully.",
            "catalyst_data": catalyst_df.fillna("").to_dict(orient="records"),
            "impact_data": impact_df.fillna("").to_dict(orient="records"),
            "catalyst_rows": len(catalyst_df),
            "impact_rows": len(impact_df),
            "total_issue_count": total_issue_count,
            "match_status_stats": match_status_stats
        })

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/update-row")
async def update_reconciliation_row(source: str, trade_id: str, updates: dict):
    try:
        if source not in ["catalyst", "impact"]:
            raise HTTPException(status_code=400, detail="Invalid source. Must be 'catalyst' or 'impact'.")

        file_path = os.path.join(DATA_DIR, f"{source}_data.csv")
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail=f"{source}_data.csv not found.")

        df = pd.read_csv(file_path)
        if "TRADEID" not in df.columns:
            raise HTTPException(status_code=400, detail="TRADEID column missing in data.")

        if trade_id not in df["TRADEID"].astype(str).values:
            raise HTTPException(status_code=404, detail=f"TRADEID '{trade_id}' not found.")

        df["TRADEID"] = df["TRADEID"].astype(str)
        df.update(df[df["TRADEID"] == trade_id].assign(**updates))

        df.to_csv(file_path, index=False)
        return JSONResponse(content={"message": f"Row with TRADEID {trade_id} updated in {source}_data.csv."})

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))



@app.post("/send-email-notification")
async def send_email_notification(
    recipient_email: str = Form(...),
    subject: str = Form(...),
    message: str = Form(...)
):
    try:
        # SMTP CONFIG (update as per your SMTP provider)
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = "sujeet.kumar216@gmail.com"  # ✅ Replace with your sender email
        sender_password = "frya srmn gafo mwyh"  # ✅ Use app password (not raw password)

        # Email content
        msg = MIMEMultipart()
        msg["From"] = sender_email
        msg["To"] = recipient_email
        msg["Subject"] = subject
        msg.attach(MIMEText(message, "plain"))

        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()

        return {"message": f"Email sent to {recipient_email}"}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rule-suggestions")
def get_rule_suggestions(filename: str = Query(..., description="Name of the CSV file stored in the data folder")):
    try:
        csv_path = os.path.join(DATA_DIR, filename)
        if not os.path.exists(csv_path):
            raise HTTPException(status_code=404, detail=f"File '{filename}' not found. Please upload first.")
        
        suggestions = generate_rule_based_suggestions(csv_path)
        return JSONResponse(content={
            "message": "Rule-based suggestions generated successfully.",
            "data": suggestions
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

      
@app.get("/")
async def root():
    return {"message": "Reconciliation Data API with Insights is running."}

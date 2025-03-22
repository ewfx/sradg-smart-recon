import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
import shutil
from src.data_loader import get_historical_data, get_realtime_data
from src.config import DATA_DIR, HISTORICAL_DATA_PATH, CURRENT_DATA_PATH

app = FastAPI(title="Reconciliation Data API")

# Ensure the data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

@app.post("/upload/historical")
async def upload_historical(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    file_path = HISTORICAL_DATA_PATH
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Process the uploaded file
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
    
    # Process the uploaded file
    try:
        # For realtime, we need the historical data as well.
        historical_df = get_historical_data()  # use default config path
        realtime_df = get_realtime_data(historical_df, file_path)
        return JSONResponse(content={"message": f"Real-time data uploaded successfully. Shape: {realtime_df.shape}"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
        
@app.get("/")
async def root():
    return {"message": "Reconciliation Data API is running."}

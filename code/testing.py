# import requests

# def test_rule_suggestions():
#     # Base URL for your FastAPI server (adjust if different)
#     base_url = "http://127.0.0.1:8000"
#     endpoint = "/rule-suggestions"
    
#     # File name you expect to be saved in your DATA_DIR (e.g., from your upload endpoint)
#     filename = "CatalystReconciledData.csv"
    
#     # Construct full URL with query parameter
#     params = {"filename": filename}
#     url = f"{base_url}{endpoint}"
    
#     response = requests.get(url, params=params)
    
#     print("Status Code:", response.status_code)
#     try:
#         data = response.json()
#         print("Response JSON:", data)
#     except Exception as e:
#         print("Failed to parse JSON response:", e)
    
# if __name__ == "__main__":
#     test_rule_suggestions()

import requests
import os

def test_upload_reconciliation():
    # Base URL of your FastAPI server (adjust if needed)
    url = "http://127.0.0.1:8000/upload-reconciliation"
    
    # Path to your sample reconciliation CSV file (ensure this file exists)
    file_path = os.path.join("data", "catalyst_reconcillation_data_1.csv")
    
    if not os.path.exists(file_path):
        print(f"File {file_path} does not exist. Please ensure the file is available.")
        return

    with open(file_path, "rb") as f:
        # Construct the files payload
        files = {"file": (os.path.basename(file_path), f, "text/csv")}
        response = requests.post(url, files=files)
    
    print("Status Code:", response.status_code)
    try:
        data = response.json()
        print("Response JSON:")
        print(data)
    except Exception as e:
        print("Error parsing JSON response:", e)

if __name__ == "__main__":
    test_upload_reconciliation()


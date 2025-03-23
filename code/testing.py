
import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from huggingface_hub import login
from pathlib import Path

def verify_token():
    token = "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"
    if not token:
        raise EnvironmentError("❌ HUGGINGFACE_HUB_TOKEN is not set in environment variables.")
    return token

def login_to_huggingface(token):
    try:
        login(token=token)
        print("✅ Logged into Hugging Face.")
    except Exception as e:
        raise RuntimeError(f"❌ Failed to login to Hugging Face: {e}")

def download_llama_model(model_name, token):
    try:
        print(f"⬇️ Downloading model: {model_name}")
        tokenizer = AutoTokenizer.from_pretrained(model_name, token=token)
        model = AutoModelForCausalLM.from_pretrained(
            model_name,
            token=token,
            torch_dtype=torch.float16,
            device_map="auto"
        )
        print("✅ Model and tokenizer downloaded successfully.")
    except Exception as e:
        raise RuntimeError(f"❌ Download failed: {e}")

def check_local_cache(model_name):
    model_dir = Path.home() / ".cache" / "huggingface" / "hub"
    print(f"🔍 Checking cache at: {model_dir}")

    matched_dirs = list(model_dir.rglob(f"models--{model_name.replace('/', '--')}"))
    if matched_dirs:
        print(f"✅ Cached model found at: {matched_dirs[0]}")
    else:
        print("❌ Model is NOT cached locally yet.")

if __name__ == "__main__":
    MODEL_NAME = "meta-llama/Llama-2-7b-chat-hf"
    
    try:
        token = verify_token()
        login_to_huggingface(token)
        download_llama_model(MODEL_NAME, token)
        check_local_cache(MODEL_NAME)
    except Exception as err:
        print(err)

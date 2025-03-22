from transformers import AutoTokenizer, AutoModelForCausalLM
import torch
import pandas as pd

def generate_insight_for_row_hf(row: pd.Series) -> str:
    """
    Generate a concise insight for a single anomaly record using a Hugging Face text-generation model.
    This version uses a more directive prompt and generation parameters to encourage a summarizing insight.
    """
    # Compute Balance Difference if not already computed
    balance_diff = row.get("Balance Difference", row["GL Balance"] - row["iHub Balance"])
    
    # Build a prompt that instructs the model to provide a brief analysis,
    # avoiding simply repeating input details.
    prompt = f"""You are a financial reconciliation expert.
Analyze the following anomaly record and provide a concise insight (1-2 sentences) that summarizes the potential root cause and recommends a next step. Do not repeat the record details.

Anomaly record:
- Company: {row['Company']}
- Account: {row['Account']}
- AU: {row['AU']}
- Currency: {row.get('Currency', 'USD')}
- Primary Account: {row['Primary Account']}
- Secondary Account: {row['Secondary Account']}
- GL Balance: {row['GL Balance']}
- iHub Balance: {row['iHub Balance']}
- Balance Difference: {balance_diff}

Insight:"""
    
    # Use a larger model for better generation quality; adjust model if needed.
    model_name = "gpt2-large"  # You can experiment with other models like 'gpt2-xl' if resources allow.
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name)
    
    # Ensure the tokenizer has a pad token; for GPT-2, we use the eos token.
    if tokenizer.pad_token is None:
        tokenizer.pad_token = tokenizer.eos_token

    # Tokenize the prompt, limiting input to 512 tokens
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512)
    
    # Generate new tokens using adjusted parameters:
    outputs = model.generate(
        inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        max_new_tokens=150,
        pad_token_id=tokenizer.eos_token_id,
        temperature=0.7,
        top_p=0.9,
        do_sample=True
    )
    
    # Decode and post-process the output: remove the prompt part if needed.
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    # Optionally, remove the prompt part by splitting on "Insight:" if present.
    if "Insight:" in generated_text:
        generated_text = generated_text.split("Insight:")[1].strip()
    return generated_text

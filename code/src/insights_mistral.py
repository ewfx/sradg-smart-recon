import torch
import pandas as pd
from transformers import AutoTokenizer, AutoModelForCausalLM

# Load tokenizer and model
model_name = "mistralai/Mistral-7B-Instruct-v0.1"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
    device_map="auto"
)

# Make sure pad_token is defined
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token


def generate_insight_for_row_mistral(row: pd.Series) -> str:
    balance_diff = row.get("Balance Difference", row["GL Balance"] - row["iHub Balance"])

    prompt = f"""<s>[INST] <<SYS>>
You are a financial reconciliation expert.
<</SYS>>

Analyze the following anomaly and provide a short root cause insight with 1-2 sentences:

- Company: {row['Company']}
- Account: {row['Account']}
- AU: {row['AU']}
- Currency: {row.get('Currency', 'USD')}
- Primary Account: {row['Primary Account']}
- Secondary Account: {row['Secondary Account']}
- GL Balance: {row['GL Balance']}
- iHub Balance: {row['iHub Balance']}
- Balance Difference: {balance_diff}

Insight: [/INST]"""

    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(model.device)

    outputs = model.generate(
        input_ids=inputs["input_ids"],
        attention_mask=inputs["attention_mask"],
        max_new_tokens=150,
        temperature=0.7,
        top_p=0.9,
        do_sample=True,
        pad_token_id=tokenizer.eos_token_id
    )

    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Post-process
    if "Insight:" in generated_text:
        return generated_text.split("Insight:")[-1].strip()
    return generated_text.strip()

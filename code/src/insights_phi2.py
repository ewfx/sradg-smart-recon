import torch
import pandas as pd
from transformers import AutoTokenizer, AutoModelForCausalLM

# Load the open-access model (CPU-friendly)
model_name = "microsoft/phi-2"

tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float32,  # Phi-2 is CPU-friendly
    device_map="auto"
)

# Ensure pad token is set
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token


def generate_insight_for_row_phi2(row: pd.Series) -> str:
    balance_diff = row.get("Balance Difference", row["GL Balance"] - row["iHub Balance"])

    prompt = f"""You are a financial reconciliation expert.

Analyze the following anomaly record and provide a short insight (1-2 sentences):

Company: {row['Company']}
Account: {row['Account']}
AU: {row['AU']}
Currency: {row.get('Currency', 'USD')}
Primary Account: {row['Primary Account']}
Secondary Account: {row['Secondary Account']}
GL Balance: {row['GL Balance']}
iHub Balance: {row['iHub Balance']}
Balance Difference: {balance_diff}

Insight:"""

    # Tokenize the prompt
    inputs = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=512).to(model.device)

    with torch.no_grad():
        outputs = model.generate(
            input_ids=inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_new_tokens=100,
            temperature=0.7,
            top_p=0.9,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )

    # Decode the generated text
    generated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    if "Insight:" in generated_text:
        return generated_text.split("Insight:")[-1].strip()
    else:
        return generated_text.strip()

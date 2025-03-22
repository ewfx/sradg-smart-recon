import os
import pandas as pd
from faker import Faker
import random
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

fake = Faker()
random.seed(42)
Faker.seed(42)

def generate_historical_data(num_entities=100, num_transactions=200):
    primary_accounts = ["ALL LOB LOANS", "COMMERCIAL LOANS", "RETAIL LOANS"]
    secondary_accounts = ["DEFERRED COSTS", "PRINCIPAL", "INTEREST RECEIVABLE"]
    data = []
    
    # Define a one-year period for historical data
    end_date = datetime.now() - relativedelta(days=1)
    start_date = end_date - relativedelta(years=1)
    total_days = (end_date - start_date).days  # ~365 days
    
    for _ in range(num_entities):
        company = fake.company()
        account_number = random.randint(100, 999)
        au = random.randint(1000, 9999)
        primary_account = random.choice(primary_accounts)
        secondary_account = random.choice(secondary_accounts)
        base_balance = random.randint(20000, 100000)
        
        # Generate exactly num_transactions random days in the period
        transaction_days = sorted(random.sample(range(total_days), num_transactions))
        
        for day_offset in transaction_days:
            current_date = start_date + timedelta(days=day_offset)
            as_of_date = current_date.strftime('%d-%m-%Y')
            
            gl_balance = base_balance * random.uniform(0.9, 1.1)
            gl_balance = int(round(gl_balance, -3))
            
            # Use 60% chance to generate a "Break" (non-zero difference)
            if random.random() < 0.6:
                ihub_balance = gl_balance * random.uniform(0.7, 1.3)
                ihub_balance = int(round(ihub_balance, -3))
            else:
                ihub_balance = gl_balance
            
            data.append({
                "As of Date": as_of_date,
                "Company": company,
                "Account": account_number,
                "AU": au,
                "Currency": "USD",
                "Primary Account": primary_account,
                "Secondary Account": secondary_account,
                "GL Balance": gl_balance,
                "iHub Balance": ihub_balance
            })
    return pd.DataFrame(data)

def generate_realtime_data(historical_df):
    realtime_data = []
    entity_cols = ["Company", "Account", "AU", "Primary Account", "Secondary Account"]
    unique_entities = historical_df[entity_cols].drop_duplicates()
    
    # Use tomorrow's date as the real-time date
    realtime_date = (datetime.now() + timedelta(days=1)).strftime('%d-%m-%Y')
    
    for _, row in unique_entities.iterrows():
        base_balance = random.randint(20000, 100000)
        gl_balance = base_balance * random.uniform(0.9, 1.1)
        gl_balance = int(round(gl_balance, -3))
        
        # 50% chance to simulate a perturbed transaction (anomaly)
        if random.random() < 0.5:
            ihub_balance = gl_balance * random.uniform(0.7, 1.3)
            ihub_balance = int(round(ihub_balance, -3))
        else:
            ihub_balance = gl_balance
        
        realtime_data.append({
            "As of Date": realtime_date,
            "Company": row["Company"],
            "Account": row["Account"],
            "AU": row["AU"],
            "Currency": "USD",
            "Primary Account": row["Primary Account"],
            "Secondary Account": row["Secondary Account"],
            "GL Balance": gl_balance,
            "iHub Balance": ihub_balance
        })
    return pd.DataFrame(realtime_data)

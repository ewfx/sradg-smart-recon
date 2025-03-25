# 🚀 Project Name : Smart Reconciliation & Anomaly Detection

## 📌 Table of Contents
- [Introduction](#introduction)
- [Demo](#demo)
- [Inspiration](#inspiration)
- [What It Does](#what-it-does)
- [How We Built It](#how-we-built-it)
- [Challenges We Faced](#challenges-we-faced)
- [How to Run](#how-to-run)
- [Tech Stack](#tech-stack)
- [Team](#team)

---

## 🌟 Introduction

**Smart Reconciliation & Anomaly Detection** is a robust system that automates the detection of reconciliation anomalies and provides intelligent insights and root cause suggestions for financial transactions. It focuses on simplifying the reconciliation between two systems — Catalyst and Impact — to identify mismatches in quantity, price, and missing records, and recommends rule-based or AI-driven actions to resolve them.

This project aims to solve the problem of manual reconciliation that is slow, error-prone, and lacks contextual insights — especially in large organizations dealing with millions of trades.

---

## 🎥 Demo

🔗 [Live Demo](#) *(add if hosted)*  
🎩 [Video Demo](#) *(add if recorded)*  
🖼️ Screenshots:

![Screenshot 1](link-to-image)

---

## 💡 Inspiration

The traditional approach to financial reconciliation often involves manual spreadsheet processing and email exchanges between teams to resolve mismatches. This inspired us to build an intelligent platform that:
- Automates anomaly detection based on historical behavior
- Provides bucketed categorization of anomalies
- Generates insights and root cause suggestions using rule-based logic and GPT models
- Allows real-time CSV upload and interaction with updated data
- Sends instant email alerts when anomalies are detected or resolved

---

## ⚙️ What It Does

- ✅ Detects anomalies using Isolation Forest on historical GL/iHub balances
- ✅ Maps anomalies into defined buckets based on business thresholds
- ✅ Generates insights via OpenAI (GPT-4o) based on anomaly summaries
- ✅ Allows file uploads for both historical and real-time data via FastAPI
- ✅ Splits reconciliation data into Catalyst and Impact sources
- ✅ Provides rule-based recommendations for reconciliation mismatches
- ✅ Enables row-level updates and dynamically refreshes source files
- ✅ Sends automated email notifications for anomaly updates or resolutions

---

## 🛠️ How We Built It

- Developed backend logic with **FastAPI**
- Used **pandas** for data processing and **sklearn** for anomaly detection (Isolation Forest)
- Built logic for anomaly bucketing based on balance difference thresholds
- Integrated **OpenAI GPT-4o** API for insight generation
- Added email notifications using **smtplib** and **MIME libraries**
- Created API endpoints for file upload, row update, suggestion retrieval, and insight generation
- Implemented CORS for frontend communication

---

## 🚧 Challenges We Faced

- Managing dynamic file paths and retaining flexibility for user-uploaded datasets
- Ensuring OpenAI prompt formatting returned valid JSON consistently
- Maintaining consistency in MatchStatus and bucket mappings
- Handling missing values, mixed data types, and multiple date formats in reconciliation files
- Designing a scalable structure for real-time row updates and deletion upon resolution
- Creating meaningful rules that simulate domain knowledge in the rule-based engine

---

## 🏃 How to Run

1. Clone the repository  
   
   git clone https://github.com/ewfx/sradg-smart-recon.git
   cd sradg-smart-recon/code
  

2. Create and activate a virtual environment (optional but recommended)  
   
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
  
3. Install Python dependencies  
   
   pip install -r requirements.txt   or pip install fastapi uvicorn pandas openai python-multipart email-validator requests numpy email
  

4. Run the FastAPI application  
  
   uvicorn code.app:app --reload

5. Start React App 
   cd sradg-smart-recon/code/app/smart-recon-app
   npm install 
   npm run dev
 
6. Visit the API docs at  
   📍 `http://127.0.0.1:8000/docs` for Swagger UI

---

## 🏗️ Tech Stack

- 🔹 **Frontend**: React, Tailwind CSS, TypeScript 
- 🔹 **Backend**: FastAPI (Python), Pandas, Scikit-learn
- 🔹 **ML Model**: Isolation Forest (for unsupervised anomaly detection)
- 🔹 **NLP**: OpenAI GPT-4o for insight generation
- 🔹 **Email Integration**: SMTP (Gmail), MIME multipart email messages
- 🔹 **Data Storage**: Local CSV files (for historical/realtime/anomaly insights)

---

## 👥 Team

- 👨‍💻 **Sujeet Kumar** – [GitHub](https://github.com/sujeetkumar6673) *(Captain)*
- 👨‍💻 **Lingaraj Raul**

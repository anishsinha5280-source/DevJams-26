import os

APP_TITLE = "Cybersecurity Risk Prioritization System"
APP_VERSION = "1.0.0"
DB_PATH = os.getenv("DB_PATH", "cybersecurity_risk.db")
CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"]

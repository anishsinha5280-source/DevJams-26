from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import APP_TITLE, APP_VERSION, CORS_ORIGINS
from app.database import init_db
from app.api.vulnerabilities import router as vuln_router
from app.api.optimize import router as optimize_router
from app.api.demo import router as demo_router, load_demo_dataset

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and auto-seed if empty
    init_db()
    from app.database import execute_query
    existing = execute_query("SELECT COUNT(*) as cnt FROM vulnerabilities")
    if existing and existing[0]["cnt"] == 0:
        load_demo_dataset()
    yield

app = FastAPI(
    title=APP_TITLE,
    version=APP_VERSION,
    description="Cybersecurity Risk Prioritization System with 0/1 Knapsack Dynamic Programming Optimizer",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vuln_router, prefix="/api")
app.include_router(optimize_router, prefix="/api")
app.include_router(demo_router, prefix="/api")

@app.get("/")
def root():
    return {
        "app": APP_TITLE,
        "version": APP_VERSION,
        "status": "healthy",
        "docs_url": "/docs"
    }

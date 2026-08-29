import sqlite3
import os
from typing import List, Dict, Any, Optional
from app.config import DB_PATH

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA foreign_keys=ON;")
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Vulnerabilities table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vulnerabilities (
        vulnerability_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        severity TEXT NOT NULL,
        cvss_score REAL NOT NULL,
        epss_score REAL NOT NULL,
        cisa_kev INTEGER NOT NULL DEFAULT 0,
        asset_name TEXT NOT NULL,
        asset_criticality TEXT NOT NULL,
        remediation_type TEXT NOT NULL,
        estimated_hours REAL NOT NULL,
        actual_hours REAL DEFAULT 0.0,
        status TEXT NOT NULL DEFAULT 'pending',
        description TEXT,
        remediation_steps TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # Historical Adjustments table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS historical_adjustments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remediation_type TEXT NOT NULL,
        estimated_hours REAL NOT NULL,
        actual_hours REAL NOT NULL,
        variance_ratio REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    conn.commit()
    conn.close()

def execute_query(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def execute_write(query: str, params: tuple = ()) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(query, params)
    conn.commit()
    last_row_id = cursor.lastrowid
    conn.close()
    return last_row_id

def execute_many(query: str, params_list: List[tuple]) -> int:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.executemany(query, params_list)
    conn.commit()
    count = cursor.rowcount
    conn.close()
    return count

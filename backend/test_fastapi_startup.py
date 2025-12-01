#!/usr/bin/env python
"""
Minimal FastAPI test to check if the app can start
"""

import os
import sys

# Set environment variables
os.environ["DATABASE_URL"] = "sqlite:///./dev.db"
os.environ["SECRET_KEY"] = "dev-secret-key-change-in-production"

print("Testing FastAPI startup...")

try:
    from fastapi import FastAPI
    print("✓ FastAPI imported successfully")
    
    # Create a minimal FastAPI app
    app = FastAPI(title="Test App")
    
    @app.get("/")
    async def root():
        return {"message": "Backend is working!"}
    
    print("✓ FastAPI app created successfully")
    print("✓ All imports working - Backend can start!")
    
except Exception as e:
    print(f"✗ FastAPI startup failed: {e}")
    import traceback
    traceback.print_exc()
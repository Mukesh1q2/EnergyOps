#!/usr/bin/env python
"""
Test script to check individual imports
"""

print("Testing basic imports...")

try:
    from app.routers import auth
    print("✓ auth router imported successfully")
except Exception as e:
    print(f"✗ auth router failed: {e}")

try:
    from app.routers import users
    print("✓ users router imported successfully")
except Exception as e:
    print(f"✗ users router failed: {e}")

try:
    from app.routers import organizations
    print("✓ organizations router imported successfully")
except Exception as e:
    print(f"✗ organizations router failed: {e}")

try:
    from app.routers import assets
    print("✓ assets router imported successfully")
except Exception as e:
    print(f"✗ assets router failed: {e}")

try:
    from app.routers import bids
    print("✓ bids router imported successfully")
except Exception as e:
    print(f"✗ bids router failed: {e}")

try:
    from app.routers import websocket
    print("✓ websocket router imported successfully")
except Exception as e:
    print(f"✗ websocket router failed: {e}")

print("\nImport test completed!")
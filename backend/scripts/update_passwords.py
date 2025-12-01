#!/usr/bin/env python3
"""
Update user passwords in the database
"""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.core.database import async_engine
from app.core.password import get_password_hash

async def update_passwords():
    """Update all user passwords"""
    
    passwords = {
        'admin@optibid.com': 'admin123',
        'trader@optibid.com': 'trader123',
        'analyst@optibid.com': 'analyst123',
        'viewer@optibid.com': 'viewer123'
    }
    
    async with async_engine.begin() as conn:
        for email, password in passwords.items():
            password_hash = get_password_hash(password)
            print(f"Updating {email} with hash: {password_hash[:20]}...")
            
            await conn.execute(
                text("UPDATE users SET password_hash = :hash WHERE email = :email"),
                {"hash": password_hash, "email": email}
            )
            print(f"✓ Updated {email}")
    
    print("\n✅ All passwords updated successfully!")
    print("\nTest credentials:")
    for email, password in passwords.items():
        print(f"  {email} / {password}")

if __name__ == "__main__":
    asyncio.run(update_passwords())

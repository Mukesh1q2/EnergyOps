"""
Seed Test Users Script
Creates test users for admin, trader, analyst, and viewer roles
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select
from passlib.context import CryptContext
from app.core.database import AsyncSessionLocal, init_db
from app.models import User, Organization

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_test_users():
    """Create test users with different roles"""
    
    print("🚀 Starting test user creation...")
    
    # Initialize database
    await init_db()
    
    async with AsyncSessionLocal() as session:
        # Check if test organization exists
        result = await session.execute(
            select(Organization).where(Organization.slug == "test-org")
        )
        org = result.scalar_one_or_none()
        
        if not org:
            # Create test organization
            org = Organization(
                name="Test Organization",
                slug="test-org",
                status="active",
                subscription_tier="enterprise",
                metadata={"test": True}
            )
            session.add(org)
            await session.commit()
            await session.refresh(org)
            print(f"✅ Created test organization: {org.name}")
        else:
            print(f"✅ Test organization already exists: {org.name}")
        
        # Test users to create
        test_users = [
            {
                "email": "admin@optibid.com",
                "password": "admin123",
                "first_name": "Admin",
                "last_name": "User",
                "role": "admin",
                "status": "active",
                "email_verified": True
            },
            {
                "email": "trader@optibid.com",
                "password": "trader123",
                "first_name": "Trader",
                "last_name": "User",
                "role": "trader",
                "status": "active",
                "email_verified": True
            },
            {
                "email": "analyst@optibid.com",
                "password": "analyst123",
                "first_name": "Analyst",
                "last_name": "User",
                "role": "analyst",
                "status": "active",
                "email_verified": True
            },
            {
                "email": "viewer@optibid.com",
                "password": "viewer123",
                "first_name": "Viewer",
                "last_name": "User",
                "role": "viewer",
                "status": "active",
                "email_verified": True
            }
        ]
        
        created_users = []
        
        for user_data in test_users:
            # Check if user already exists
            result = await session.execute(
                select(User).where(User.email == user_data["email"])
            )
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                print(f"⚠️  User already exists: {user_data['email']}")
                created_users.append({
                    "email": user_data["email"],
                    "password": user_data["password"],
                    "role": user_data["role"],
                    "status": "existing"
                })
                continue
            
            # Create new user
            password = user_data.pop("password")
            user = User(
                organization_id=org.id,
                password_hash=pwd_context.hash(password),
                **user_data
            )
            session.add(user)
            
            created_users.append({
                "email": user_data["email"],
                "password": password,
                "role": user_data["role"],
                "status": "created"
            })
            
            print(f"✅ Created user: {user_data['email']} (role: {user_data['role']})")
        
        await session.commit()
        
        # Print summary
        print("\n" + "="*60)
        print("🎉 TEST USER CREDENTIALS")
        print("="*60)
        print(f"\nOrganization: {org.name}")
        print(f"Organization ID: {org.id}\n")
        
        for user in created_users:
            status_icon = "🆕" if user["status"] == "created" else "♻️"
            print(f"{status_icon} {user['role'].upper()}")
            print(f"   Email: {user['email']}")
            print(f"   Password: {user['password']}")
            print()
        
        print("="*60)
        print("🌐 Access the platform at: http://localhost:3000")
        print("📚 API Documentation: http://localhost:8000/api/docs")
        print("="*60)

if __name__ == "__main__":
    asyncio.run(create_test_users())

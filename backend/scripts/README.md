# OptiBid Database Scripts

This directory contains utility scripts for database management and seeding.

## Seed Database Script

The `seed_database.py` script populates the database with sample test data for development.

### Features

- **Idempotent**: Can be run multiple times safely - skips existing data
- **Comprehensive**: Seeds all major entities (organizations, users, assets, market data)
- **Realistic Data**: Generates realistic market prices with time-based patterns

### Usage

```bash
# From the backend directory
cd backend
python scripts/seed_database.py
```

### What Gets Seeded

1. **Subscription Plans**: Trial, Basic, Professional, Enterprise
2. **Market Operators**: Indian power system operators (POSOCO, NRLDC, WRLDC, etc.)
3. **Bid Zones**: Regional bid zones (NR, WR, SR, ER, DEL, MH)
4. **Organizations**: 3 sample organizations
5. **Users**: Test users with different roles (admin, trader, analyst, viewer)
6. **Sites**: Sample energy generation sites
7. **Assets**: Solar and wind assets
8. **Market Prices**: 7 days of hourly market price data

### Test Credentials

After running the seed script, you can log in with these credentials:

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@optibid.com      | admin123   |
| Trader  | trader@optibid.com     | trader123  |
| Analyst | analyst@optibid.com    | analyst123 |
| Viewer  | viewer@optibid.com     | viewer123  |

### Requirements

- PostgreSQL database must be running
- Database connection configured in `.env` file
- All database migrations must be applied

### Troubleshooting

**Error: Database connection failed**
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in your `.env` file
- Verify database credentials

**Error: Table does not exist**
- Run database migrations first
- Check that `init_db()` completed successfully

**Script runs but no data created**
- Data may already exist (script is idempotent)
- Check logs for "already exists" messages

## Other Scripts

### seed_test_users.py

Creates a minimal set of test users for quick testing.

```bash
python scripts/seed_test_users.py
```

### seed_simple.sql

SQL-based seed script that can be run directly in PostgreSQL.

```bash
psql -U optibid -d optibid_db -f scripts/seed_simple.sql
```

## Development Tips

- Run seed script after fresh database setup
- Re-run anytime to ensure test data exists
- Safe to run in development environments
- **DO NOT** run in production!

## Adding Custom Seed Data

To add your own seed data:

1. Edit `seed_database.py`
2. Add new seed functions following the existing pattern
3. Make functions idempotent (check for existing data)
4. Call your function from `main()`
5. Test thoroughly before committing

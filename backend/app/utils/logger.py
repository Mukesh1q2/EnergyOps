"""
OptiBid Energy Platform - Utility Functions
Common utility functions for the application
"""

import logging
import os
import secrets
import string
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from uuid import UUID
import re
import json
from decimal import Decimal

def setup_logger(name: str, level: str = "INFO") -> logging.Logger:
    """Setup logger with consistent configuration"""
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    logger.setLevel(getattr(logging, level.upper()))
    return logger

def generate_random_string(length: int = 32, include_symbols: bool = False) -> str:
    """Generate a cryptographically secure random string"""
    characters = string.ascii_letters + string.digits
    if include_symbols:
        characters += "!@#$%^&*"
    
    return ''.join(secrets.choice(characters) for _ in range(length))

def validate_email(email: str) -> bool:
    """Validate email format"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password_strength(password: str) -> Dict[str, Any]:
    """Validate password strength"""
    issues = []
    score = 0
    
    # Check length
    if len(password) >= 12:
        score += 2
    elif len(password) >= 8:
        score += 1
    else:
        issues.append("Password should be at least 8 characters long")
    
    # Check uppercase letters
    if re.search(r'[A-Z]', password):
        score += 1
    else:
        issues.append("Password should contain uppercase letters")
    
    # Check lowercase letters
    if re.search(r'[a-z]', password):
        score += 1
    else:
        issues.append("Password should contain lowercase letters")
    
    # Check numbers
    if re.search(r'\d', password):
        score += 1
    else:
        issues.append("Password should contain numbers")
    
    # Check special characters
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 1
    else:
        issues.append("Password should contain special characters")
    
    # Common patterns
    common_patterns = [
        '123456', 'password', 'qwerty', 'abc123', '111111',
        'password123', 'admin', 'letmein', 'welcome'
    ]
    
    if any(pattern in password.lower() for pattern in common_patterns):
        score -= 2
        issues.append("Avoid common password patterns")
    
    # Determine strength
    if score >= 5:
        strength = "strong"
    elif score >= 3:
        strength = "medium"
    else:
        strength = "weak"
    
    return {
        "valid": len(issues) == 0,
        "strength": strength,
        "score": score,
        "issues": issues
    }

def format_currency(amount: Union[float, Decimal], currency: str = "INR") -> str:
    """Format currency amount"""
    if currency == "INR":
        return f"₹{amount:,.2f}"
    elif currency == "USD":
        return f"${amount:,.2f}"
    elif currency == "EUR":
        return f"€{amount:,.2f}"
    else:
        return f"{amount:,.2f} {currency}"

def format_number(value: Union[int, float], decimals: int = 2) -> str:
    """Format number with thousands separator"""
    return f"{value:,.{decimals}f}"

def format_percentage(value: Union[float, Decimal], decimals: int = 2) -> str:
    """Format percentage"""
    return f"{value:.{decimals}f}%"

def format_duration(seconds: int) -> str:
    """Format duration in human readable format"""
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        minutes = seconds // 60
        return f"{minutes}m"
    elif seconds < 86400:
        hours = seconds // 3600
        return f"{hours}h"
    else:
        days = seconds // 86400
        return f"{days}d"

def parse_datetime(date_string: str) -> Optional[datetime]:
    """Parse datetime string in various formats"""
    formats = [
        "%Y-%m-%d",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S.%fZ",
    ]
    
    for fmt in formats:
        try:
            return datetime.strptime(date_string, fmt)
        except ValueError:
            continue
    
    return None

def format_datetime(dt: datetime, format_type: str = "full") -> str:
    """Format datetime in various formats"""
    if format_type == "full":
        return dt.strftime("%Y-%m-%d %H:%M:%S")
    elif format_type == "date":
        return dt.strftime("%Y-%m-%d")
    elif format_type == "time":
        return dt.strftime("%H:%M:%S")
    elif format_type == "iso":
        return dt.isoformat()
    else:
        return dt.strftime("%Y-%m-%d")

def truncate_text(text: str, max_length: int = 100, suffix: str = "...") -> str:
    """Truncate text to specified length"""
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    # Remove or replace invalid characters
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    
    # Remove leading/trailing spaces and dots
    filename = filename.strip('. ')
    
    # Limit length
    if len(filename) > 255:
        name, ext = os.path.splitext(filename)
        filename = name[:250-len(ext)] + ext
    
    return filename

def deep_merge_dict(base: Dict[str, Any], update: Dict[str, Any]) -> Dict[str, Any]:
    """Deep merge two dictionaries"""
    result = base.copy()
    
    for key, value in update.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge_dict(result[key], value)
        else:
            result[key] = value
    
    return result

def safe_json_loads(json_string: str, default: Any = None) -> Any:
    """Safely parse JSON string"""
    try:
        return json.loads(json_string)
    except (json.JSONDecodeError, TypeError):
        return default

def safe_json_dumps(obj: Any, default: Any = None) -> str:
    """Safely serialize object to JSON string"""
    try:
        return json.dumps(obj)
    except (TypeError, ValueError):
        return default or "{}"

def calculate_percentage_change(old_value: Union[int, float], new_value: Union[int, float]) -> float:
    """Calculate percentage change between two values"""
    if old_value == 0:
        return 0.0 if new_value == 0 else 100.0
    
    return ((new_value - old_value) / old_value) * 100

def round_decimal(value: Union[float, Decimal], decimals: int = 2) -> Decimal:
    """Round decimal value to specified precision"""
    return round(Decimal(str(value)), decimals)

def format_mw_value(value: Union[float, Decimal]) -> str:
    """Format MW value with appropriate units"""
    if value >= 1000:
        return f"{float(value) / 1000:.2f} GW"
    else:
        return f"{float(value):.2f} MW"

def format_price_rupees(value: Union[float, Decimal]) -> str:
    """Format price in INR"""
    return f"₹{float(value):,.2f}"

def validate_uuid(uuid_string: str) -> bool:
    """Validate UUID format"""
    pattern = r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
    return re.match(pattern, uuid_string.lower()) is not None

def parse_market_type(market_type_string: str) -> str:
    """Parse and normalize market type"""
    market_types = {
        'day_ahead': ['day ahead', 'da', 'day-ahead'],
        'real_time': ['real time', 'rt', 'real-time'],
        'ancillary_services': ['ancillary', 'as', 'ancillary services'],
        'capacity': ['capacity', 'cap'],
        'renewable_energy': ['renewable', 're', 'renewable energy']
    }
    
    normalized = market_type_string.lower().strip()
    
    for standard_type, variations in market_types.items():
        if normalized in variations:
            return standard_type
    
    return normalized  # Return as-is if not found

def format_bid_status(status: str) -> str:
    """Format bid status with appropriate styling"""
    status_formatters = {
        'draft': {'text': 'Draft', 'class': 'bg-gray-100 text-gray-800'},
        'pending': {'text': 'Pending', 'class': 'bg-yellow-100 text-yellow-800'},
        'submitted': {'text': 'Submitted', 'class': 'bg-blue-100 text-blue-800'},
        'accepted': {'text': 'Accepted', 'class': 'bg-green-100 text-green-800'},
        'rejected': {'text': 'Rejected', 'class': 'bg-red-100 text-red-800'},
        'expired': {'text': 'Expired', 'class': 'bg-gray-100 text-gray-600'},
        'cancelled': {'text': 'Cancelled', 'class': 'bg-red-100 text-red-700'}
    }
    
    return status_formatters.get(
        status.lower(),
        {'text': status.title(), 'class': 'bg-gray-100 text-gray-800'}
    )

def calculate_time_ago(timestamp: datetime) -> str:
    """Calculate time ago from timestamp"""
    now = datetime.utcnow()
    diff = now - timestamp
    
    if diff.days > 30:
        return timestamp.strftime("%Y-%m-%d")
    elif diff.days > 0:
        return f"{diff.days} day{'s' if diff.days > 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours > 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes > 1 else ''} ago"
    else:
        return "Just now"

# Business logic utilities
def calculate_revenue_rupees(quantity_mw: Union[float, Decimal], price_rupees: Union[float, Decimal]) -> Decimal:
    """Calculate revenue from quantity and price"""
    return round_decimal(quantity_mw * price_rupees)

def estimate_bid_acceptance_probability(
    price_rupees: Union[float, Decimal],
    market_prices: List[Union[float, Decimal]]
) -> float:
    """Estimate bid acceptance probability based on market prices"""
    if not market_prices:
        return 0.5  # 50% if no data
    
    avg_market_price = sum(market_prices) / len(market_prices)
    
    if price_rupees < avg_market_price * 0.9:
        return 0.9  # High probability
    elif price_rupees < avg_market_price:
        return 0.7  # Good probability
    elif price_rupees < avg_market_price * 1.1:
        return 0.4  # Medium probability
    else:
        return 0.2  # Low probability

def validate_bid_parameters(
    quantity_mw: Union[float, Decimal],
    price_rupees: Union[float, Decimal],
    delivery_start: datetime,
    delivery_end: datetime
) -> List[str]:
    """Validate bid parameters and return list of issues"""
    issues = []
    
    # Quantity validation
    if quantity_mw <= 0:
        issues.append("Quantity must be positive")
    elif quantity_mw > 10000:  # Arbitrary large limit
        issues.append("Quantity is unrealistically large")
    
    # Price validation
    if price_rupees < 0:
        issues.append("Price cannot be negative")
    elif price_rupees > 50000:  # Arbitrary high limit for INR
        issues.append("Price is unrealistically high")
    
    # Time validation
    if delivery_start >= delivery_end:
        issues.append("Delivery start time must be before end time")
    
    if delivery_start < datetime.utcnow():
        issues.append("Delivery start time cannot be in the past")
    
    max_future_days = 365  # Allow bids up to 1 year in advance
    if delivery_start > datetime.utcnow() + timedelta(days=max_future_days):
        issues.append(f"Delivery start time cannot be more than {max_future_days} days in the future")
    
    return issues

# Export all utility functions
__all__ = [
    'setup_logger',
    'generate_random_string',
    'validate_email',
    'validate_password_strength',
    'format_currency',
    'format_number',
    'format_percentage',
    'format_duration',
    'parse_datetime',
    'format_datetime',
    'truncate_text',
    'sanitize_filename',
    'deep_merge_dict',
    'safe_json_loads',
    'safe_json_dumps',
    'calculate_percentage_change',
    'round_decimal',
    'format_mw_value',
    'format_price_rupees',
    'validate_uuid',
    'parse_market_type',
    'format_bid_status',
    'calculate_time_ago',
    'calculate_revenue_rupees',
    'estimate_bid_acceptance_probability',
    'validate_bid_parameters'
]

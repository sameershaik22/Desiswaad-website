import os
import requests
import json
from datetime import datetime, timedelta
from app.models.models import Order
from typing import Dict, Any

DELHIVERY_API_KEY = os.getenv("DELHIVERY_API_KEY", "")
DELHIVERY_API_URL = "https://track.delhivery.com/api/cmu/create.json"

def assign_delivery_partner(order: Order) -> Dict[str, Any]:
    """
    Assigns the order to Delhivery.
    Returns a dictionary with tracking details on success, or raises an Exception on failure.
    """
    if not DELHIVERY_API_KEY or DELHIVERY_API_KEY == "your_delhivery_api_key_here":
        # Mock successful assignment if API key is not configured (for dev/testing)
        print(f"[Delhivery] WARNING: No API key configured. Mocking assignment for {order.id}.")
        return {
            "partner": "Delhivery",
            "awb_number": f"DLV{order.id.replace('DS', '')}",
            "tracking_number": f"DLV{order.id.replace('DS', '')}",
            "expected_delivery_date": datetime.now() + timedelta(days=3)
        }

    # Prepare payload for Delhivery
    payload = {
        "pickup_location": {
            "name": "DesiSwad Foods",
            "city": os.getenv("PICKUP_CITY", "Hyderabad"),
            "pin": os.getenv("PICKUP_PINCODE", "500001"),
            "country": "India",
            "phone": os.getenv("PICKUP_PHONE", "9999999999"),
            "add": os.getenv("PICKUP_ADDRESS", "DesiSwad Kitchen, Hyderabad")
        },
        "shipments": [
            {
                "name": order.customer_name,
                "add": order.address,
                "pin": order.pincode,
                "city": order.city,
                "state": order.state,
                "country": "India",
                "phone": order.phone,
                "order": order.id,
                "payment_mode": "Pre-paid" if order.payment_mode.upper() != "COD" else "COD",
                "cod_amount": float(order.total) if order.payment_mode.upper() == "COD" else 0.0,
                "return_pin": os.getenv("PICKUP_PINCODE", "500001"),
                "return_city": os.getenv("PICKUP_CITY", "Hyderabad"),
                "return_phone": os.getenv("PICKUP_PHONE", "9999999999"),
                "return_add": os.getenv("PICKUP_ADDRESS", "DesiSwad Kitchen, Hyderabad"),
                "return_state": os.getenv("PICKUP_STATE", "Telangana"),
                "return_country": "India"
            }
        ]
    }

    headers = {
        "Authorization": f"Token {DELHIVERY_API_KEY}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    # The modern Delhivery API requires urlencoded data string with format=json
    data_str = "format=json&data=" + json.dumps(payload)
    
    headers_urlencoded = {
        "Authorization": f"Token {DELHIVERY_API_KEY}",
        "Content-Type": "application/x-www-form-urlencoded"
    }

    try:
        response = requests.post(DELHIVERY_API_URL, data=data_str, headers=headers_urlencoded, timeout=10)
        
        if response.status_code == 200 or response.status_code == 201:
            res_data = response.json()
            if res_data.get("success") == False:
                raise Exception(f"Delhivery Error: {res_data.get('error') or res_data.get('rmk')}")
                
            # Extract AWB
            packages = res_data.get("packages", [])
            if not packages:
                raise Exception("Delhivery did not return any packages.")
                
            awb = packages[0].get("waybill")
            if not awb:
                raise Exception("Delhivery did not return a waybill/AWB number.")
                
            return {
                "partner": "Delhivery",
                "awb_number": awb,
                "tracking_number": awb,
                "expected_delivery_date": datetime.now() + timedelta(days=3) # Defaulting to 3 days
            }
        else:
            raise Exception(f"Delhivery HTTP {response.status_code}: {response.text}")

    except Exception as e:
        print(f"[Delhivery] Integration Error: {e}")
        raise e

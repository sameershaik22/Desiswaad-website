import os
import razorpay
from dotenv import load_dotenv

load_dotenv(dotenv_path="c:/Users/samee/OneDrive/Desktop/website/.env.local")

key_id = os.getenv("RAZORPAY_KEY_ID")
secret = os.getenv("RAZORPAY_KEY_SECRET")

print(f"Testing with Key ID: {key_id}")

try:
    client = razorpay.Client(auth=(key_id, secret))
    # Try creating a 1 INR test order
    data = {
        "amount": 100, # 100 paise = 1 INR
        "currency": "INR",
        "receipt": "test_receipt_1"
    }
    order = client.order.create(data=data)
    print("SUCCESS! Created order:", order['id'])
except Exception as e:
    print("RAZORPAY API ERROR:", str(e))

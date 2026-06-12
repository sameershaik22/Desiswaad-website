import requests

url = "http://localhost:5000/api/payment/create-order"
payload = {"amount": 159, "receipt": "DS_test_123"}
response = requests.post(url, json=payload)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")

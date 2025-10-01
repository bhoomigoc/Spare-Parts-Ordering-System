#!/usr/bin/env python3
"""
Verify the exact order structure from the review request
"""

import requests
import json

BACKEND_URL = "https://quickparts-1.preview.emergentagent.com/api"

def test_exact_order_structure():
    """Test the exact order structure from the review request"""
    
    # First, get a sample part ID
    machines_response = requests.get(f"{BACKEND_URL}/machines")
    machines = machines_response.json()
    
    if not machines:
        print("❌ No machines found")
        return False
    
    parts_response = requests.get(f"{BACKEND_URL}/machines/{machines[0]['id']}/parts")
    parts = parts_response.json()
    
    if not parts:
        print("❌ No parts found")
        return False
    
    sample_part = parts[0]
    
    # Use the exact order data structure from the review request
    order_data = {
        "customer_info": {
            "name": "Test Company Ltd",
            "company": "Test Company Ltd", 
            "phone": "9876543210",
            "email": "test@example.com",
            "gst_number": "ABC123DEF456789",
            "delivery_address": "123 Test Street, Test City, Test State - 123456"
        },
        "items": [
            {
                "part_id": sample_part["id"],  # Use real part ID
                "part_name": "Oil Filter",
                "part_code": "UNI-FLT-002", 
                "machine_name": "Tractor",
                "quantity": 2,
                "price": 450.0,
                "comment": "High quality filter needed"
            }
        ],
        "total_amount": 900.0
    }
    
    print("Testing exact order structure from review request...")
    print(f"Using part ID: {sample_part['id']}")
    
    response = requests.post(f"{BACKEND_URL}/orders", json=order_data)
    
    if response.status_code == 200:
        order = response.json()
        print("✅ Order created successfully!")
        print(f"Order ID: {order['id']}")
        print(f"Customer GST: {order['customer_info'].get('gst_number')}")
        print(f"Delivery Address: {order['customer_info'].get('delivery_address')}")
        print(f"Items count: {len(order['items'])}")
        print(f"Total amount: {order['total_amount']}")
        
        # Verify no subcategory_name in items
        item = order['items'][0]
        if 'subcategory_name' not in item:
            print("✅ OrderItem correctly works without subcategory_name field")
        else:
            print("ℹ️ OrderItem has subcategory_name but it's not required")
        
        return True
    else:
        print(f"❌ Order creation failed: {response.status_code}")
        print(f"Error: {response.text}")
        return False

if __name__ == "__main__":
    test_exact_order_structure()
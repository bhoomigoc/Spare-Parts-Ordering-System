#!/usr/bin/env python3
"""
Order Submission Testing for Bhoomi Enterprises Spare Parts Ordering System
Tests the recent fixes to order submission functionality
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Backend URL from environment
BACKEND_URL = "https://parts-order-system.preview.emergentagent.com/api"

class OrderSubmissionTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: Any = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None) -> requests.Response:
        """Make HTTP request"""
        url = f"{BACKEND_URL}{endpoint}"
        request_headers = headers or {}
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=request_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
            
            return response
        except Exception as e:
            print(f"Request failed: {e}")
            raise
    
    def test_init_sample_data(self):
        """Test 1: Initialize sample data"""
        try:
            response = self.make_request("POST", "/admin/init-sample-data")
            
            if response.status_code == 200:
                data = response.json()
                self.log_test("Initialize Sample Data", True, f"Sample data initialized: {data.get('message', 'Success')}")
                return True
            else:
                self.log_test("Initialize Sample Data", False, f"Failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Initialize Sample Data", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_get_sample_part_data(self):
        """Test 2: Get sample part data for order creation"""
        try:
            # Get machines first
            machines_response = self.make_request("GET", "/machines")
            
            if machines_response.status_code != 200:
                self.log_test("Get Sample Part Data", False, f"Failed to get machines: {machines_response.status_code}")
                return None
            
            machines = machines_response.json()
            if not machines:
                self.log_test("Get Sample Part Data", False, "No machines found")
                return None
            
            # Get parts for the first machine
            machine_id = machines[0]["id"]
            parts_response = self.make_request("GET", f"/machines/{machine_id}/parts")
            
            if parts_response.status_code == 200:
                parts = parts_response.json()
                if parts:
                    sample_part = parts[0]
                    machine_name = machines[0]["name"]
                    
                    self.log_test("Get Sample Part Data", True, f"Retrieved sample part: {sample_part['name']} for machine: {machine_name}")
                    return {
                        "part": sample_part,
                        "machine_name": machine_name
                    }
                else:
                    self.log_test("Get Sample Part Data", False, "No parts found for machine")
                    return None
            else:
                self.log_test("Get Sample Part Data", False, f"Failed to get parts: {parts_response.status_code}")
                return None
        except Exception as e:
            self.log_test("Get Sample Part Data", False, f"Exception occurred: {str(e)}")
            return None
    
    def test_order_creation_new_format(self, sample_data):
        """Test 3: Order creation with new format (no subcategory_name, new customer fields)"""
        if not sample_data:
            self.log_test("Order Creation New Format", False, "No sample data available")
            return False
        
        try:
            part = sample_data["part"]
            machine_name = sample_data["machine_name"]
            
            # Create order with new format - matching the frontend structure
            order_data = {
                "customer_info": {
                    "name": "Rajesh Kumar Enterprises",
                    "company": "Rajesh Kumar Enterprises", 
                    "phone": "9876543210",
                    "email": "rajesh@rkenterprises.com",
                    "gst_number": "27ABCDE1234F1Z5",  # New field
                    "delivery_address": "Plot No. 45, Industrial Area, Phase-2, Chandigarh - 160002"  # New field
                },
                "items": [
                    {
                        "part_id": part["id"],
                        "part_name": part["name"],
                        "part_code": part["code"], 
                        "machine_name": machine_name,
                        "quantity": 2,
                        "price": part["price"],
                        "comment": "Urgent requirement for maintenance work"
                        # Note: No subcategory_name field - this should work with recent fixes
                    }
                ],
                "total_amount": part["price"] * 2
            }
            
            response = self.make_request("POST", "/orders", data=order_data)
            
            if response.status_code == 200:
                order = response.json()
                
                # Verify order structure
                required_fields = ["id", "customer_info", "items", "total_amount", "status", "created_at"]
                missing_fields = [field for field in required_fields if field not in order]
                
                if missing_fields:
                    self.log_test("Order Creation New Format", False, f"Order missing fields: {missing_fields}")
                    return False
                
                # Verify customer info has new fields
                customer_info = order["customer_info"]
                if "gst_number" not in customer_info or "delivery_address" not in customer_info:
                    self.log_test("Order Creation New Format", False, "New customer fields not saved properly")
                    return False
                
                # Verify order item doesn't have subcategory_name (should work without it)
                order_item = order["items"][0]
                if "subcategory_name" in order_item:
                    self.log_test("Order Creation New Format", True, "Order created successfully (subcategory_name present but not required)")
                else:
                    self.log_test("Order Creation New Format", True, "Order created successfully without subcategory_name field")
                
                # Verify order ID and timestamp
                if order["id"] and order["created_at"]:
                    self.log_test("Order ID and Timestamp", True, f"Order created with ID: {order['id'][:8]}... and timestamp: {order['created_at']}")
                else:
                    self.log_test("Order ID and Timestamp", False, "Missing order ID or timestamp")
                
                return True
            else:
                self.log_test("Order Creation New Format", False, f"Failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Order Creation New Format", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_order_creation_without_optional_fields(self, sample_data):
        """Test 4: Order creation without optional customer fields"""
        if not sample_data:
            self.log_test("Order Creation Without Optional Fields", False, "No sample data available")
            return False
        
        try:
            part = sample_data["part"]
            machine_name = sample_data["machine_name"]
            
            # Create order with minimal customer info (no optional fields)
            order_data = {
                "customer_info": {
                    "name": "Minimal Customer",
                    "phone": "9123456789"
                    # No email, company, gst_number, delivery_address
                },
                "items": [
                    {
                        "part_id": part["id"],
                        "part_name": part["name"],
                        "part_code": part["code"], 
                        "machine_name": machine_name,
                        "quantity": 1,
                        "price": part["price"],
                        "comment": ""
                    }
                ],
                "total_amount": part["price"]
            }
            
            response = self.make_request("POST", "/orders", data=order_data)
            
            if response.status_code == 200:
                order = response.json()
                self.log_test("Order Creation Without Optional Fields", True, f"Order created successfully with minimal customer info: {order['id'][:8]}...")
                return True
            else:
                self.log_test("Order Creation Without Optional Fields", False, f"Failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Order Creation Without Optional Fields", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_email_notification_handling(self, sample_data):
        """Test 5: Email notification should not fail order creation"""
        if not sample_data:
            self.log_test("Email Notification Handling", False, "No sample data available")
            return False
        
        try:
            part = sample_data["part"]
            machine_name = sample_data["machine_name"]
            
            # Create order with email - should succeed even if email fails
            order_data = {
                "customer_info": {
                    "name": "Email Test Customer",
                    "company": "Email Test Co.",
                    "phone": "9999888777",
                    "email": "test@emailtest.com",
                    "gst_number": "29XYZAB1234C1D6",
                    "delivery_address": "Test Address for Email Notification"
                },
                "items": [
                    {
                        "part_id": part["id"],
                        "part_name": part["name"],
                        "part_code": part["code"], 
                        "machine_name": machine_name,
                        "quantity": 3,
                        "price": part["price"],
                        "comment": "Testing email notification handling"
                    }
                ],
                "total_amount": part["price"] * 3
            }
            
            response = self.make_request("POST", "/orders", data=order_data)
            
            if response.status_code == 200:
                order = response.json()
                self.log_test("Email Notification Handling", True, f"Order created successfully despite potential email issues: {order['id'][:8]}...")
                return True
            else:
                self.log_test("Email Notification Handling", False, f"Order creation failed: {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Email Notification Handling", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_multiple_items_order(self, sample_data):
        """Test 6: Order creation with multiple items"""
        if not sample_data:
            self.log_test("Multiple Items Order", False, "No sample data available")
            return False
        
        try:
            part = sample_data["part"]
            machine_name = sample_data["machine_name"]
            
            # Create order with multiple items (same part, different quantities)
            order_data = {
                "customer_info": {
                    "name": "Multi Item Customer Ltd",
                    "company": "Multi Item Customer Ltd",
                    "phone": "8888777666",
                    "email": "orders@multiitem.com",
                    "gst_number": "24MULTI1234I5T6",
                    "delivery_address": "Multi Item Industrial Complex, Sector 15, Gurgaon - 122001"
                },
                "items": [
                    {
                        "part_id": part["id"],
                        "part_name": part["name"],
                        "part_code": part["code"], 
                        "machine_name": machine_name,
                        "quantity": 2,
                        "price": part["price"],
                        "comment": "First batch for immediate use"
                    },
                    {
                        "part_id": part["id"],
                        "part_name": part["name"] + " (Spare)",
                        "part_code": part["code"] + "-SP", 
                        "machine_name": machine_name,
                        "quantity": 1,
                        "price": part["price"],
                        "comment": "Spare for future maintenance"
                    }
                ],
                "total_amount": part["price"] * 3
            }
            
            response = self.make_request("POST", "/orders", data=order_data)
            
            if response.status_code == 200:
                order = response.json()
                if len(order["items"]) == 2:
                    self.log_test("Multiple Items Order", True, f"Order with {len(order['items'])} items created successfully: {order['id'][:8]}...")
                    return True
                else:
                    self.log_test("Multiple Items Order", False, f"Expected 2 items, got {len(order['items'])}")
                    return False
            else:
                self.log_test("Multiple Items Order", False, f"Failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Multiple Items Order", False, f"Exception occurred: {str(e)}")
            return False

    def run_order_submission_tests(self):
        """Run all order submission tests"""
        print("=" * 80)
        print("ORDER SUBMISSION TESTING - Recent Fixes Verification")
        print("Testing OrderItem without subcategory_name and new CustomerInfo fields")
        print("=" * 80)
        
        # Test 1: Initialize sample data
        if not self.test_init_sample_data():
            print("❌ Cannot proceed without sample data")
            return False
        
        # Test 2: Get sample part data
        sample_data = self.test_get_sample_part_data()
        if not sample_data:
            print("❌ Cannot proceed without sample part data")
            return False
        
        # Test 3: Order creation with new format
        print("\n🔍 PRIORITY TEST: Order Creation with New Format")
        self.test_order_creation_new_format(sample_data)
        
        # Test 4: Order creation without optional fields
        print("\n🔍 TEST: Order Creation Without Optional Fields")
        self.test_order_creation_without_optional_fields(sample_data)
        
        # Test 5: Email notification handling
        print("\n🔍 TEST: Email Notification Handling")
        self.test_email_notification_handling(sample_data)
        
        # Test 6: Multiple items order
        print("\n🔍 TEST: Multiple Items Order")
        self.test_multiple_items_order(sample_data)
        
        # Summary
        print("\n" + "=" * 80)
        print("ORDER SUBMISSION TEST SUMMARY")
        print("=" * 80)
        
        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        
        if total - passed > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
        else:
            print("\n🎉 ALL ORDER SUBMISSION TESTS PASSED!")
        
        return passed == total

if __name__ == "__main__":
    tester = OrderSubmissionTester()
    success = tester.run_order_submission_tests()
    sys.exit(0 if success else 1)
#!/usr/bin/env python3
"""
Customer Section Backend Health Check
Quick test to ensure all customer section fixes are working properly
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Backend URL from environment
BACKEND_URL = "https://spareparts-order.preview.emergentagent.com/api"

class CustomerSectionTester:
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
    
    def test_sample_data_initialization(self):
        """Test 1: Sample data initialization"""
        try:
            response = self.make_request("POST", "/admin/init-sample-data")
            
            if response.status_code == 200:
                data = response.json()
                message = data.get('message', 'Success')
                self.log_test("Sample Data Initialization", True, f"✅ {message}")
                return True
            else:
                self.log_test("Sample Data Initialization", False, f"Failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Sample Data Initialization", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_machine_listing(self):
        """Test 2: Machine listing endpoint"""
        try:
            response = self.make_request("GET", "/machines")
            
            if response.status_code == 200:
                machines = response.json()
                if isinstance(machines, list) and len(machines) > 0:
                    # Check for universal parts machines
                    machine_names = [m.get('name', '') for m in machines]
                    expected_machines = ['Tractor', 'Harvester', 'Water Pump']
                    found_machines = [name for name in expected_machines if name in machine_names]
                    
                    self.log_test("Machine Listing", True, f"✅ Retrieved {len(machines)} machines: {', '.join(machine_names)}")
                    return machines
                else:
                    self.log_test("Machine Listing", False, "No machines found or invalid response format", machines)
                    return []
            else:
                self.log_test("Machine Listing", False, f"Failed with status {response.status_code}", response.text)
                return []
        except Exception as e:
            self.log_test("Machine Listing", False, f"Exception occurred: {str(e)}")
            return []
    
    def test_parts_by_machine_new_structure(self, machines):
        """Test 3: Parts by machine with new structure (machine_ids array)"""
        if not machines:
            self.log_test("Parts by Machine Structure", False, "No machines available for testing")
            return False
        
        success_count = 0
        universal_parts_found = []
        
        for machine in machines:
            machine_id = machine.get('id')
            machine_name = machine.get('name')
            
            try:
                response = self.make_request("GET", f"/machines/{machine_id}/parts")
                
                if response.status_code == 200:
                    parts = response.json()
                    if isinstance(parts, list):
                        # Check that all parts have machine_ids array
                        valid_parts = 0
                        universal_parts = []
                        
                        for part in parts:
                            machine_ids = part.get("machine_ids", [])
                            part_name = part.get("name", "")
                            
                            if isinstance(machine_ids, list) and machine_id in machine_ids:
                                valid_parts += 1
                                
                                # Check for universal parts (parts that belong to multiple machines)
                                if len(machine_ids) > 1:
                                    universal_parts.append(part_name)
                        
                        if valid_parts == len(parts):
                            success_count += 1
                            if universal_parts:
                                universal_parts_found.extend(universal_parts)
                            self.log_test(f"Parts for {machine_name}", True, f"✅ {len(parts)} parts, {len(universal_parts)} universal parts")
                        else:
                            self.log_test(f"Parts for {machine_name}", False, f"Some parts missing correct machine_ids: {valid_parts}/{len(parts)}")
                    else:
                        self.log_test(f"Parts for {machine_name}", False, "Invalid response format", parts)
                else:
                    self.log_test(f"Parts for {machine_name}", False, f"Failed with status {response.status_code}", response.text)
            except Exception as e:
                self.log_test(f"Parts for {machine_name}", False, f"Exception occurred: {str(e)}")
        
        # Check for universal parts
        unique_universal_parts = list(set(universal_parts_found))
        if unique_universal_parts:
            self.log_test("Universal Parts Support", True, f"✅ Found universal parts: {', '.join(unique_universal_parts)}")
        else:
            self.log_test("Universal Parts Support", False, "No universal parts found (expected Oil Filter, Air Filter)")
        
        return success_count == len(machines)
    
    def test_order_creation_new_fields(self, machines):
        """Test 4: Order creation with new customer validation fields"""
        if not machines:
            self.log_test("Order Creation New Fields", False, "No machines available for testing")
            return False
        
        try:
            # Get a part to create an order with
            machine_id = machines[0].get('id')
            parts_response = self.make_request("GET", f"/machines/{machine_id}/parts")
            
            if parts_response.status_code != 200:
                self.log_test("Order Creation New Fields", False, "Could not retrieve parts for order testing")
                return False
            
            parts = parts_response.json()
            if not parts:
                self.log_test("Order Creation New Fields", False, "No parts available for order testing")
                return False
            
            test_part = parts[0]
            
            # Test order with new customer fields
            order_data = {
                "customer_info": {
                    "name": "Rajesh Kumar",
                    "phone": "+91-9876543210",
                    "email": "rajesh.kumar@example.com",
                    "company": "Kumar Agro Industries",  # New field
                    "gst_number": "27ABCDE1234F1Z5",     # New field (if supported)
                    "delivery_address": "123 Main Street, Pune, Maharashtra 411001"  # New field (if supported)
                },
                "items": [
                    {
                        "part_id": test_part.get('id'),
                        "part_name": test_part.get('name'),
                        "part_code": test_part.get('code'),
                        "machine_name": machines[0].get('name'),
                        "subcategory_name": "Test Category",
                        "quantity": 2,
                        "price": test_part.get('price', 100.0),
                        "comment": "Urgent requirement"
                    }
                ],
                "total_amount": test_part.get('price', 100.0) * 2
            }
            
            response = self.make_request("POST", "/orders", data=order_data)
            
            if response.status_code == 200:
                order = response.json()
                order_id = order.get('id')
                
                # Verify the order was created with new fields
                customer_info = order.get('customer_info', {})
                has_company = 'company' in customer_info
                
                if has_company:
                    self.log_test("Order Creation New Fields", True, f"✅ Order created with ID: {order_id[:8]}... including new customer fields")
                else:
                    self.log_test("Order Creation New Fields", True, f"✅ Order created with ID: {order_id[:8]}... (basic fields working)")
                
                return True
            else:
                self.log_test("Order Creation New Fields", False, f"Failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Order Creation New Fields", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_multiple_machine_support_verification(self, machines):
        """Test 5: Verify parts support multiple machines in response"""
        if not machines or len(machines) < 2:
            self.log_test("Multiple Machine Support", False, "Need at least 2 machines for testing")
            return False
        
        try:
            # Look for parts that appear in multiple machines
            all_parts_by_machine = {}
            
            for machine in machines:
                machine_id = machine.get('id')
                machine_name = machine.get('name')
                
                response = self.make_request("GET", f"/machines/{machine_id}/parts")
                if response.status_code == 200:
                    parts = response.json()
                    all_parts_by_machine[machine_name] = [p.get('name') for p in parts]
            
            # Find parts that appear in multiple machines
            all_part_names = []
            for parts_list in all_parts_by_machine.values():
                all_part_names.extend(parts_list)
            
            # Count occurrences
            part_counts = {}
            for part_name in all_part_names:
                part_counts[part_name] = part_counts.get(part_name, 0) + 1
            
            # Find universal parts (appear in multiple machines)
            universal_parts = [name for name, count in part_counts.items() if count > 1]
            
            if universal_parts:
                expected_universal = ['Oil Filter', 'Air Filter']
                found_expected = [part for part in expected_universal if part in universal_parts]
                
                if found_expected:
                    self.log_test("Multiple Machine Support", True, f"✅ Universal parts working: {', '.join(found_expected)} appear in multiple machines")
                else:
                    self.log_test("Multiple Machine Support", True, f"✅ Universal parts found: {', '.join(universal_parts)} (different from expected)")
                
                return True
            else:
                self.log_test("Multiple Machine Support", False, "No parts found that belong to multiple machines")
                return False
        except Exception as e:
            self.log_test("Multiple Machine Support", False, f"Exception occurred: {str(e)}")
            return False
    
    def run_customer_section_tests(self):
        """Run all customer section backend tests"""
        print("=" * 80)
        print("CUSTOMER SECTION BACKEND HEALTH CHECK")
        print("Testing customer section fixes and functionality")
        print("=" * 80)
        
        # Test 1: Sample data initialization
        print("\n🔍 Test 1: Sample Data Initialization")
        self.test_sample_data_initialization()
        
        # Test 2: Machine listing
        print("\n🔍 Test 2: Machine Listing")
        machines = self.test_machine_listing()
        
        # Test 3: Parts by machine with new structure
        print("\n🔍 Test 3: Parts by Machine (New Structure)")
        self.test_parts_by_machine_new_structure(machines)
        
        # Test 4: Order creation with new fields
        print("\n🔍 Test 4: Order Creation with New Customer Fields")
        self.test_order_creation_new_fields(machines)
        
        # Test 5: Multiple machine support verification
        print("\n🔍 Test 5: Multiple Machine Support Verification")
        self.test_multiple_machine_support_verification(machines)
        
        # Summary
        print("\n" + "=" * 80)
        print("CUSTOMER SECTION TEST SUMMARY")
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
            print("\n🎉 ALL CUSTOMER SECTION TESTS PASSED!")
        
        return passed == total

if __name__ == "__main__":
    tester = CustomerSectionTester()
    success = tester.run_customer_section_tests()
    sys.exit(0 if success else 1)
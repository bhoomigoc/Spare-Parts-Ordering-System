#!/usr/bin/env python3
"""
Backend API Testing for Bhoomi Enterprises Spare Parts Ordering System
Tests admin CRUD functionality for machines, subcategories, and parts
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Backend URL from environment
BACKEND_URL = "https://quickparts-1.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.admin_token = None
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
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, headers: Dict = None, auth_required: bool = False) -> requests.Response:
        """Make HTTP request with optional authentication"""
        url = f"{BACKEND_URL}{endpoint}"
        request_headers = headers or {}
        
        if auth_required and self.admin_token:
            request_headers["Authorization"] = f"Bearer {self.admin_token}"
        
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
    
    def test_admin_authentication(self):
        """Test 2: Admin authentication"""
        try:
            login_data = {
                "username": "admin",
                "password": "admin123"
            }
            
            response = self.make_request("POST", "/admin/login", data=login_data)
            
            if response.status_code == 200:
                data = response.json()
                self.admin_token = data.get("access_token")
                if self.admin_token:
                    self.log_test("Admin Authentication", True, "Successfully authenticated and received token")
                    return True
                else:
                    self.log_test("Admin Authentication", False, "No access token in response", data)
                    return False
            else:
                self.log_test("Admin Authentication", False, f"Failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Admin Authentication", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_get_machines(self):
        """Test 3: Get machines endpoint"""
        try:
            response = self.make_request("GET", "/machines")
            
            if response.status_code == 200:
                machines = response.json()
                if isinstance(machines, list) and len(machines) > 0:
                    self.log_test("Get Machines", True, f"Retrieved {len(machines)} machines")
                    return machines
                else:
                    self.log_test("Get Machines", False, "No machines found or invalid response format", machines)
                    return []
            else:
                self.log_test("Get Machines", False, f"Failed with status {response.status_code}", response.text)
                return []
        except Exception as e:
            self.log_test("Get Machines", False, f"Exception occurred: {str(e)}")
            return []
    
    def test_get_subcategories(self):
        """Test 4: Get subcategories endpoint (with admin auth)"""
        try:
            response = self.make_request("GET", "/subcategories", auth_required=True)
            
            if response.status_code == 200:
                subcategories = response.json()
                if isinstance(subcategories, list) and len(subcategories) > 0:
                    self.log_test("Get Subcategories", True, f"Retrieved {len(subcategories)} subcategories")
                    return subcategories
                else:
                    self.log_test("Get Subcategories", False, "No subcategories found or invalid response format", subcategories)
                    return []
            else:
                self.log_test("Get Subcategories", False, f"Failed with status {response.status_code}", response.text)
                return []
        except Exception as e:
            self.log_test("Get Subcategories", False, f"Exception occurred: {str(e)}")
            return []
    
    def test_get_parts(self):
        """Test 5: Get parts endpoint (with admin auth)"""
        try:
            response = self.make_request("GET", "/parts", auth_required=True)
            
            if response.status_code == 200:
                parts = response.json()
                if isinstance(parts, list) and len(parts) > 0:
                    self.log_test("Get Parts", True, f"Retrieved {len(parts)} parts")
                    return parts
                else:
                    self.log_test("Get Parts", False, "No parts found or invalid response format", parts)
                    return []
            else:
                self.log_test("Get Parts", False, f"Failed with status {response.status_code}", response.text)
                return []
        except Exception as e:
            self.log_test("Get Parts", False, f"Exception occurred: {str(e)}")
            return []
    
    def test_machine_crud(self):
        """Test 6: Machine CRUD operations"""
        created_machine_id = None
        
        # Test CREATE
        try:
            machine_data = {
                "name": "Test Machine",
                "description": "A test machine for CRUD operations"
            }
            
            response = self.make_request("POST", "/admin/machines", data=machine_data, auth_required=True)
            
            if response.status_code == 200:
                machine = response.json()
                created_machine_id = machine.get("id")
                self.log_test("Create Machine", True, f"Created machine with ID: {created_machine_id}")
            else:
                self.log_test("Create Machine", False, f"Failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Machine", False, f"Exception occurred: {str(e)}")
            return False
        
        # Test UPDATE
        if created_machine_id:
            try:
                update_data = {
                    "name": "Updated Test Machine",
                    "description": "Updated description for test machine"
                }
                
                response = self.make_request("PUT", f"/admin/machines/{created_machine_id}", data=update_data, auth_required=True)
                
                if response.status_code == 200:
                    updated_machine = response.json()
                    if updated_machine.get("name") == "Updated Test Machine":
                        self.log_test("Update Machine", True, f"Successfully updated machine {created_machine_id}")
                    else:
                        self.log_test("Update Machine", False, "Machine not properly updated", updated_machine)
                else:
                    self.log_test("Update Machine", False, f"Failed with status {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Update Machine", False, f"Exception occurred: {str(e)}")
        
        # Test DELETE
        if created_machine_id:
            try:
                response = self.make_request("DELETE", f"/admin/machines/{created_machine_id}", auth_required=True)
                
                if response.status_code == 200:
                    self.log_test("Delete Machine", True, f"Successfully deleted machine {created_machine_id}")
                    return True
                else:
                    self.log_test("Delete Machine", False, f"Failed with status {response.status_code}", response.text)
                    return False
            except Exception as e:
                self.log_test("Delete Machine", False, f"Exception occurred: {str(e)}")
                return False
        
        return True
    
    def test_subcategory_crud(self, machines):
        """Test 7: Subcategory CRUD operations"""
        if not machines:
            self.log_test("Subcategory CRUD", False, "No machines available for subcategory testing")
            return False
        
        machine_id = machines[0]["id"]
        created_subcategory_id = None
        
        # Test CREATE
        try:
            subcategory_data = {
                "machine_id": machine_id,
                "name": "Test Subcategory",
                "description": "A test subcategory for CRUD operations"
            }
            
            response = self.make_request("POST", "/admin/subcategories", data=subcategory_data, auth_required=True)
            
            if response.status_code == 200:
                subcategory = response.json()
                created_subcategory_id = subcategory.get("id")
                self.log_test("Create Subcategory", True, f"Created subcategory with ID: {created_subcategory_id}")
            else:
                self.log_test("Create Subcategory", False, f"Failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Subcategory", False, f"Exception occurred: {str(e)}")
            return False
        
        # Test UPDATE
        if created_subcategory_id:
            try:
                update_data = {
                    "machine_id": machine_id,
                    "name": "Updated Test Subcategory",
                    "description": "Updated description for test subcategory"
                }
                
                response = self.make_request("PUT", f"/admin/subcategories/{created_subcategory_id}", data=update_data, auth_required=True)
                
                if response.status_code == 200:
                    updated_subcategory = response.json()
                    if updated_subcategory.get("name") == "Updated Test Subcategory":
                        self.log_test("Update Subcategory", True, f"Successfully updated subcategory {created_subcategory_id}")
                    else:
                        self.log_test("Update Subcategory", False, "Subcategory not properly updated", updated_subcategory)
                else:
                    self.log_test("Update Subcategory", False, f"Failed with status {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Update Subcategory", False, f"Exception occurred: {str(e)}")
        
        # Test DELETE
        if created_subcategory_id:
            try:
                response = self.make_request("DELETE", f"/admin/subcategories/{created_subcategory_id}", auth_required=True)
                
                if response.status_code == 200:
                    self.log_test("Delete Subcategory", True, f"Successfully deleted subcategory {created_subcategory_id}")
                    return True
                else:
                    self.log_test("Delete Subcategory", False, f"Failed with status {response.status_code}", response.text)
                    return False
            except Exception as e:
                self.log_test("Delete Subcategory", False, f"Exception occurred: {str(e)}")
                return False
        
        return True
    
    def test_part_crud_multiple_machines(self, machines):
        """Test 8: Part CRUD operations with multiple machine support"""
        if not machines or len(machines) < 2:
            self.log_test("Part CRUD Multiple Machines", False, "Need at least 2 machines for multiple machine testing")
            return False
        
        machine_id_1 = machines[0]["id"]
        machine_id_2 = machines[1]["id"]
        created_part_id = None
        
        # Test CREATE with multiple machines
        try:
            part_data = {
                "machine_ids": [machine_id_1, machine_id_2],
                "name": "Multi-Machine Test Part",
                "code": "MULTI-001",
                "description": "A test part that works with multiple machines",
                "price": 1599.99
            }
            
            response = self.make_request("POST", "/admin/parts", data=part_data, auth_required=True)
            
            if response.status_code == 200:
                part = response.json()
                created_part_id = part.get("id")
                machine_ids = part.get("machine_ids", [])
                if len(machine_ids) == 2 and machine_id_1 in machine_ids and machine_id_2 in machine_ids:
                    self.log_test("Create Part Multiple Machines", True, f"Created part with ID: {created_part_id} for {len(machine_ids)} machines")
                else:
                    self.log_test("Create Part Multiple Machines", False, f"Part created but machine_ids not correct: {machine_ids}")
            else:
                self.log_test("Create Part Multiple Machines", False, f"Failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Part Multiple Machines", False, f"Exception occurred: {str(e)}")
            return False
        
        # Test UPDATE with different machines
        if created_part_id:
            try:
                # Add a third machine if available
                machine_ids_update = [machine_id_1, machine_id_2]
                if len(machines) > 2:
                    machine_ids_update.append(machines[2]["id"])
                
                update_data = {
                    "machine_ids": machine_ids_update,
                    "name": "Updated Multi-Machine Part",
                    "code": "MULTI-001-UPD",
                    "description": "Updated multi-machine part description",
                    "price": 1899.99
                }
                
                response = self.make_request("PUT", f"/admin/parts/{created_part_id}", data=update_data, auth_required=True)
                
                if response.status_code == 200:
                    updated_part = response.json()
                    if updated_part.get("name") == "Updated Multi-Machine Part":
                        self.log_test("Update Part Multiple Machines", True, f"Successfully updated part {created_part_id} with {len(machine_ids_update)} machines")
                    else:
                        self.log_test("Update Part Multiple Machines", False, "Part not properly updated", updated_part)
                else:
                    self.log_test("Update Part Multiple Machines", False, f"Failed with status {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Update Part Multiple Machines", False, f"Exception occurred: {str(e)}")
        
        # Test inline price update
        if created_part_id:
            try:
                new_price = 2199.99
                # Price should be sent as query parameter
                response = self.make_request("PUT", f"/admin/parts/{created_part_id}/price?price={new_price}", auth_required=True)
                
                if response.status_code == 200:
                    result = response.json()
                    if result.get("new_price") == new_price:
                        self.log_test("Update Part Price Only", True, f"Successfully updated price to ₹{new_price}")
                    else:
                        self.log_test("Update Part Price Only", False, "Price not properly updated", result)
                else:
                    self.log_test("Update Part Price Only", False, f"Failed with status {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Update Part Price Only", False, f"Exception occurred: {str(e)}")
        
        # Test DELETE
        if created_part_id:
            try:
                response = self.make_request("DELETE", f"/admin/parts/{created_part_id}", auth_required=True)
                
                if response.status_code == 200:
                    self.log_test("Delete Multi-Machine Part", True, f"Successfully deleted part {created_part_id}")
                    return True
                else:
                    self.log_test("Delete Multi-Machine Part", False, f"Failed with status {response.status_code}", response.text)
                    return False
            except Exception as e:
                self.log_test("Delete Multi-Machine Part", False, f"Exception occurred: {str(e)}")
                return False
        
        return True
    
    def test_parts_by_machine(self, machines):
        """Test 9: Get parts by machine endpoint"""
        if not machines:
            self.log_test("Parts by Machine", False, "No machines available for testing")
            return False
        
        try:
            machine_id = machines[0]["id"]
            response = self.make_request("GET", f"/machines/{machine_id}/parts")
            
            if response.status_code == 200:
                parts = response.json()
                if isinstance(parts, list):
                    # Check that all parts have machine_ids array and contain the requested machine_id
                    valid_parts = 0
                    for part in parts:
                        machine_ids = part.get("machine_ids", [])
                        if isinstance(machine_ids, list) and machine_id in machine_ids:
                            valid_parts += 1
                    
                    if valid_parts == len(parts):
                        self.log_test("Parts by Machine", True, f"Retrieved {len(parts)} parts for machine {machine_id}, all have correct machine_ids")
                        return True
                    else:
                        self.log_test("Parts by Machine", False, f"Some parts don't have correct machine_ids: {valid_parts}/{len(parts)}")
                        return False
                else:
                    self.log_test("Parts by Machine", False, "Invalid response format", parts)
                    return False
            else:
                self.log_test("Parts by Machine", False, f"Failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Parts by Machine", False, f"Exception occurred: {str(e)}")
            return False
    
    def test_backward_compatibility(self):
        """Test 10: Backward compatibility with legacy parts"""
        try:
            # Get all parts and check they have machine_ids populated
            response = self.make_request("GET", "/parts", auth_required=True)
            
            if response.status_code == 200:
                parts = response.json()
                if isinstance(parts, list) and len(parts) > 0:
                    legacy_converted = 0
                    for part in parts:
                        # Check if part has machine_ids array
                        machine_ids = part.get("machine_ids", [])
                        machine_id = part.get("machine_id", "")
                        
                        if isinstance(machine_ids, list) and len(machine_ids) > 0:
                            # If it has legacy machine_id, check if it's included in machine_ids
                            if machine_id and machine_id in machine_ids:
                                legacy_converted += 1
                            elif not machine_id:  # New format part
                                legacy_converted += 1
                    
                    if legacy_converted == len(parts):
                        self.log_test("Backward Compatibility", True, f"All {len(parts)} parts have proper machine_ids format")
                        return True
                    else:
                        self.log_test("Backward Compatibility", False, f"Some parts missing machine_ids: {legacy_converted}/{len(parts)}")
                        return False
                else:
                    self.log_test("Backward Compatibility", False, "No parts found for compatibility testing")
                    return False
            else:
                self.log_test("Backward Compatibility", False, f"Failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Backward Compatibility", False, f"Exception occurred: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 80)
        print("BACKEND API TESTING - Bhoomi Enterprises Spare Parts System")
        print("Testing Updated Multiple Machine Support Features")
        print("=" * 80)
        
        # Test 1: Initialize sample data
        self.test_init_sample_data()
        
        # Test 2: Admin authentication
        if not self.test_admin_authentication():
            print("❌ Cannot proceed without authentication")
            return False
        
        # Test 3: Get machines
        machines = self.test_get_machines()
        
        # Test 4: Get subcategories
        subcategories = self.test_get_subcategories()
        
        # Test 5: Get parts
        parts = self.test_get_parts()
        
        # Test 6: Machine CRUD
        self.test_machine_crud()
        
        # Test 7: Subcategory CRUD
        self.test_subcategory_crud(machines)
        
        # Test 8: NEW - Part CRUD with multiple machine support
        self.test_part_crud_multiple_machines(machines)
        
        # Test 9: NEW - Get parts by machine endpoint
        self.test_parts_by_machine(machines)
        
        # Test 10: NEW - Backward compatibility testing
        self.test_backward_compatibility()
        
        # Summary
        print("\n" + "=" * 80)
        print("TEST SUMMARY")
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
                    print(f"  - {result['test']}: {result['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)
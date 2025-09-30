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
    
    def test_part_crud(self, machines, subcategories):
        """Test 8: Part CRUD operations"""
        if not machines or not subcategories:
            self.log_test("Part CRUD", False, "No machines or subcategories available for part testing")
            return False
        
        machine_id = machines[0]["id"]
        subcategory_id = subcategories[0]["id"]
        created_part_id = None
        
        # Test CREATE
        try:
            part_data = {
                "machine_id": machine_id,
                "subcategory_id": subcategory_id,
                "name": "Test Part",
                "code": "TEST-001",
                "description": "A test part for CRUD operations",
                "price": 999.99
            }
            
            response = self.make_request("POST", "/admin/parts", data=part_data, auth_required=True)
            
            if response.status_code == 200:
                part = response.json()
                created_part_id = part.get("id")
                self.log_test("Create Part", True, f"Created part with ID: {created_part_id}")
            else:
                self.log_test("Create Part", False, f"Failed with status {response.status_code}", response.text)
                return False
        except Exception as e:
            self.log_test("Create Part", False, f"Exception occurred: {str(e)}")
            return False
        
        # Test UPDATE
        if created_part_id:
            try:
                update_data = {
                    "machine_id": machine_id,
                    "subcategory_id": subcategory_id,
                    "name": "Updated Test Part",
                    "code": "TEST-001-UPD",
                    "description": "Updated description for test part",
                    "price": 1299.99
                }
                
                response = self.make_request("PUT", f"/admin/parts/{created_part_id}", data=update_data, auth_required=True)
                
                if response.status_code == 200:
                    updated_part = response.json()
                    if updated_part.get("name") == "Updated Test Part":
                        self.log_test("Update Part", True, f"Successfully updated part {created_part_id}")
                    else:
                        self.log_test("Update Part", False, "Part not properly updated", updated_part)
                else:
                    self.log_test("Update Part", False, f"Failed with status {response.status_code}", response.text)
            except Exception as e:
                self.log_test("Update Part", False, f"Exception occurred: {str(e)}")
        
        # Test DELETE
        if created_part_id:
            try:
                response = self.make_request("DELETE", f"/admin/parts/{created_part_id}", auth_required=True)
                
                if response.status_code == 200:
                    self.log_test("Delete Part", True, f"Successfully deleted part {created_part_id}")
                    return True
                else:
                    self.log_test("Delete Part", False, f"Failed with status {response.status_code}", response.text)
                    return False
            except Exception as e:
                self.log_test("Delete Part", False, f"Exception occurred: {str(e)}")
                return False
        
        return True
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 80)
        print("BACKEND API TESTING - Bhoomi Enterprises Spare Parts System")
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
        
        # Test 8: Part CRUD
        self.test_part_crud(machines, subcategories)
        
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
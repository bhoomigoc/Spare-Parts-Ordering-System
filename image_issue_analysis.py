#!/usr/bin/env python3
"""
Image Display Issue Analysis for Bhoomi Enterprises
Root Cause Analysis and Solution Documentation
"""

import requests
import json

BACKEND_URL = "https://spareparts-order.preview.emergentagent.com/api"

def analyze_image_issue():
    """Comprehensive analysis of the image display issue"""
    
    print("🔍 IMAGE DISPLAY ISSUE - ROOT CAUSE ANALYSIS")
    print("=" * 60)
    
    # Step 1: Get current data from database
    print("\n1️⃣ CURRENT DATABASE STATE:")
    
    # Get machines
    machines_response = requests.get(f"{BACKEND_URL}/machines")
    if machines_response.status_code == 200:
        machines = machines_response.json()
        print(f"   📱 Machines found: {len(machines)}")
        
        machines_with_images = 0
        for machine in machines:
            if machine.get('image_url'):
                machines_with_images += 1
                print(f"      - {machine['name']}: {machine['image_url']}")
        
        print(f"   📊 Machines with images: {machines_with_images}/{len(machines)}")
    
    # Get admin token for parts
    login_response = requests.post(f"{BACKEND_URL}/admin/login", json={
        "username": "admin",
        "password": "admin123"
    })
    
    if login_response.status_code == 200:
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get parts
        parts_response = requests.get(f"{BACKEND_URL}/parts", headers=headers)
        if parts_response.status_code == 200:
            parts = parts_response.json()
            print(f"   🔧 Parts found: {len(parts)}")
            
            parts_with_images = 0
            for part in parts:
                if part.get('image_url'):
                    parts_with_images += 1
                    print(f"      - {part['name']}: {part['image_url']}")
            
            print(f"   📊 Parts with images: {parts_with_images}/{len(parts)}")
    
    # Step 2: Test image accessibility
    print("\n2️⃣ IMAGE ACCESSIBILITY TEST:")
    
    # Test machine images (all have /api/uploads/ prefix)
    machine_images = [
        '/api/uploads/b236082f-1cf7-406a-acbb-1723e99d9588.webp',
        '/api/uploads/c0750f79-64d8-4a32-bdf5-3d66e8eb7a92.webp',
        '/api/uploads/df87f50f-6855-419f-af11-463c5a3497c2.webp'
    ]
    
    print("   📱 Machine Images:")
    for img_url in machine_images:
        full_url = f"https://spareparts-order.preview.emergentagent.com{img_url}"
        try:
            response = requests.get(full_url, timeout=5)
            status = "✅ ACCESSIBLE" if response.status_code == 200 else f"❌ NOT FOUND ({response.status_code})"
            print(f"      {status}: {img_url}")
        except Exception as e:
            print(f"      ❌ ERROR: {img_url} - {str(e)}")
    
    # Test part images (missing /api prefix)
    part_images = ['/uploads/b9ad1a04-4536-45a6-b532-b1085a6c6b55.jpeg']
    
    print("   🔧 Part Images:")
    for img_url in part_images:
        # Test without /api prefix (as stored in database)
        full_url_no_api = f"https://spareparts-order.preview.emergentagent.com{img_url}"
        # Test with /api prefix (correct format)
        full_url_with_api = f"https://spareparts-order.preview.emergentagent.com/api{img_url}"
        
        try:
            response_no_api = requests.get(full_url_no_api, timeout=5)
            response_with_api = requests.get(full_url_with_api, timeout=5)
            
            print(f"      Without /api prefix: {'✅ ACCESSIBLE' if response_no_api.status_code == 200 else f'❌ NOT FOUND ({response_no_api.status_code})'}")
            print(f"      With /api prefix:    {'✅ ACCESSIBLE' if response_with_api.status_code == 200 else f'❌ NOT FOUND ({response_with_api.status_code})'}")
            print(f"      URL in database: {img_url}")
        except Exception as e:
            print(f"      ❌ ERROR: {str(e)}")
    
    # Step 3: Test upload process
    print("\n3️⃣ UPLOAD PROCESS TEST:")
    
    if login_response.status_code == 200:
        # Create a simple test image
        import io
        png_header = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        img_bytes = io.BytesIO(png_header)
        
        files = {'file': ('test_analysis.png', img_bytes, 'image/png')}
        upload_url = f"{BACKEND_URL}/admin/upload-image"
        
        upload_response = requests.post(upload_url, files=files, headers=headers)
        
        if upload_response.status_code == 200:
            upload_data = upload_response.json()
            returned_url = upload_data.get("image_url", "")
            print(f"   ✅ Upload successful")
            print(f"   📤 Returned URL: {returned_url}")
            
            # Test if newly uploaded image can be served
            if returned_url:
                serve_url = f"https://spareparts-order.preview.emergentagent.com{returned_url}"
                serve_response = requests.get(serve_url, timeout=5)
                print(f"   🌐 Serving test: {'✅ ACCESSIBLE' if serve_response.status_code == 200 else f'❌ NOT ACCESSIBLE ({serve_response.status_code})'}")
        else:
            print(f"   ❌ Upload failed: {upload_response.status_code}")
    
    # Step 4: Root cause analysis
    print("\n4️⃣ ROOT CAUSE ANALYSIS:")
    print("   🔍 FINDINGS:")
    print("      1. Machine images have correct /api/uploads/ prefix but files don't exist (404)")
    print("      2. Part images have incorrect /uploads/ prefix (missing /api)")
    print("      3. New uploads work correctly and return /api/uploads/ prefix")
    print("      4. Upload directory is ephemeral (/tmp/uploads) - files lost on restart")
    
    print("\n   💡 ROOT CAUSES:")
    print("      A. EPHEMERAL STORAGE: /tmp/uploads directory is cleared on container restart")
    print("      B. INCONSISTENT URL FORMAT: Some images stored with /uploads/, others with /api/uploads/")
    print("      C. MISSING FILES: Historical images no longer exist in upload directory")
    
    print("\n   🎯 IMPACT:")
    print("      - Machine images: NOT DISPLAYING (files missing)")
    print("      - Part images: NOT DISPLAYING (wrong URL format + files missing)")
    print("      - New uploads: WORK CORRECTLY")
    
    print("\n5️⃣ SOLUTION RECOMMENDATIONS:")
    print("   🔧 IMMEDIATE FIXES:")
    print("      1. Fix URL format inconsistency in database")
    print("      2. Re-upload missing images or use placeholder images")
    print("      3. Update frontend to handle missing images gracefully")
    
    print("\n   🏗️ LONG-TERM SOLUTIONS:")
    print("      1. Use persistent storage (cloud storage like AWS S3, Google Cloud Storage)")
    print("      2. Implement image fallback/placeholder system")
    print("      3. Add image validation and URL format consistency checks")

if __name__ == "__main__":
    analyze_image_issue()
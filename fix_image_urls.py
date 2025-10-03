#!/usr/bin/env python3
"""
Fix Image URL Format Inconsistency
Updates part image URLs to include /api prefix for consistency
"""

import requests
import json

BACKEND_URL = "https://spareparts-order.preview.emergentagent.com/api"

def fix_image_url_inconsistency():
    """Fix the URL format inconsistency for part images"""
    
    print("🔧 FIXING IMAGE URL FORMAT INCONSISTENCY")
    print("=" * 50)
    
    # Step 1: Get admin token
    login_response = requests.post(f"{BACKEND_URL}/admin/login", json={
        "username": "admin",
        "password": "admin123"
    })
    
    if login_response.status_code != 200:
        print("❌ Failed to authenticate")
        return False
    
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 2: Get all parts
    parts_response = requests.get(f"{BACKEND_URL}/parts", headers=headers)
    if parts_response.status_code != 200:
        print("❌ Failed to get parts")
        return False
    
    parts = parts_response.json()
    print(f"📊 Found {len(parts)} parts to check")
    
    # Step 3: Find parts with incorrect URL format
    parts_to_fix = []
    for part in parts:
        image_url = part.get('image_url')
        if image_url and image_url.startswith('/uploads/') and not image_url.startswith('/api/uploads/'):
            parts_to_fix.append({
                'id': part['id'],
                'name': part['name'],
                'old_url': image_url,
                'new_url': f"/api{image_url}"
            })
    
    print(f"🔍 Found {len(parts_to_fix)} parts with incorrect URL format")
    
    if len(parts_to_fix) == 0:
        print("✅ No parts need URL format fixing")
        return True
    
    # Step 4: Fix each part's image URL
    fixed_count = 0
    for part_fix in parts_to_fix:
        print(f"\n🔧 Fixing part: {part_fix['name']}")
        print(f"   Old URL: {part_fix['old_url']}")
        print(f"   New URL: {part_fix['new_url']}")
        
        # Get current part data
        part_response = requests.get(f"{BACKEND_URL}/parts", headers=headers)
        if part_response.status_code != 200:
            print(f"   ❌ Failed to get current part data")
            continue
        
        current_parts = part_response.json()
        current_part = None
        for p in current_parts:
            if p['id'] == part_fix['id']:
                current_part = p
                break
        
        if not current_part:
            print(f"   ❌ Part not found")
            continue
        
        # Update the part with corrected image URL
        update_data = {
            "machine_ids": current_part['machine_ids'],
            "name": current_part['name'],
            "code": current_part['code'],
            "description": current_part['description'],
            "price": current_part['price'],
            "image_url": part_fix['new_url']
        }
        
        update_response = requests.put(
            f"{BACKEND_URL}/admin/parts/{part_fix['id']}", 
            json=update_data, 
            headers=headers
        )
        
        if update_response.status_code == 200:
            print(f"   ✅ Successfully updated URL format")
            fixed_count += 1
        else:
            print(f"   ❌ Failed to update: {update_response.status_code}")
    
    print(f"\n📊 SUMMARY:")
    print(f"   Parts checked: {len(parts)}")
    print(f"   Parts needing fix: {len(parts_to_fix)}")
    print(f"   Parts fixed: {fixed_count}")
    
    return fixed_count == len(parts_to_fix)

if __name__ == "__main__":
    success = fix_image_url_inconsistency()
    if success:
        print("\n✅ Image URL format fix completed successfully!")
    else:
        print("\n❌ Some issues occurred during the fix process")
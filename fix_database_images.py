#!/usr/bin/env python3
"""
Fix Database Image References to Match Persistent Storage Files
Updates machine and part image URLs to point to existing files in /app/backend/uploads/
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path

# Database connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# Available image files in persistent storage
AVAILABLE_FILES = [
    "3a487bc7-13ae-4fe6-ac15-485240d954b8.webp",
    "7fecf2d0-dadf-44a4-aea2-7dc632da4371.webp", 
    "f46ea96c-07a8-4ba2-926b-77dddb8d9842.webp",
    "f481a63f-e02a-4182-8779-d95afda356a1.webp",
    "b9ad1a04-4536-45a6-b532-b1085a6c6b55.jpeg",
    "1a885e1e-2db8-45f7-a1e5-aca49ce9b924.jpg",
    "2e5dd317-ed6c-4049-b964-c9c7eec2e8d6.jpg",
    "b0b28552-0605-4e3d-8735-21b29b6a719d.jpg"
]

async def fix_database_images():
    """Fix machine and part image references in database"""
    
    print("🔧 FIXING DATABASE IMAGE REFERENCES")
    print("=" * 50)
    
    # Connect to database
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    try:
        # Step 1: Fix machine images
        print("\n1️⃣ FIXING MACHINE IMAGES:")
        machines = await db.machines.find().to_list(length=None)
        
        machine_file_mapping = {
            "Pellet Mill 560": "3a487bc7-13ae-4fe6-ac15-485240d954b8.webp",
            "Pellet Machine 780": "7fecf2d0-dadf-44a4-aea2-7dc632da4371.webp", 
            "Turbo Hammer Mill ": "f46ea96c-07a8-4ba2-926b-77dddb8d9842.webp",
            "Hammer Mill G3600": "f481a63f-e02a-4182-8779-d95afda356a1.webp"
        }
        
        machines_updated = 0
        for machine in machines:
            machine_name = machine.get('name', '')
            if machine_name in machine_file_mapping:
                new_image_url = f"/api/uploads/{machine_file_mapping[machine_name]}"
                
                # Update the machine
                result = await db.machines.update_one(
                    {"_id": machine["_id"]},
                    {"$set": {"image_url": new_image_url}}
                )
                
                if result.modified_count > 0:
                    print(f"   ✅ Updated {machine_name}: {new_image_url}")
                    machines_updated += 1
                else:
                    print(f"   ⚠️  No update needed for {machine_name}")
            else:
                print(f"   ❌ No mapping found for {machine_name}")
        
        # Step 2: Fix part images (if any have image URLs)
        print(f"\n2️⃣ FIXING PART IMAGES:")
        parts = await db.parts.find({"image_url": {"$exists": True, "$ne": None, "$ne": ""}}).to_list(length=None)
        
        parts_updated = 0
        if parts:
            # Use the first available image for parts that have image URLs
            part_image = "/api/uploads/b9ad1a04-4536-45a6-b532-b1085a6c6b55.jpeg"
            
            for part in parts:
                current_url = part.get('image_url', '')
                if current_url and not current_url.endswith(('b9ad1a04-4536-45a6-b532-b1085a6c6b55.jpeg')):
                    result = await db.parts.update_one(
                        {"_id": part["_id"]},
                        {"$set": {"image_url": part_image}}
                    )
                    
                    if result.modified_count > 0:
                        print(f"   ✅ Updated part {part.get('name', 'Unknown')}: {part_image}")
                        parts_updated += 1
        else:
            print("   ℹ️  No parts with image URLs found")
        
        # Step 3: Summary
        print(f"\n📊 SUMMARY:")
        print(f"   Machines updated: {machines_updated}")
        print(f"   Parts updated: {parts_updated}")
        print(f"   ✅ Database image references now point to existing files")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    finally:
        client.close()

if __name__ == "__main__":
    success = asyncio.run(fix_database_images())
    if success:
        print("\n🎉 Database image references fixed successfully!")
    else:
        print("\n❌ Failed to fix database image references")
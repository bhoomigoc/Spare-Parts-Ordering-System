from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import hashlib
from jose import jwt
import shutil
from io import BytesIO
# import pandas as pd  # Unused import - removed
import base64
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with error handling
mongo_url = os.environ.get('MONGO_URL')
if not mongo_url:
    print("❌ MONGO_URL environment variable not found!")
    print("Please set MONGO_URL in your environment variables.")
    raise ValueError("MONGO_URL environment variable is required for production deployment")

try:
    client = AsyncIOMotorClient(mongo_url)
    db_name = os.environ.get('DB_NAME', 'spare_parts_db')
    db = client[db_name]
    print(f"✅ Connected to MongoDB: {db_name}")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")
    raise

# Create the main app
app = FastAPI(title="Spare Parts Ordering API")

# Health check endpoint
@app.get("/")
async def health_check():
    return {
        "status": "healthy", 
        "message": "Bhoomi Enterprises API is running",
        "environment": os.environ.get("ENVIRONMENT", "development")
    }

# Startup event
@app.on_event("startup")
async def startup_event():
    try:
        # Test database connection
        await client.admin.command('ping')
        print("✅ Database connection successful")
        
        # Ensure upload directory exists
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        print(f"✅ Upload directory created: {UPLOAD_DIR}")
        
        print("✅ Backend startup complete")
        
    except Exception as e:
        print(f"❌ Startup error: {e}")
        # Don't raise - let the app start anyway for debugging

# Health check endpoint
@app.get("/")
async def health_check():
    return {"status": "healthy", "message": "Bhoomi Enterprises API is running"}

# Startup event
@app.on_event("startup")
async def startup_event():
    try:
        # Test database connection
        await client.admin.command('ping')
        print("✅ Database connection successful")
        
        # Ensure upload directory exists
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
        print(f"✅ Upload directory created: {UPLOAD_DIR}")
        
    except Exception as e:
        print(f"❌ Startup failed: {e}")
        # Don't raise - let the app start anyway for debugging

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'spare_parts_secret_key_2024')

# File upload directory (persistent storage)
UPLOAD_DIR = Path(os.environ.get('UPLOAD_DIR', '/app/backend/uploads'))
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Email configuration
SMTP_SERVER = os.environ.get('SMTP_SERVER', '')
SMTP_PORT = int(os.environ.get('SMTP_PORT', 587))
SMTP_USERNAME = os.environ.get('SMTP_USERNAME', '')
SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
NOTIFICATION_EMAIL = "office.bhoomigroup@gmail.com"

# Models
class Machine(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MachineCreate(BaseModel):
    name: str
    description: str

class Subcategory(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    machine_id: str
    name: str
    description: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubcategoryCreate(BaseModel):
    machine_id: str
    name: str
    description: str

class Part(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    machine_id: str  # Keep for backward compatibility
    machine_ids: List[str] = Field(default_factory=list)  # New field for multiple machines
    subcategory_id: str  # Keep for backward compatibility
    name: str
    code: str
    description: str
    price: float
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PartCreate(BaseModel):
    machine_ids: List[str]  # Changed to support multiple machines
    name: str
    code: str
    description: str
    price: float

class OrderItem(BaseModel):
    part_id: str
    part_name: str
    part_code: str
    machine_name: str
    quantity: int
    price: float
    comment: str = ""

class CustomerInfo(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    company: Optional[str] = None
    gst_number: Optional[str] = None
    delivery_address: Optional[str] = None

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_info: CustomerInfo
    items: List[OrderItem]
    total_amount: float
    status: str = "new"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrderCreate(BaseModel):
    customer_info: CustomerInfo
    items: List[OrderItem]
    total_amount: float

class Admin(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password_hash: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AdminLogin(BaseModel):
    username: str
    password: str

class AdminCreate(BaseModel):
    username: str
    password: str

# Helper functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def create_jwt_token(admin_id: str) -> str:
    payload = {"admin_id": admin_id, "exp": datetime.now(timezone.utc).timestamp() + 86400}  # 24 hours
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=["HS256"])
        admin_id = payload.get("admin_id")
        if not admin_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        admin = await db.admins.find_one({"id": admin_id})
        if not admin:
            raise HTTPException(status_code=401, detail="Admin not found")
        
        return Admin(**admin)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def prepare_for_mongo(data):
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
            elif isinstance(value, list):
                data[key] = [prepare_for_mongo(item) if isinstance(item, dict) else item for item in value]
            elif isinstance(value, dict):
                data[key] = prepare_for_mongo(value)
    return data

def parse_from_mongo(item):
    """Parse datetime strings from MongoDB back to datetime objects"""
    if isinstance(item, dict):
        for key, value in item.items():
            if key.endswith('_at') and isinstance(value, str):
                try:
                    item[key] = datetime.fromisoformat(value)
                except ValueError:
                    pass
            elif isinstance(value, list):
                item[key] = [parse_from_mongo(sub_item) if isinstance(sub_item, dict) else sub_item for sub_item in value]
            elif isinstance(value, dict):
                item[key] = parse_from_mongo(value)
    return item

async def send_order_notification(order: Order):
    """Send email notification for new order"""
    try:
        if not SMTP_USERNAME or not SMTP_PASSWORD:
            print("Email credentials not configured, skipping notification")
            return
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = SMTP_USERNAME
        msg['To'] = NOTIFICATION_EMAIL
        msg['Subject'] = f"New Order Received - QuickParts (Order #{order.id[:8]})"
        
        # Email body
        body = f"""
        A new order has been received on QuickParts!
        
        Order Details:
        Order ID: {order.id}
        Customer: {order.customer_info.name}
        Phone: {order.customer_info.phone}
        Email: {order.customer_info.email or 'Not provided'}
        Company: {order.customer_info.company or 'Not provided'}
        
        Items Ordered:
        {chr(10).join([f"• {item.part_name} ({item.part_code}) - Qty: {item.quantity} - ₹{item.price * item.quantity:,}" for item in order.items])}
        
        Total Amount: ₹{order.total_amount:,}
        Order Date: {order.created_at.strftime('%Y-%m-%d %H:%M:%S')}
        
        Please log in to the admin dashboard to view complete order details and process the order.
        
        Best regards,
        QuickParts System
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        print(f"Order notification sent successfully for order {order.id}")
        
    except Exception as e:
        print(f"Failed to send order notification: {e}")

# Public endpoints (Customer)
@api_router.get("/machines", response_model=List[Machine])
async def get_machines():
    machines = await db.machines.find().to_list(length=None)
    return [Machine(**parse_from_mongo(machine)) for machine in machines]

@api_router.get("/machines/{machine_id}/subcategories", response_model=List[Subcategory])
async def get_subcategories(machine_id: str):
    subcategories = await db.subcategories.find({"machine_id": machine_id}).to_list(length=None)
    return [Subcategory(**parse_from_mongo(sub)) for sub in subcategories]

@api_router.get("/subcategories/{subcategory_id}/parts", response_model=List[Part])
async def get_parts_by_subcategory(subcategory_id: str):
    parts = await db.parts.find({"subcategory_id": subcategory_id}).to_list(length=None)
    return [Part(**parse_from_mongo(part)) for part in parts]

@api_router.get("/machines/{machine_id}/parts", response_model=List[Part])
async def get_parts_by_machine(machine_id: str):
    # Get parts that have this machine in their machine_ids array OR in legacy machine_id field
    parts = await db.parts.find({
        "$or": [
            {"machine_ids": machine_id},
            {"machine_id": machine_id}  # Backward compatibility
        ]
    }).to_list(length=None)
    
    # Convert legacy parts to new format
    for part in parts:
        if "machine_ids" not in part or not part["machine_ids"]:
            part["machine_ids"] = [part.get("machine_id", "")]
    
    return [Part(**parse_from_mongo(part)) for part in parts]

@api_router.post("/orders", response_model=Order)
async def create_order(order_data: OrderCreate):
    try:
        order_dict = order_data.dict()
        order_obj = Order(**order_dict)
        order_mongo = prepare_for_mongo(order_obj.dict())
        
        # Insert order into database
        result = await db.orders.insert_one(order_mongo)
        print(f"✅ Order created successfully: {order_obj.id}")
        
        # Try to send email notification (don't fail if email fails)
        try:
            await send_order_notification(order_obj)
            print("✅ Email notification sent")
        except Exception as email_error:
            print(f"⚠️ Email notification failed (order still created): {email_error}")
        
        return order_obj
        
    except Exception as e:
        print(f"❌ Error creating order: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

# Admin authentication
@api_router.post("/admin/login")
async def admin_login(login_data: AdminLogin):
    password_hash = hash_password(login_data.password)
    admin = await db.admins.find_one({"username": login_data.username, "password_hash": password_hash})
    
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(admin["id"])
    return {"access_token": token, "token_type": "bearer"}

@api_router.post("/admin/create", response_model=Admin)
async def create_admin(admin_data: AdminCreate):
    # Check if admin already exists
    existing_admin = await db.admins.find_one({"username": admin_data.username})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    password_hash = hash_password(admin_data.password)
    admin_obj = Admin(username=admin_data.username, password_hash=password_hash)
    admin_mongo = prepare_for_mongo(admin_obj.dict())
    await db.admins.insert_one(admin_mongo)
    return admin_obj

# Protected admin endpoints
@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders(admin: Admin = Depends(get_current_admin)):
    orders = await db.orders.find().sort("created_at", -1).to_list(length=None)
    return [Order(**parse_from_mongo(order)) for order in orders]

@api_router.get("/subcategories", response_model=List[Subcategory])
async def get_all_subcategories(admin: Admin = Depends(get_current_admin)):
    subcategories = await db.subcategories.find().to_list(length=None)
    return [Subcategory(**parse_from_mongo(sub)) for sub in subcategories]

@api_router.get("/parts", response_model=List[Part])
async def get_all_parts(admin: Admin = Depends(get_current_admin)):
    parts = await db.parts.find().to_list(length=None)
    
    # Convert legacy parts to new format
    for part in parts:
        if "machine_ids" not in part or not part["machine_ids"]:
            part["machine_ids"] = [part.get("machine_id", "")]
    
    return [Part(**parse_from_mongo(part)) for part in parts]

@api_router.post("/admin/machines", response_model=Machine)
async def create_machine(machine_data: MachineCreate, admin: Admin = Depends(get_current_admin)):
    machine_obj = Machine(**machine_data.dict())
    machine_mongo = prepare_for_mongo(machine_obj.dict())
    await db.machines.insert_one(machine_mongo)
    return machine_obj

class MachineUpdate(BaseModel):
    name: str
    description: str
    image_url: Optional[str] = None

@api_router.put("/admin/machines/{machine_id}", response_model=Machine)
async def update_machine(machine_id: str, machine_data: MachineUpdate, admin: Admin = Depends(get_current_admin)):
    machine_dict = machine_data.dict()
    
    result = await db.machines.update_one(
        {"id": machine_id}, 
        {"$set": prepare_for_mongo(machine_dict)}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    updated_machine = await db.machines.find_one({"id": machine_id})
    return Machine(**parse_from_mongo(updated_machine))

@api_router.delete("/admin/machines/{machine_id}")
async def delete_machine(machine_id: str, admin: Admin = Depends(get_current_admin)):
    result = await db.machines.delete_one({"id": machine_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Machine not found")
    
    # Also delete related subcategories and parts
    await db.subcategories.delete_many({"machine_id": machine_id})
    await db.parts.delete_many({"machine_id": machine_id})
    
    return {"message": "Machine deleted successfully"}

@api_router.post("/admin/subcategories", response_model=Subcategory)
async def create_subcategory(subcategory_data: SubcategoryCreate, admin: Admin = Depends(get_current_admin)):
    subcategory_obj = Subcategory(**subcategory_data.dict())
    subcategory_mongo = prepare_for_mongo(subcategory_obj.dict())
    await db.subcategories.insert_one(subcategory_mongo)
    return subcategory_obj

@api_router.put("/admin/subcategories/{subcategory_id}", response_model=Subcategory)
async def update_subcategory(subcategory_id: str, subcategory_data: SubcategoryCreate, admin: Admin = Depends(get_current_admin)):
    subcategory_dict = subcategory_data.dict()
    subcategory_dict["id"] = subcategory_id
    subcategory_dict["created_at"] = datetime.now(timezone.utc)
    
    result = await db.subcategories.update_one(
        {"id": subcategory_id}, 
        {"$set": prepare_for_mongo(subcategory_dict)}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    updated_subcategory = await db.subcategories.find_one({"id": subcategory_id})
    return Subcategory(**parse_from_mongo(updated_subcategory))

@api_router.delete("/admin/subcategories/{subcategory_id}")
async def delete_subcategory(subcategory_id: str, admin: Admin = Depends(get_current_admin)):
    result = await db.subcategories.delete_one({"id": subcategory_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Subcategory not found")
    
    # Also delete related parts
    await db.parts.delete_many({"subcategory_id": subcategory_id})
    
    return {"message": "Subcategory deleted successfully"}

@api_router.post("/admin/parts", response_model=Part)
async def create_part(part_data: PartCreate, admin: Admin = Depends(get_current_admin)):
    # Create part with multiple machine support
    part_dict = part_data.dict()
    
    # Set backward compatibility fields
    part_dict["machine_id"] = part_dict["machine_ids"][0] if part_dict["machine_ids"] else ""
    part_dict["subcategory_id"] = ""  # No longer used but keep for compatibility
    
    part_obj = Part(**part_dict)
    part_mongo = prepare_for_mongo(part_obj.dict())
    await db.parts.insert_one(part_mongo)
    return part_obj

class PartUpdate(BaseModel):
    machine_ids: List[str]  # Changed to support multiple machines
    name: str
    code: str
    description: str
    price: float
    image_url: Optional[str] = None

@api_router.put("/admin/parts/{part_id}", response_model=Part)
async def update_part(part_id: str, part_data: PartUpdate, admin: Admin = Depends(get_current_admin)):
    part_dict = part_data.dict()
    
    # Set backward compatibility fields
    part_dict["machine_id"] = part_dict["machine_ids"][0] if part_dict["machine_ids"] else ""
    part_dict["subcategory_id"] = ""  # No longer used but keep for compatibility
    
    result = await db.parts.update_one(
        {"id": part_id}, 
        {"$set": prepare_for_mongo(part_dict)}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Part not found")
    
    updated_part = await db.parts.find_one({"id": part_id})
    
    # Convert legacy parts to new format for response
    if "machine_ids" not in updated_part or not updated_part["machine_ids"]:
        updated_part["machine_ids"] = [updated_part.get("machine_id", "")]
    
    return Part(**parse_from_mongo(updated_part))

@api_router.put("/admin/parts/{part_id}/price")
async def update_part_price(part_id: str, price: float, admin: Admin = Depends(get_current_admin)):
    result = await db.parts.update_one(
        {"id": part_id}, 
        {"$set": {"price": price}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Part not found")
    
    return {"message": "Price updated successfully", "new_price": price}

@api_router.delete("/admin/parts/{part_id}")
async def delete_part(part_id: str, admin: Admin = Depends(get_current_admin)):
    result = await db.parts.delete_one({"id": part_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Part not found")
    return {"message": "Part deleted successfully"}

# File upload endpoint
@api_router.post("/admin/upload-image")
async def upload_image(file: UploadFile = File(...), admin: Admin = Depends(get_current_admin)):
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    file_extension = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / filename
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"image_url": f"/api/uploads/{filename}"}

# Serve uploaded files
@api_router.get("/uploads/{filename}")
async def serve_uploaded_file(filename: str):
    file_path = UPLOAD_DIR / filename
    if file_path.exists():
        return FileResponse(file_path)
    else:
        raise HTTPException(status_code=404, detail="File not found")

# Initialize with sample data
@api_router.post("/admin/init-sample-data")
async def init_sample_data():
    # Create default admin if not exists
    existing_admin = await db.admins.find_one({"username": "admin"})
    if not existing_admin:
        admin_obj = Admin(username="admin", password_hash=hash_password("admin123"))
        await db.admins.insert_one(prepare_for_mongo(admin_obj.dict()))
    
    # Check if sample data already exists
    existing_machines = await db.machines.count_documents({})
    if existing_machines > 0:
        return {"message": "Sample data already exists"}
    
    # Sample machines
    machines_data = [
        {"name": "Tractor", "description": "Heavy-duty agricultural tractors"},
        {"name": "Harvester", "description": "Combine harvesters and crop processing machines"},
        {"name": "Water Pump", "description": "Industrial and agricultural water pumps"},
    ]
    
    machine_objects = []
    for machine_data in machines_data:
        machine_obj = Machine(**machine_data)
        await db.machines.insert_one(prepare_for_mongo(machine_obj.dict()))
        machine_objects.append(machine_obj)
    
    # Sample subcategories
    subcategories_data = [
        # Tractor subcategories
        {"machine_id": machine_objects[0].id, "name": "Engine", "description": "Engine components and parts"},
        {"machine_id": machine_objects[0].id, "name": "Gearbox", "description": "Transmission and gearbox parts"},
        {"machine_id": machine_objects[0].id, "name": "Filters", "description": "Air, oil, and fuel filters"},
        
        # Harvester subcategories
        {"machine_id": machine_objects[1].id, "name": "Cutting System", "description": "Cutting blades and mechanisms"},
        {"machine_id": machine_objects[1].id, "name": "Threshing Unit", "description": "Threshing and separation components"},
        
        # Water Pump subcategories
        {"machine_id": machine_objects[2].id, "name": "Impeller", "description": "Pump impellers and rotors"},
        {"machine_id": machine_objects[2].id, "name": "Seals & Gaskets", "description": "Sealing components"},
    ]
    
    subcategory_objects = []
    for subcat_data in subcategories_data:
        subcat_obj = Subcategory(**subcat_data)
        await db.subcategories.insert_one(prepare_for_mongo(subcat_obj.dict()))
        subcategory_objects.append(subcat_obj)
    
    # Sample parts (including some that belong to multiple machines)
    parts_data = [
        # Tractor-specific parts
        {"machine_ids": [machine_objects[0].id], "machine_id": machine_objects[0].id, "subcategory_id": subcategory_objects[0].id, "name": "Piston Ring Set", "code": "TR-ENG-001", "description": "Complete piston ring set for diesel engine", "price": 2500.00},
        {"machine_ids": [machine_objects[0].id], "machine_id": machine_objects[0].id, "subcategory_id": subcategory_objects[1].id, "name": "Clutch Plate", "code": "TR-GB-001", "description": "Heavy-duty clutch plate assembly", "price": 3200.00},
        {"machine_ids": [machine_objects[0].id], "machine_id": machine_objects[0].id, "subcategory_id": subcategory_objects[1].id, "name": "Gear Set", "code": "TR-GB-002", "description": "Complete transmission gear set", "price": 15000.00},
        
        # Harvester-specific parts
        {"machine_ids": [machine_objects[1].id], "machine_id": machine_objects[1].id, "subcategory_id": subcategory_objects[3].id, "name": "Cutting Blade", "code": "HV-CUT-001", "description": "Sharp cutting blade for crops", "price": 1200.00},
        {"machine_ids": [machine_objects[1].id], "machine_id": machine_objects[1].id, "subcategory_id": subcategory_objects[4].id, "name": "Threshing Drum", "code": "HV-THR-001", "description": "Heavy-duty threshing drum", "price": 8500.00},
        
        # Water Pump-specific parts
        {"machine_ids": [machine_objects[2].id], "machine_id": machine_objects[2].id, "subcategory_id": subcategory_objects[5].id, "name": "Centrifugal Impeller", "code": "WP-IMP-001", "description": "High-efficiency centrifugal impeller", "price": 2800.00},
        
        # Universal parts (belong to multiple machines)
        {"machine_ids": [machine_objects[0].id, machine_objects[1].id], "machine_id": machine_objects[0].id, "subcategory_id": subcategory_objects[2].id, "name": "Air Filter", "code": "UNI-FLT-001", "description": "Universal high-efficiency air filter", "price": 650.00},
        {"machine_ids": [machine_objects[0].id, machine_objects[1].id, machine_objects[2].id], "machine_id": machine_objects[0].id, "subcategory_id": subcategory_objects[2].id, "name": "Oil Filter", "code": "UNI-FLT-002", "description": "Universal premium oil filter", "price": 450.00},
        {"machine_ids": [machine_objects[0].id, machine_objects[2].id], "machine_id": machine_objects[0].id, "subcategory_id": subcategory_objects[6].id, "name": "Mechanical Seal", "code": "UNI-SEL-001", "description": "Universal water-tight mechanical seal", "price": 950.00},
        {"machine_ids": [machine_objects[1].id, machine_objects[2].id], "machine_id": machine_objects[1].id, "subcategory_id": subcategory_objects[0].id, "name": "Cylinder Head Gasket", "code": "UNI-ENG-001", "description": "Universal cylinder head gasket", "price": 1800.00},
    ]
    
    for part_data in parts_data:
        part_obj = Part(**part_data)
        await db.parts.insert_one(prepare_for_mongo(part_obj.dict()))
    
    return {"message": "Sample data initialized successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
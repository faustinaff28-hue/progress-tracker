import motor.motor_asyncio
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb+srv://admin:admin123@cluster0.j3fmnl9.mongodb.net/?appName=Cluster0")
DATABASE_NAME = "progress_tracker"

client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]


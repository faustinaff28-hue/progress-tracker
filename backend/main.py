from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from beanie import init_beanie
from database import db
import models
from routers import auth, tasks, analytics

app = FastAPI(
    title="Progress Tracker API",
    description="Backend API for the GitHub-style productivity platform.",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    await init_beanie(
        database=db,
        document_models=[
            models.User,
            models.Task,
            models.TaskSubmission,
            models.ActivityLog,
            models.Achievement,
            models.UserAchievement,
            models.Notification
        ]
    )

# Configure CORS for the React frontend
origins = [
    "http://localhost:5173", # Default Vite port
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(analytics.router)

# Mount static files for uploads
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Progress Tracker API"}

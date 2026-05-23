from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- USER ---
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    role: str
    xp: int
    level: int
    rank: str
    streak: int
    contribution_score: int
    profile_image: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

# --- AUTH ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# --- TASK SUBMISSION ---
class TaskSubmissionBase(BaseModel):
    task_id: str
    comment: Optional[str] = None

class TaskSubmissionCreate(TaskSubmissionBase):
    pass

class TaskSubmissionResponse(TaskSubmissionBase):
    id: str
    user_id: str
    file_path: Optional[str]
    status: str
    feedback: Optional[str]
    submitted_at: datetime
    
    class Config:
        from_attributes = True

# --- TASK ---
class TaskBase(BaseModel):
    title: str
    description: str
    priority: str = "medium"
    deadline: Optional[datetime] = None
    assigned_to: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[datetime] = None
    status: Optional[str] = None
    assigned_to: Optional[str] = None
    voice_note_path: Optional[str] = None

class TaskResponse(TaskBase):
    id: str
    status: str
    assigned_by: str
    voice_note_path: Optional[str]
    created_at: datetime
    submissions: List[TaskSubmissionResponse] = []

    class Config:
        from_attributes = True

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from typing import List
import os
import shutil
import uuid
import models, schemas, auth

router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"]
)

# Ensure upload directories exist
os.makedirs("uploads/documents", exist_ok=True)
os.makedirs("uploads/voice", exist_ok=True)

@router.get("/", response_model=List[schemas.TaskResponse])
async def get_tasks(skip: int = 0, limit: int = 100, current_user: models.User = Depends(auth.get_current_active_user)):
    # Simple logic: users see tasks assigned to them. Admins see all.
    if current_user.role == "admin":
        tasks = await models.Task.find().skip(skip).limit(limit).to_list()
    else:
        tasks = await models.Task.find(models.Task.assigned_to == str(current_user.id)).skip(skip).limit(limit).to_list()
    
    task_responses = []
    for t in tasks:
        submissions = await models.TaskSubmission.find(models.TaskSubmission.task_id == str(t.id)).to_list()
        task_responses.append(
            schemas.TaskResponse(
                **t.model_dump(),
                id=str(t.id),
                submissions=[schemas.TaskSubmissionResponse(**s.model_dump(), id=str(s.id)) for s in submissions]
            )
        )
    return task_responses

@router.post("/", response_model=schemas.TaskResponse)
async def create_task(task: schemas.TaskCreate, current_user: models.User = Depends(auth.get_current_admin_user)):
    db_task = models.Task(**task.model_dump(), assigned_by=str(current_user.id))
    await db_task.insert()
    return schemas.TaskResponse(**db_task.model_dump(), id=str(db_task.id), submissions=[])

@router.get("/{task_id}", response_model=schemas.TaskResponse)
async def get_task(task_id: str, current_user: models.User = Depends(auth.get_current_active_user)):
    task = await models.Task.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role != "admin" and task.assigned_to != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to view this task")
    
    submissions = await models.TaskSubmission.find(models.TaskSubmission.task_id == task_id).to_list()
    return schemas.TaskResponse(
        **task.model_dump(),
        id=str(task.id),
        submissions=[schemas.TaskSubmissionResponse(**s.model_dump(), id=str(s.id)) for s in submissions]
    )

@router.put("/{task_id}", response_model=schemas.TaskResponse)
async def update_task(task_id: str, task_update: schemas.TaskUpdate, current_user: models.User = Depends(auth.get_current_active_user)):
    db_task = await models.Task.get(task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Only admins can update anything. Users can only update status.
    update_data = task_update.model_dump(exclude_unset=True)
    if current_user.role != "admin":
        # Check if user is trying to change anything other than status
        allowed_keys = {"status"}
        if any(k not in allowed_keys for k in update_data.keys()):
            raise HTTPException(status_code=403, detail="Not authorized to update task details other than status")
    
    for key, value in update_data.items():
        setattr(db_task, key, value)

    await db_task.save()
    
    submissions = await models.TaskSubmission.find(models.TaskSubmission.task_id == task_id).to_list()
    return schemas.TaskResponse(
        **db_task.model_dump(),
        id=str(db_task.id),
        submissions=[schemas.TaskSubmissionResponse(**s.model_dump(), id=str(s.id)) for s in submissions]
    )

@router.post("/{task_id}/voice", response_model=schemas.TaskResponse)
async def upload_voice_note(task_id: str, file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_admin_user)):
    db_task = await models.Task.get(task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/voice/{unique_filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    db_task.voice_note_path = file_path
    await db_task.save()
    
    submissions = await models.TaskSubmission.find(models.TaskSubmission.task_id == task_id).to_list()
    return schemas.TaskResponse(
        **db_task.model_dump(),
        id=str(db_task.id),
        submissions=[schemas.TaskSubmissionResponse(**s.model_dump(), id=str(s.id)) for s in submissions]
    )

@router.post("/{task_id}/submit", response_model=schemas.TaskSubmissionResponse)
async def submit_task(
    task_id: str, 
    comment: str = Form(None), 
    file: UploadFile = File(None), 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    db_task = await models.Task.get(task_id)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if db_task.assigned_to != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to submit for this task")

    file_path = None
    if file:
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = f"uploads/documents/{unique_filename}"
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
    submission = models.TaskSubmission(
        task_id=task_id,
        user_id=str(current_user.id),
        file_path=file_path,
        comment=comment,
        status="pending"
    )
    
    # Auto-update task status
    db_task.status = "in_review"
    await db_task.save()
    
    await submission.insert()
    return submission

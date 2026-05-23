from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime, timedelta
import models, schemas, auth

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"]
)

@router.get("/leaderboard")
async def get_leaderboard(limit: int = 10):
    users = await models.User.find().sort(-models.User.xp).limit(limit).to_list()
    return [{"username": u.username, "xp": u.xp, "level": u.level, "rank": u.rank, "streak": u.streak} for u in users]

@router.get("/heatmap")
async def get_contribution_heatmap(
    user_id: str = None, 
    current_user: models.User = Depends(auth.get_current_active_user)
):
    target_user_id = user_id if user_id else str(current_user.id)
    
    # Get last 365 days of activity
    thirty_days_ago = datetime.utcnow() - timedelta(days=365)
    
    pipeline = [
        {
            "$match": {
                "user_id": target_user_id,
                "created_at": {"$gte": thirty_days_ago}
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$created_at"
                    }
                },
                "count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "date": "$_id",
                "count": 1
            }
        },
        {
            "$sort": {"date": 1}
        }
    ]
    
    heatmap_data = await models.ActivityLog.aggregate(pipeline).to_list()
    return heatmap_data

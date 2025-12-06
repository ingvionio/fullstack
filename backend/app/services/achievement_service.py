"""Service for handling user achievements."""

from datetime import date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Achievement, Mark, Point, User, UserAchievement
from app.services.gamification_service import add_xp


async def get_or_create_user_achievement(
    db: AsyncSession, user_id: int, achievement_id: int
) -> UserAchievement:
    """Get existing UserAchievement or create a new one if it doesn't exist."""
    existing = await db.execute(
        select(UserAchievement).where(
            UserAchievement.user_id == user_id,
            UserAchievement.achievement_id == achievement_id,
        )
    )
    user_achievement = existing.scalar_one_or_none()
    
    if not user_achievement:
        user_achievement = UserAchievement(
            user_id=user_id,
            achievement_id=achievement_id,
            progress=0,
            is_completed=False,
        )
        db.add(user_achievement)
        await db.commit()
        await db.refresh(user_achievement)
    
    return user_achievement


async def check_and_update_achievement(
    db: AsyncSession, user_id: int, achievement_type: str
) -> list[UserAchievement]:
    """
    Check and update achievements of a specific type for a user.
    
    Returns list of newly completed achievements.
    """
    # Get all achievements of this type
    achievements_query = select(Achievement).where(Achievement.achievement_type == achievement_type)
    result = await db.execute(achievements_query)
    achievements = list(result.scalars().all())
    
    if not achievements:
        return []
    
    newly_completed = []
    
    for achievement in achievements:
        # Get or create user achievement record
        user_achievement = await get_or_create_user_achievement(db, user_id, achievement.id)
        
        # Skip if already completed
        if user_achievement.is_completed:
            continue
        
        # Calculate current progress based on achievement type
        if achievement_type == "marks_count":
            progress = await get_user_marks_count(db, user_id)
        elif achievement_type == "points_count":
            progress = await get_user_points_count(db, user_id)
        elif achievement_type == "marks_streak":
            progress = await get_user_marks_streak(db, user_id)
        else:
            continue
        
        # Update progress
        user_achievement.progress = progress
        
        # Check if achievement is completed
        if progress >= achievement.requirement_value and not user_achievement.is_completed:
            user_achievement.is_completed = True
            user_achievement.completed_at = datetime.utcnow()
            
            # Award XP for completing achievement
            if achievement.xp_reward > 0:
                await add_xp(db, user_id, achievement.xp_reward)
            
            newly_completed.append(user_achievement)
    
    await db.commit()
    
    # Refresh all newly completed achievements
    for ua in newly_completed:
        await db.refresh(ua)
    
    return newly_completed


async def get_user_marks_count(db: AsyncSession, user_id: int) -> int:
    """Get total count of marks (reviews) created by user."""
    result = await db.execute(select(func.count(Mark.id)).where(Mark.user_id == user_id))
    return result.scalar() or 0


async def get_user_points_count(db: AsyncSession, user_id: int) -> int:
    """Get total count of points created by user."""
    result = await db.execute(select(func.count(Point.id)).where(Point.creator_id == user_id))
    return result.scalar() or 0


async def get_user_marks_streak(db: AsyncSession, user_id: int) -> int:
    """
    Calculate current streak of consecutive days with at least one mark.
    Returns the number of consecutive days ending today.
    """
    # Get all marks for this user, ordered by date
    marks_query = select(Mark).where(Mark.user_id == user_id).order_by(Mark.created_at.desc())
    result = await db.execute(marks_query)
    marks = list(result.scalars().all())
    
    if not marks:
        return 0
    
    # Group marks by date
    marks_by_date: dict[date, bool] = {}
    for mark in marks:
        mark_date = mark.created_at.date()
        marks_by_date[mark_date] = True
    
    # Calculate streak starting from today
    current_date = date.today()
    streak = 0
    
    # Check if there's a mark today or yesterday (to allow for timezone differences)
    check_date = current_date
    if check_date not in marks_by_date and (current_date - timedelta(days=1)) not in marks_by_date:
        # If no mark today or yesterday, check if we should start from yesterday
        check_date = current_date - timedelta(days=1)
        if check_date not in marks_by_date:
            return 0
    
    # Count consecutive days backwards
    while check_date in marks_by_date:
        streak += 1
        check_date -= timedelta(days=1)
    
    return streak


async def check_marks_achievements(db: AsyncSession, user_id: int) -> list[UserAchievement]:
    """Check and update all marks-related achievements for a user."""
    return await check_and_update_achievement(db, user_id, "marks_count")


async def check_points_achievements(db: AsyncSession, user_id: int) -> list[UserAchievement]:
    """Check and update all points-related achievements for a user."""
    return await check_and_update_achievement(db, user_id, "points_count")


async def check_streak_achievements(db: AsyncSession, user_id: int) -> list[UserAchievement]:
    """Check and update all streak-related achievements for a user."""
    return await check_and_update_achievement(db, user_id, "marks_streak")


async def get_user_achievements(
    db: AsyncSession, user_id: int, include_incomplete: bool = True
) -> list[UserAchievement]:
    """Get all achievements for a user, optionally including incomplete ones."""
    query = select(UserAchievement).where(UserAchievement.user_id == user_id)
    
    if not include_incomplete:
        query = query.where(UserAchievement.is_completed == True)
    
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_all_achievements_with_user_progress(
    db: AsyncSession, user_id: int
) -> list[dict]:
    """
    Get all achievements with user progress.
    Returns list of dictionaries with achievement and user progress info.
    If user hasn't started an achievement, progress will be 0 and is_completed will be False.
    """
    # Get all achievements
    all_achievements = await list_achievements(db)
    
    # Get user achievements as a dict for quick lookup
    user_achievements_result = await db.execute(
        select(UserAchievement).where(UserAchievement.user_id == user_id)
    )
    user_achievements_list = list(user_achievements_result.scalars().all())
    user_achievements_dict = {ua.achievement_id: ua for ua in user_achievements_list}
    
    # Calculate current progress for each achievement type
    marks_count = await get_user_marks_count(db, user_id)
    points_count = await get_user_points_count(db, user_id)
    marks_streak = await get_user_marks_streak(db, user_id)
    
    result = []
    for achievement in all_achievements:
        # Get user achievement if exists
        user_achievement = user_achievements_dict.get(achievement.id)
        
        # Calculate current progress based on achievement type
        if achievement.achievement_type == "marks_count":
            current_progress = marks_count
        elif achievement.achievement_type == "points_count":
            current_progress = points_count
        elif achievement.achievement_type == "marks_streak":
            current_progress = marks_streak
        else:
            current_progress = 0
        
        # Use user_achievement data if exists, otherwise create default
        if user_achievement:
            # Use saved progress from UserAchievement, but ensure it doesn't exceed current_progress
            # This allows showing saved progress even if real data is different
            progress = user_achievement.progress
            is_completed = user_achievement.is_completed
            completed_at = user_achievement.completed_at
            # Update is_completed if current progress meets requirement (but keep saved progress)
            if current_progress >= achievement.requirement_value and not is_completed:
                is_completed = True
        else:
            # No UserAchievement record exists, use current progress
            progress = current_progress
            is_completed = current_progress >= achievement.requirement_value
            completed_at = None
        
        result.append({
            "achievement": achievement,
            "progress": progress,
            "current_progress": current_progress,
            "is_completed": is_completed,
            "completed_at": completed_at,
            "requirement_value": achievement.requirement_value,
            "xp_reward": achievement.xp_reward,
        })
    
    return result


async def get_achievement(db: AsyncSession, achievement_id: int) -> Achievement:
    """Get an achievement by ID."""
    achievement = await db.get(Achievement, achievement_id)
    if not achievement:
        raise ValueError(f"Achievement with id {achievement_id} not found")
    return achievement


async def list_achievements(db: AsyncSession) -> list[Achievement]:
    """List all available achievements."""
    result = await db.execute(select(Achievement))
    return list(result.scalars().all())


async def initialize_default_achievements(db: AsyncSession) -> None:
    """Initialize default achievements if they don't exist."""
    default_achievements = [
        {
            "name": "Первый отзыв",
            "description": "Оставьте свой первый отзыв",
            "achievement_type": "marks_count",
            "requirement_value": 1,
            "xp_reward": 25,
        },
        {
            "name": "Активный рецензент",
            "description": "Оставьте 10 отзывов",
            "achievement_type": "marks_count",
            "requirement_value": 10,
            "xp_reward": 100,
        },
        {
            "name": "Эксперт по отзывам",
            "description": "Оставьте 50 отзывов",
            "achievement_type": "marks_count",
            "requirement_value": 50,
            "xp_reward": 500,
        },
        {
            "name": "Мастер отзывов",
            "description": "Оставьте 100 отзывов",
            "achievement_type": "marks_count",
            "requirement_value": 100,
            "xp_reward": 1000,
        },
        {
            "name": "Первый объект",
            "description": "Создайте свою первую точку на карте",
            "achievement_type": "points_count",
            "requirement_value": 1,
            "xp_reward": 50,
        },
        {
            "name": "Картограф",
            "description": "Создайте 10 точек на карте",
            "achievement_type": "points_count",
            "requirement_value": 10,
            "xp_reward": 200,
        },
        {
            "name": "Мастер картографии",
            "description": "Создайте 50 точек на карте",
            "achievement_type": "points_count",
            "requirement_value": 50,
            "xp_reward": 1000,
        },
        {
            "name": "Ежедневная активность",
            "description": "Оставляйте отзывы каждый день на протяжении 3 дней",
            "achievement_type": "marks_streak",
            "requirement_value": 3,
            "xp_reward": 75,
        },
        {
            "name": "Неделя активности",
            "description": "Оставляйте отзывы каждый день на протяжении 7 дней",
            "achievement_type": "marks_streak",
            "requirement_value": 7,
            "xp_reward": 200,
        },
        {
            "name": "Декада активности",
            "description": "Оставляйте отзывы каждый день на протяжении 10 дней",
            "achievement_type": "marks_streak",
            "requirement_value": 10,
            "xp_reward": 500,
        },
    ]
    
    for achievement_data in default_achievements:
        # Check if achievement already exists
        existing = await db.execute(
            select(Achievement).where(Achievement.name == achievement_data["name"])
        )
        if existing.scalar_one_or_none():
            continue
        
        achievement = Achievement(**achievement_data)
        db.add(achievement)
    
    await db.commit()


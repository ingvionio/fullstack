"""Service for handling user gamification: XP, levels, and achievements."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User


# XP rewards for different actions
XP_FOR_POINT_CREATION = 50
XP_FOR_MARK_CREATION = 20

# Level calculation: XP required for level N = BASE_XP * (LEVEL_MULTIPLIER ^ (N - 1))
BASE_XP = 100
LEVEL_MULTIPLIER = 1.5


def calculate_level_from_xp(xp: int) -> int:
    """
    Calculate user level based on total XP.
    
    Formula: level is the highest level where total XP >= required XP for that level.
    Level 1: 0 XP
    Level 2: 100 XP
    Level 3: 250 XP (100 * 1.5^1 + 100)
    Level 4: 475 XP (100 * 1.5^2 + 250)
    And so on...
    """
    if xp < BASE_XP:
        return 1
    
    level = 1
    required_xp = 0
    
    while required_xp <= xp:
        level += 1
        required_xp = sum(BASE_XP * (LEVEL_MULTIPLIER ** (i - 1)) for i in range(1, level))
    
    return level - 1


def calculate_xp_for_level(level: int) -> int:
    """Calculate total XP required to reach a specific level."""
    if level <= 1:
        return 0
    
    return int(sum(BASE_XP * (LEVEL_MULTIPLIER ** (i - 1)) for i in range(1, level)))


def calculate_xp_for_next_level(level: int) -> int:
    """Calculate XP required to reach the next level from current level."""
    return calculate_xp_for_level(level + 1)


def get_progress_to_next_level(current_xp: int, current_level: int) -> dict:
    """
    Calculate progress information for current level.
    
    Returns:
        - current_level: current user level
        - current_xp: current total XP
        - xp_for_current_level: XP required to reach current level
        - xp_for_next_level: XP required to reach next level
        - xp_progress: XP gained in current level
        - xp_needed: XP needed to reach next level
        - progress_percentage: percentage progress to next level (0-100)
    """
    xp_for_current_level = calculate_xp_for_level(current_level)
    xp_for_next_level = calculate_xp_for_level(current_level + 1)
    xp_progress = current_xp - xp_for_current_level
    xp_needed = xp_for_next_level - current_xp
    progress_percentage = (xp_progress / (xp_for_next_level - xp_for_current_level) * 100) if (xp_for_next_level - xp_for_current_level) > 0 else 100
    
    return {
        "current_level": current_level,
        "current_xp": current_xp,
        "xp_for_current_level": xp_for_current_level,
        "xp_for_next_level": xp_for_next_level,
        "xp_progress": xp_progress,
        "xp_needed": xp_needed,
        "progress_percentage": round(progress_percentage, 2),
    }


async def add_xp(db: AsyncSession, user_id: int, xp_amount: int) -> User:
    """
    Add XP to user and recalculate level.
    
    Args:
        db: Database session
        user_id: User ID
        xp_amount: Amount of XP to add
        
    Returns:
        Updated User object
    """
    user = await db.get(User, user_id)
    if not user:
        raise ValueError(f"User with id {user_id} not found")
    
    user.xp += xp_amount
    new_level = calculate_level_from_xp(user.xp)
    
    # Update level if it increased
    if new_level > user.level:
        user.level = new_level
    
    await db.commit()
    await db.refresh(user)
    return user


async def add_xp_for_point_creation(db: AsyncSession, user_id: int) -> User:
    """Add XP for creating a point."""
    return await add_xp(db, user_id, XP_FOR_POINT_CREATION)


async def add_xp_for_mark_creation(db: AsyncSession, user_id: int) -> User:
    """Add XP for creating a mark (review)."""
    return await add_xp(db, user_id, XP_FOR_MARK_CREATION)


async def get_user_progress(db: AsyncSession, user_id: int) -> dict:
    """
    Get user progress information including level and XP details.
    
    Returns:
        Dictionary with progress information
    """
    user = await db.get(User, user_id)
    if not user:
        raise ValueError(f"User with id {user_id} not found")
    
    # Recalculate level based on XP to ensure it's always accurate
    calculated_level = calculate_level_from_xp(user.xp)
    
    # Update user level if it's different (sync issue fix)
    if calculated_level != user.level:
        user.level = calculated_level
        await db.commit()
        await db.refresh(user)
    
    progress = get_progress_to_next_level(user.xp, user.level)
    return progress


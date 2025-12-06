# Import all models to ensure they are registered with SQLAlchemy
from app.models import achievement_models  # noqa: F401
from app.models import db_models  # noqa: F401

# Export models for convenience
from app.models.achievement_models import Achievement, UserAchievement
from app.models.db_models import Criteria, Industry, Mark, Point, SubIndustry, User

__all__ = ["User", "Industry", "SubIndustry", "Criteria", "Point", "Mark", "Achievement", "UserAchievement"]

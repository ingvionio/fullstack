from datetime import datetime
from typing import Annotated

from sqlalchemy import DateTime, String, JSON, Text
from sqlalchemy.orm import mapped_column

# Aliases reused across ORM models to keep definitions consistent.
int_pk = Annotated[int, mapped_column(primary_key=True, index=True)]
created_at = Annotated[datetime, mapped_column(DateTime, default=datetime.utcnow, nullable=False)]
str_64 = Annotated[str, mapped_column(String(64))]
str_255 = Annotated[str, mapped_column(String(255))]
json_list_int = Annotated[list[int], mapped_column(JSON)]
json_list_float = Annotated[list[float], mapped_column(JSON)]
json_list_str = Annotated[list[str], mapped_column(JSON)]
text_col = Annotated[str, mapped_column(Text)]

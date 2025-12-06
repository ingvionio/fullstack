"""
Utility script to align the SQLite schema with the current ORM models.

Run once to add missing columns (e.g., after pulling new models):

    python scripts/add_missing_columns.py --db health_map.db
"""

from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path

# Table -> list of (column name, column DDL, backfill expression) tuples.
# SQLite does not allow adding columns with non-constant defaults, so we add
# nullable columns and backfill with the current timestamp where needed.
MIGRATIONS: dict[str, list[tuple[str, str, str | None]]] = {
    "achievements": [
        ("created_at", "DATETIME", "datetime('now')"),
    ],
    "user_achievements": [
        ("completed_at", "DATETIME", None),
        ("created_at", "DATETIME", "datetime('now')"),
    ],
    "industries": [
        ("created_at", "DATETIME", "datetime('now')"),
        ("updated_at", "DATETIME", "datetime('now')"),
    ],
    "sub_industries": [
        ("base_score", "FLOAT NOT NULL DEFAULT 0", None),
        ("created_at", "DATETIME", "datetime('now')"),
        ("updated_at", "DATETIME", "datetime('now')"),
    ],
    "criteria": [
        ("created_at", "DATETIME", "datetime('now')"),
        ("updated_at", "DATETIME", "datetime('now')"),
    ],
    "points": [
        ("created_at", "DATETIME", "datetime('now')"),
        ("updated_at", "DATETIME", "datetime('now')"),
    ],
    "marks": [
        ("updated_at", "DATETIME", "datetime('now')"),
    ],
}


def column_exists(conn: sqlite3.Connection, table: str, column: str) -> bool:
    """Return True if column already exists in the table."""
    cursor = conn.execute(f"PRAGMA table_info({table});")
    return any(row[1] == column for row in cursor.fetchall())


def add_missing_columns(conn: sqlite3.Connection) -> None:
    """Add missing columns defined in MIGRATIONS."""
    for table, columns in MIGRATIONS.items():
        for column, ddl, backfill in columns:
            if column_exists(conn, table, column):
                print(f"[skip] {table}.{column} already exists")
                continue
            print(f"[add]  {table}.{column} -> {ddl}")
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {ddl};")
            if backfill:
                conn.execute(f"UPDATE {table} SET {column} = {backfill} WHERE {column} IS NULL;")


def backfill_null_timestamps(conn: sqlite3.Connection) -> None:
    """
    Ensure existing rows have timestamps where columns are nullable or were added later.
    This prevents API responses from returning null created_at/updated_at.
    """
    cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [row[0] for row in cursor.fetchall()]
    now_expr = "datetime('now')"

    for table in tables:
        info = conn.execute(f"PRAGMA table_info({table});").fetchall()
        cols = {row[1] for row in info}
        for col in ("created_at", "updated_at"):
            if col not in cols:
                continue
            conn.execute(f"UPDATE {table} SET {col} = {now_expr} WHERE {col} IS NULL;")


def main(db_path: Path) -> None:
    if not db_path.exists():
        raise FileNotFoundError(f"Database file not found: {db_path}")

    conn = sqlite3.connect(db_path)
    try:
        add_missing_columns(conn)
        backfill_null_timestamps(conn)
        conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Add missing columns to SQLite DB.")
    parser.add_argument(
        "--db",
        dest="db_path",
        type=Path,
        default=Path("health_map.db"),
        help="Path to SQLite database file (default: health_map.db)",
    )
    args = parser.parse_args()
    main(args.db_path)


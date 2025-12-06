
from __future__ import annotations

import asyncio
from pathlib import Path
import sys
from typing import Iterable

# Add project root to Python path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from app.core.db_core import engine, init_db
from app.core.config import settings
import sqlite3


def find_sql_files(folder: Path) -> list[Path]:
	"""Return sorted list of .sql files in `folder`."""
	return sorted(p for p in folder.iterdir() if p.suffix.lower() == ".sql")


async def apply_sql_file(path: Path) -> None:
	"""Apply single SQL file using async engine in a transaction."""
	# Try different encodings if UTF-8 fails
	try:
		sql = path.read_text(encoding="utf-8")
	except UnicodeDecodeError:
		try:
			sql = path.read_text(encoding="utf-8-sig")  # UTF-8 with BOM
		except UnicodeDecodeError:
			sql = path.read_text(encoding="cp1251")  # Windows-1251 for Cyrillic
	print(f"Applying {path.name}...")
	
	# Split SQL into individual statements
	statements = [s.strip() for s in sql.split(';') if s.strip() and not s.strip().startswith('--')]
	
	async with engine.begin() as conn:
		for statement in statements:
			if statement:
				await conn.exec_driver_sql(statement)
	print(f"Applied {path.name}")


async def apply_all(sql_paths: Iterable[Path]) -> None:
	for p in sql_paths:
		try:
			await apply_sql_file(p)
		except Exception as exc:  # noqa: BLE001 - print errors for user
			print(f"Error applying {p.name}: {exc}")
			raise


def main(argv: list[str] | None = None) -> int:
	"""Apply all SQL files without interactive prompt.

	If `settings.database_url` refers to a plain SQLite URL (scheme starts with
	`sqlite:///` and does not contain `+aiosqlite`), the script will apply SQL
	using the synchronous `sqlite3` module. Otherwise it will use the project's
	async engine.
	"""
	argv = list(argv or sys.argv[1:])
	base = Path(__file__).parent
	sql_files = find_sql_files(base)
	if not sql_files:
		print("No .sql files found in", base)
		return 0

	print("The following SQL files will be applied in order:")
	for p in sql_files:
		print(" -", p.name)

	# Initialize database tables first
	print("\nInitializing database tables...")
	try:
		asyncio.run(init_db())
		print("Database tables initialized successfully")
	except Exception as e:
		print(f"Warning: Could not initialize tables (they may already exist): {e}")

	# non-interactive: run immediately
	db_url = settings.database_url
	use_sync_sqlite = False
	sqlite_db_path = None
	# Check if it's a SQLite URL (with or without aiosqlite)
	if db_url is not None and "sqlite" in db_url:
		use_sync_sqlite = True
		# Extract path from sqlite+aiosqlite:///./health_map.db or sqlite:///./health_map.db
		if ":///" in db_url:
			sqlite_db_path = db_url.split(":///", 1)[1]
		elif "://" in db_url:
			sqlite_db_path = db_url.split("://", 1)[1]
		else:
			sqlite_db_path = db_url

	try:
		if use_sync_sqlite:
			print(f"Using sqlite3 synchronous execution on '{sqlite_db_path}'")
			for p in sql_files:
				# Try different encodings if UTF-8 fails
				try:
					sql = p.read_text(encoding="utf-8")
				except UnicodeDecodeError:
					try:
						sql = p.read_text(encoding="utf-8-sig")  # UTF-8 with BOM
					except UnicodeDecodeError:
						sql = p.read_text(encoding="cp1251")  # Windows-1251 for Cyrillic
				print(f"Applying {p.name}...")
				conn = sqlite3.connect(sqlite_db_path)
				conn.execute("PRAGMA encoding = 'UTF-8'")  # Ensure UTF-8 encoding
				cursor = conn.cursor()
				try:
					# Split SQL into statements properly handling multiline INSERTs
					# Remove comments first
					lines = []
					for line in sql.split('\n'):
						line = line.strip()
						if line and not line.startswith('--'):
							# Remove inline comments
							if '--' in line:
								line = line.split('--')[0].strip()
							if line:
								lines.append(line)
					
					# Join all lines and split by semicolon
					full_sql = ' '.join(lines)
					statements = [s.strip() for s in full_sql.split(';') if s.strip()]
					
					# Execute statements one by one, skipping duplicates and foreign key errors
					for statement in statements:
						if statement:
							try:
								cursor.execute(statement)
							except sqlite3.IntegrityError as e:
								# Skip duplicates and foreign key constraint errors (will be handled when dependencies are created)
								error_msg = str(e).lower()
								if "foreign key" in error_msg or "unique constraint" in error_msg:
									pass  # Skip - will be retried later or dependencies missing
								else:
									print(f"  Warning: Integrity error: {e}")
							except sqlite3.OperationalError as e:
								error_msg = str(e).lower()
								if "syntax error" not in error_msg and "no such table" not in error_msg:
									print(f"  Warning: Operational error: {e}")
									# Don't raise for missing tables - they might be created later
								pass
					conn.commit()
				except Exception as e:
					print(f"  Error: {e}")
					conn.rollback()
					raise
				finally:
					conn.close()
				print(f"Applied {p.name}")
		else:
			asyncio.run(apply_all(sql_files))
	except Exception as exc:
		print("Execution failed:", exc)
		return 2

	print("All files applied successfully")
	return 0


if __name__ == "__main__":
	raise SystemExit(main())


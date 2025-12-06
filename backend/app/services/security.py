from passlib.context import CryptContext

# bcrypt_sha256 позволяет принимать длинные пароли (предхеширует), убирая лимит 72 байт.
pwd_context = CryptContext(
    schemes=["bcrypt_sha256"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """Return a secure hash for the provided password."""

    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    """Validate a password against its hash."""

    return pwd_context.verify(password, hashed_password)

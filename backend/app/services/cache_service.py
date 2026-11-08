import json
import logging
from typing import Any, Optional
import redis
from app.config import settings

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        self.client = None
        self.memory_cache = {}
        if settings.REDIS_ENABLED:
            try:
                self.client = redis.Redis(
                    host=settings.REDIS_HOST,
                    port=settings.REDIS_PORT,
                    password=settings.REDIS_PASSWORD or None,
                    decode_responses=True,
                    socket_connect_timeout=2
                )
                self.client.ping()
                logger.info("Connected to Redis cache successfully.")
            except Exception as e:
                logger.warning(f"Redis not reachable at {settings.REDIS_HOST}:{settings.REDIS_PORT}: {e}. Falling back to in-memory cache.")
                self.client = None

    def get(self, key: str) -> Optional[Any]:
        try:
            if self.client:
                data = self.client.get(key)
                if data:
                    return json.loads(data)
            elif key in self.memory_cache:
                return self.memory_cache[key]
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
        return None

    def set(self, key: str, value: Any, expire_seconds: int = 300) -> None:
        try:
            serialized = json.dumps(value)
            if self.client:
                self.client.setex(key, expire_seconds, serialized)
            else:
                self.memory_cache[key] = value
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")

    def delete(self, key: str) -> None:
        try:
            if self.client:
                self.client.delete(key)
            elif key in self.memory_cache:
                del self.memory_cache[key]
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")

    def clear_prefix(self, prefix: str) -> None:
        try:
            if self.client:
                keys = self.client.keys(f"{prefix}*")
                if keys:
                    self.client.delete(*keys)
            else:
                keys_to_del = [k for k in self.memory_cache if k.startswith(prefix)]
                for k in keys_to_del:
                    del self.memory_cache[k]
        except Exception as e:
            logger.error(f"Cache clear_prefix error for {prefix}: {e}")

cache = CacheService()

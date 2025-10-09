import asyncio
import json
from typing import Literal, Optional
import aio_pika

from .config import settings

_exchange = None

async def get_exchange():
    global _exchange
    if _exchange:
        return _exchange
    connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
    channel = await connection.channel()
    exchange = await channel.declare_exchange(settings.RABBITMQ_EXCHANGE, type=aio_pika.ExchangeType.TOPIC, durable=True)
    _exchange = exchange
    return _exchange

async def publish_user_event(event_type: Literal["user.created", "user.updated"], payload: dict, user_id: str):
    ex = await get_exchange()
    message = aio_pika.Message(
        body=json.dumps({
            "type": event_type,
            "version": "1.0",
            "source": "users-service",
            "user_id": user_id,
            "payload": payload,
        }).encode("utf-8"),
        content_type="application/json",
        delivery_mode=aio_pika.DeliveryMode.PERSISTENT
    )
    routing_key = event_type  # topic e.g., user.created / user.updated
    await ex.publish(message, routing_key=routing_key)

"""
Чаты и сообщения ФРАСЕ.
GET  ?action=list_users   — список всех пользователей (кроме себя)
GET  ?action=conversations — мои диалоги с последним сообщением
GET  ?action=messages&with_user_id=X — сообщения диалога с пользователем X
POST ?action=send          — отправить сообщение {to_user_id, text, type, duration}
"""
import json
import os
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p79293718_frase_messenger_proj")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
    "Content-Type": "application/json",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_by_token(cur, token):
    cur.execute(
        f"""SELECT u.id, u.name, u.username, u.avatar, u.color
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    token = (event.get("headers") or {}).get("X-Auth-Token", "")
    if not token:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Требуется авторизация"})}

    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "")
    method = event.get("httpMethod", "GET")

    conn = get_conn()
    cur = conn.cursor()

    user = get_user_by_token(cur, token)
    if not user:
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

    my_id = user[0]

    if action == "list_users" and method == "GET":
        result = list_users(cur, my_id)
    elif action == "conversations" and method == "GET":
        result = conversations(cur, my_id)
    elif action == "messages" and method == "GET":
        with_user_id = int(qs.get("with_user_id", 0))
        result = messages(cur, my_id, with_user_id)
    elif action == "send" and method == "POST":
        body = json.loads(event.get("body") or "{}")
        result = send_message(cur, conn, my_id, body)
    else:
        conn.close()
        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}

    conn.close()
    return result


def list_users(cur, my_id: int) -> dict:
    cur.execute(
        f"""SELECT id, name, username, avatar, color, online
            FROM {SCHEMA}.users WHERE id != %s ORDER BY name""",
        (my_id,)
    )
    rows = cur.fetchall()
    users = [
        {"id": r[0], "name": r[1], "username": r[2], "avatar": r[3], "color": r[4], "online": r[5]}
        for r in rows
    ]
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"users": users})}


def get_or_create_conversation(cur, conn, user1_id: int, user2_id: int) -> int:
    a, b = min(user1_id, user2_id), max(user1_id, user2_id)
    cur.execute(
        f"SELECT id FROM {SCHEMA}.conversations WHERE user1_id = %s AND user2_id = %s",
        (a, b)
    )
    row = cur.fetchone()
    if row:
        return row[0]
    cur.execute(
        f"INSERT INTO {SCHEMA}.conversations (user1_id, user2_id) VALUES (%s, %s) RETURNING id",
        (a, b)
    )
    conv_id = cur.fetchone()[0]
    conn.commit()
    return conv_id


def conversations(cur, my_id: int) -> dict:
    cur.execute(
        f"""SELECT c.id,
               CASE WHEN c.user1_id = %s THEN c.user2_id ELSE c.user1_id END AS other_id,
               u.name, u.username, u.avatar, u.color, u.online,
               (SELECT m.text FROM {SCHEMA}.messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_text,
               (SELECT m.type FROM {SCHEMA}.messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_type,
               (SELECT m.created_at FROM {SCHEMA}.messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_at,
               (SELECT COUNT(*) FROM {SCHEMA}.messages m WHERE m.conversation_id = c.id AND m.sender_id != %s) AS unread
            FROM {SCHEMA}.conversations c
            JOIN {SCHEMA}.users u ON u.id = CASE WHEN c.user1_id = %s THEN c.user2_id ELSE c.user1_id END
            WHERE c.user1_id = %s OR c.user2_id = %s
            ORDER BY last_at DESC NULLS LAST""",
        (my_id, my_id, my_id, my_id, my_id)
    )
    rows = cur.fetchall()
    result = []
    for r in rows:
        last_text = r[7] or ""
        last_type = r[8] or "text"
        last_at = r[9]
        if last_type == "voice":
            last_text = "Голосовое сообщение"
        time_str = ""
        if last_at:
            time_str = last_at.strftime("%H:%M")
        result.append({
            "conversation_id": r[0],
            "user": {"id": r[1], "name": r[2], "username": r[3], "avatar": r[4], "color": r[5], "online": r[6]},
            "last_message": last_text,
            "time": time_str,
            "unread": int(r[10]),
        })
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"conversations": result})}


def messages(cur, my_id: int, with_user_id: int) -> dict:
    if not with_user_id:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "with_user_id required"})}
    a, b = min(my_id, with_user_id), max(my_id, with_user_id)
    cur.execute(
        f"SELECT id FROM {SCHEMA}.conversations WHERE user1_id = %s AND user2_id = %s",
        (a, b)
    )
    row = cur.fetchone()
    if not row:
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"messages": []})}
    conv_id = row[0]
    cur.execute(
        f"""SELECT id, sender_id, text, type, duration, created_at
            FROM {SCHEMA}.messages WHERE conversation_id = %s ORDER BY created_at ASC""",
        (conv_id,)
    )
    rows = cur.fetchall()
    result = [
        {
            "id": r[0],
            "sender_id": r[1],
            "mine": r[1] == my_id,
            "text": r[2],
            "type": r[3],
            "duration": r[4],
            "time": r[5].strftime("%H:%M"),
        }
        for r in rows
    ]
    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"messages": result})}


def send_message(cur, conn, my_id: int, body: dict) -> dict:
    to_user_id = int(body.get("to_user_id", 0))
    text = (body.get("text") or "").strip()
    msg_type = body.get("type", "text")
    duration = body.get("duration")

    if not to_user_id:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "to_user_id required"})}
    if msg_type == "text" and not text:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пустое сообщение"})}

    conv_id = get_or_create_conversation(cur, conn, my_id, to_user_id)
    cur.execute(
        f"""INSERT INTO {SCHEMA}.messages (conversation_id, sender_id, text, type, duration)
            VALUES (%s, %s, %s, %s, %s) RETURNING id, created_at""",
        (conv_id, my_id, text, msg_type, duration)
    )
    msg_id, created_at = cur.fetchone()
    conn.commit()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "message": {
                "id": msg_id,
                "sender_id": my_id,
                "mine": True,
                "text": text,
                "type": msg_type,
                "duration": duration,
                "time": created_at.strftime("%H:%M"),
            }
        })
    }

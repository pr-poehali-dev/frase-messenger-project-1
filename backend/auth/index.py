"""
Авторизация ФРАСЕ: регистрация, вход, получение профиля, выход.
Методы: POST /register, POST /login, GET /me, POST /logout
"""
import json
import os
import hashlib
import secrets
import psycopg2

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "t_p79293718_frase_messenger_proj")

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Auth-Token",
    "Content-Type": "application/json",
}

COLORS = ["#a855f7", "#22d3ee", "#ec4899", "#10b981", "#f59e0b", "#6366f1"]


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def make_avatar(name: str) -> str:
    parts = name.strip().split()
    if len(parts) >= 2:
        return (parts[0][0] + parts[1][0]).upper()
    return name[:2].upper()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    qs = event.get("queryStringParameters") or {}
    action = qs.get("action", "")

    if action == "register" and method == "POST":
        return register(event)
    if action == "login" and method == "POST":
        return login(event)
    if action == "me" and method == "GET":
        return me(event)
    if action == "logout" and method == "POST":
        return logout(event)

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Not found"})}


def register(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    name = (body.get("name") or "").strip()
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not name or not email or not password:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Заполните все поля"})}
    if len(password) < 6:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Пароль минимум 6 символов"})}

    username = email.split("@")[0].lower().replace(".", "_")
    avatar = make_avatar(name)
    color = COLORS[len(name) % len(COLORS)]
    pw_hash = hash_password(password)

    conn = get_conn()
    cur = conn.cursor()

    cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email = %s", (email,))
    if cur.fetchone():
        conn.close()
        return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "Email уже зарегистрирован"})}

    base_username = username
    suffix = 1
    while True:
        cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE username = %s", (username,))
        if not cur.fetchone():
            break
        username = f"{base_username}{suffix}"
        suffix += 1

    cur.execute(
        f"INSERT INTO {SCHEMA}.users (name, username, email, password_hash, avatar, color) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
        (name, username, email, pw_hash, avatar, color)
    )
    user_id = cur.fetchone()[0]

    token = secrets.token_hex(32)
    cur.execute(
        f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)",
        (user_id, token)
    )
    conn.commit()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "token": token,
            "user": {"id": user_id, "name": name, "username": username, "email": email, "avatar": avatar, "color": color}
        })
    }


def login(event: dict) -> dict:
    body = json.loads(event.get("body") or "{}")
    email = (body.get("email") or "").strip().lower()
    password = body.get("password") or ""

    if not email or not password:
        return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Введите email и пароль"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"SELECT id, name, username, email, avatar, color, password_hash FROM {SCHEMA}.users WHERE email = %s",
        (email,)
    )
    row = cur.fetchone()
    if not row or row[6] != hash_password(password):
        conn.close()
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Неверный email или пароль"})}

    user_id, name, username, email, avatar, color, _ = row
    token = secrets.token_hex(32)
    cur.execute(
        f"INSERT INTO {SCHEMA}.sessions (user_id, token) VALUES (%s, %s)",
        (user_id, token)
    )
    cur.execute(f"UPDATE {SCHEMA}.users SET online = TRUE WHERE id = %s", (user_id,))
    conn.commit()
    conn.close()

    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({
            "token": token,
            "user": {"id": user_id, "name": name, "username": username, "email": email, "avatar": avatar, "color": color}
        })
    }


def me(event: dict) -> dict:
    token = event.get("headers", {}).get("X-Auth-Token") or ""
    if not token:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Требуется авторизация"})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        f"""SELECT u.id, u.name, u.username, u.email, u.avatar, u.color
            FROM {SCHEMA}.sessions s
            JOIN {SCHEMA}.users u ON u.id = s.user_id
            WHERE s.token = %s AND s.expires_at > NOW()""",
        (token,)
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "Сессия истекла"})}

    user_id, name, username, email, avatar, color = row
    return {
        "statusCode": 200,
        "headers": CORS,
        "body": json.dumps({"user": {"id": user_id, "name": name, "username": username, "email": email, "avatar": avatar, "color": color}})
    }


def logout(event: dict) -> dict:
    token = event.get("headers", {}).get("X-Auth-Token") or ""
    if not token:
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"SELECT user_id FROM {SCHEMA}.sessions WHERE token = %s", (token,))
    row = cur.fetchone()
    if row:
        cur.execute(f"UPDATE {SCHEMA}.users SET online = FALSE WHERE id = %s", (row[0],))
    cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at = NOW() WHERE token = %s", (token,))
    conn.commit()
    conn.close()

    return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}
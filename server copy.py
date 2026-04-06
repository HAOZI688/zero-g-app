"""
Zero-G 健身助手 - 数据上传服务器 (带用户认证)
使用方法: python server.py
"""

from flask import Flask, request, jsonify
import json
import os
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from functools import wraps

app = Flask(__name__)

DATA_DIR = './user_data'
USERS_FILE = './users.json'
os.makedirs(DATA_DIR, exist_ok=True)

# 简单的token存储 {token: username}
tokens = {}

def hash_password(password, salt=''):
    """简单的密码哈希"""
    return hashlib.sha256((password + salt).encode()).hexdigest()

def generate_token():
    """生成随机token"""
    return secrets.token_hex(32)

def require_auth(f):
    """验证token的装饰器"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token or token not in tokens:
            return jsonify({'error': '未授权，请重新登录'}), 401
        request.username = tokens[token]
        return f(*args, **kwargs)
    return decorated

# ── 用户认证 ────────────────────────────────────────────────
def load_users():
    if os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f)

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')

        if not username or not password:
            return jsonify({'success': False, 'error': '用户名和密码不能为空'}), 400

        if len(username) < 2 or len(username) > 20:
            return jsonify({'success': False, 'error': '用户名需2-20位'}), 400

        if len(password) < 6:
            return jsonify({'success': False, 'error': '密码至少6位'}), 400

        users = load_users()

        if username in users:
            return jsonify({'success': False, 'error': '用户名已存在'}), 400

        # 创建用户
        users[username] = {
            'password': hash_password(password, username),
            'created': datetime.now().isoformat()
        }
        save_users(users)

        return jsonify({'success': True})

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')

        if not username or not password:
            return jsonify({'success': False, 'error': '用户名和密码不能为空'}), 400

        users = load_users()

        if username not in users:
            return jsonify({'success': False, 'error': '用户名或密码错误'}), 401

        stored_password = users[username]['password']
        if hash_password(password, username) != stored_password:
            return jsonify({'success': False, 'error': '用户名或密码错误'}), 401

        # 生成token
        token = generate_token()
        tokens[token] = username

        return jsonify({
            'success': True,
            'token': token,
            'username': username
        })

    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
@require_auth
def logout():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if token in tokens:
        del tokens[token]
    return jsonify({'success': True})

# ── 数据上传 ────────────────────────────────────────────────
@app.route('/upload', methods=['POST'])
@require_auth
def upload():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        username = request.username
        data_type = data.get('type', 'unknown')

        filename = f"{username}_{data_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        filepath = os.path.join(DATA_DIR, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        # 更新最新数据
        latest_path = os.path.join(DATA_DIR, f"{username}_{data_type}_latest.json")
        with open(latest_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        return jsonify({'success': True, 'filename': filename})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/download/<data_type>', methods=['GET'])
@require_auth
def download(data_type):
    try:
        username = request.username
        latest_path = os.path.join(DATA_DIR, f"{username}_{data_type}_latest.json")
        if os.path.exists(latest_path):
            with open(latest_path, 'r', encoding='utf-8') as f:
                return jsonify(json.load(f))
        return jsonify({'error': 'Data not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'time': datetime.now().isoformat()})

if __name__ == '__main__':
    print("=" * 50)
    print("Zero-G 服务器启动中...")
    print("注册地址: POST http://118.31.223.120:5000/api/register")
    print("登录地址: POST http://118.31.223.120:5000/api/login")
    print("上传地址: POST http://118.31.223.120:5000/upload")
    print("下载地址: GET  http://118.31.223.120:5000/download/<type>")
    print("健康检查: GET  http://118.31.223.120:5000/health")
    print("=" * 50)
    app.run(host='0.0.0.0', port=5000, debug=False)

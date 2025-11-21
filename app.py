from flask import Flask, jsonify, request, render_template, redirect, url_for, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# 🔐 세션용 비밀키
app.secret_key = "domado-secret-key-change-this"

# 📂 DB 파일 위치
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "todolist.db")

# ========================== DB 함수 ==========================
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """서버 처음 켜질 때 users 테이블 없으면 생성"""
    conn = get_db()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    conn.close()

# ========================== 페이지 라우트 ==========================

# START 화면
@app.route("/")
def start():
    return render_template("start.html")  # 필요하면 start.html 대신 login.html로 변경 가능

# 로그인 화면
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT id, username, password FROM users WHERE username = ?", (username,))
        user = cur.fetchone()
        conn.close()

        error = None
        if user is None:
            error = "존재하지 않는 아이디입니다."
        elif not check_password_hash(user["password"], password):
            error = "비밀번호가 일치하지 않습니다."

        if error:
            return render_template("login.html", error=error)

        # 로그인 성공 → 세션 저장
        session["user_id"] = user["id"]
        session["username"] = user["username"]

        return redirect(url_for("todo_index"))

    return render_template("login.html")

# 로그아웃
@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("start"))

# 회원가입
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        if not username or not password:
            return render_template("register.html", error="아이디와 비밀번호를 입력하세요.")

        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE username = ?", (username,))
        if cur.fetchone():
            conn.close()
            return render_template("register.html", error="이미 존재하는 아이디입니다.")

        hashed_pw = generate_password_hash(password)
        cur.execute("INSERT INTO users (username, password) VALUES (?, ?)", (username, hashed_pw))
        conn.commit()
        conn.close()

        return redirect(url_for("login"))

    return render_template("register.html")

# 투두리스트 메인 화면 (로그인 필요)
@app.route("/todo")
def todo_index():
    user_id = session.get("user_id")
    username = session.get("username")

    if user_id is None:
        return redirect(url_for("login"))

    return render_template("index.html", user_id=user_id, username=username)

# ========================== 메모 API ==========================
memos = []

@app.route('/memos', methods=['GET'])
def get_memos():
    return jsonify(memos)

@app.route('/memos', methods=['POST'])
def add_memo():
    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    if not title:
        return jsonify({'message': 'title이 필요합니다.'}), 400
    memo = {
        'id': len(memos) + 1,
        'title': title,
        'content': content
    }
    memos.append(memo)
    return jsonify(memo), 201

@app.route('/memos/<int:memo_id>', methods=['DELETE'])
def delete_memo(memo_id):
    global memos
    new = [m for m in memos if m['id'] != memo_id]
    if len(new) == len(memos):
        return jsonify({'message': '해당 id 없음'}), 404
    memos = new
    return jsonify({'message': '삭제 완료'}), 200

# ========================== 서버 실행 ==========================
if __name__ == "__main__":
    init_db()  # DB 테이블 자동 생성
    app.run(host='0.0.0.0', port=5000, debug=True)

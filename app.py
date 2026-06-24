from flask import Flask, render_template, request, jsonify
import sqlite3

app = Flask(__name__)
DB_FILE = "database.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            skills TEXT NOT NULL,
            contact TEXT NOT NULL,
            members_needed INTEGER NOT NULL DEFAULT 1
        )
    ''')
    conn.commit()
    conn.close()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api/projects', methods=['GET'])
def get_projects():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, description, skills, contact, members_needed FROM projects ORDER BY id DESC")
    rows = cursor.fetchall()
    conn.close()

    projects = []
    for row in rows:
        projects.append({
            "id": row[0],
            "title": row[1],
            "description": row[2],
            "skills": row[3],
            "contact": row[4],
            "members_needed": row[5]
        })
    return jsonify(projects)

@app.route('/api/projects', methods=['POST'])
def add_project():
    data = request.json
    title = data.get('title')
    description = data.get('description')
    skills = data.get('skills')
    contact = data.get('contact')
    members_needed = data.get('members_needed', 1)

    if not all([title, description, skills, contact]):
        return jsonify({"error": "Missing data fields"}), 400

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO projects (title, description, skills, contact, members_needed) VALUES (?, ?, ?, ?, ?)",
        (title, description, skills, contact, int(members_needed))
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Project added successfully!"}), 201

@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Project deleted successfully!"}), 200

@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    data = request.json
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE projects 
        SET title = ?, description = ?, skills = ?, contact = ?, members_needed = ?
        WHERE id = ?
    ''', (data['title'], data['description'], data['skills'], data['contact'], int(data['members_needed']), project_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Project updated successfully!"}), 200

if __name__ == '__main__':
    init_db()
    app.run(debug=True)
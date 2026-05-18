from flask import Flask, request, jsonify
from flask_cors import CORS
from agent import run_agent

app = Flask(__name__)
CORS(app)

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "No question provided"}), 400
    response = run_agent(question)
    return jsonify({"answer": response})

if __name__ == "__main__":
    print("Flask API running on http://localhost:5000")
    app.run(port=5000, debug=True)
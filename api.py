from flask import Flask, request, jsonify
from flask_cors import CORS
from agent import run_agent

app = Flask(__name__)
CORS(app)  # Allows React (localhost:5173) to call this API

@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "")

    if not question:
        return jsonify({"error": "No question provided"}), 400

    try:
        # run_agent() handles everything:
        # 1. Calls LLaMA3 via Groq
        # 2. Detects if a tool is needed
        # 3. Runs the tool (RAG search or Quiz generator)
        # 4. Returns the final answer
        answer = run_agent(question)

        # Detect which tool was used so the frontend can show the badge
        tool_used = None
        if "QUIZ" in answer:
            tool_used = "generer_quiz"
        elif answer and len(answer) > 20:
            tool_used = "chercher_dans_documents"

        return jsonify({
            "answer": answer,
            "tool_used": tool_used
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("Flask API running on http://localhost:5000")
    app.run(port=5000, debug=True)
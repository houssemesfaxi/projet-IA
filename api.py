import json
import re
from flask import Flask, request, jsonify
from flask_cors import CORS
from agent import run_agent

app = Flask(__name__)
CORS(app)


def extract_json(text: str):
    """Try to extract a JSON object from the model response."""
    try:
        return json.loads(text.strip())
    except Exception:
        pass
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass
    match = re.search(r"(\{.*\})", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except Exception:
            pass
    return None


@app.route("/ask", methods=["POST"])
def ask():
    data = request.get_json()
    question = data.get("question", "")

    if not question:
        return jsonify({"error": "No question provided"}), 400

    try:
        answer = run_agent(question)

        # Check if the answer contains quiz JSON
        parsed = extract_json(answer)
        if parsed and parsed.get("type") == "quiz":
            return jsonify({
                "answer": answer,
                "tool_used": "generer_quiz",
                "quiz": parsed
            })

        # Otherwise it's a regular RAG answer
        tool_used = "chercher_dans_documents" if answer and len(answer) > 20 else None
        return jsonify({
            "answer": answer,
            "tool_used": tool_used,
            "quiz": None
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("Flask API running on http://localhost:5000")
    app.run(port=5000, debug=True)
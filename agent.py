import os
from dotenv import load_dotenv

from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import tool
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# ── Configuration ──────────────────────────────────────────────
load_dotenv()

CHROMA_PATH = "db_vectorielle"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
MODEL_NAME = "llama-3.3-70b-versatile"

# ── Embeddings + ChromaDB ──────────────────────────────────────
embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

vector_db = Chroma(
    persist_directory=CHROMA_PATH,
    embedding_function=embeddings
)

retriever = vector_db.as_retriever(search_kwargs={"k": 6})


# ── Outil 1 : RAG — Recherche dans les documents ───────────────
@tool
def chercher_dans_documents(question: str) -> str:
    """Cherche des informations techniques dans les documents (Angular, Spring Boot, etc.)
    et retourne les passages les plus pertinents."""
    docs = retriever.invoke(question)
    if not docs:
        return "Aucune information trouvée dans les documents."
    return "\n\n---\n\n".join([doc.page_content for doc in docs])


# ── Outil 2 : Générateur de Quiz ───────────────────────────────
@tool
def generer_quiz(sujet: str) -> str:
    """Génère un quiz interactif QCM de 5 questions sur un sujet donné.
    Utiliser OBLIGATOIREMENT quand l'utilisateur demande un quiz, des questions,
    un test, une révision ou un QCM. Ne jamais utiliser chercher_dans_documents pour ça."""
    docs = retriever.invoke(sujet)
    if not docs:
        return "QUIZ_ERROR: Aucun document trouvé pour ce sujet."

    contexte = "\n\n".join([doc.page_content for doc in docs[:5]])

    llm_temp = ChatGroq(
        model=MODEL_NAME,
        temperature=0.3,
        api_key=os.getenv("GROQ_API_KEY"),
    )

    prompt = f"""Tu es un professeur. En te basant UNIQUEMENT sur ce contexte, génère un quiz de 5 questions QCM.

Contexte :
{contexte}

IMPORTANT : Respecte EXACTEMENT ce format JSON, sans texte avant ni après :

{{
  "type": "quiz",
  "sujet": "{sujet}",
  "questions": [
    {{
      "id": 1,
      "question": "texte de la question",
      "options": {{
        "A": "texte option A",
        "B": "texte option B",
        "C": "texte option C",
        "D": "texte option D"
      }},
      "reponse": "A",
      "explication": "courte explication pourquoi c'est la bonne réponse"
    }}
  ]
}}

Génère exactement 5 questions. Réponds UNIQUEMENT avec le JSON, rien d'autre."""

    response = llm_temp.invoke(prompt)
    return response.content


# ── Liste des outils ───────────────────────────────────────────
TOOLS = [chercher_dans_documents, generer_quiz]
TOOLS_BY_NAME = {t.name: t for t in TOOLS}


# ── Fonction principale de l'agent ────────────────────────────
def run_agent(question: str) -> str:
    """Envoie une question à l'agent et retourne la réponse."""
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise EnvironmentError(
            "La variable GROQ_API_KEY est absente. Ajoutez-la dans un fichier .env."
        )

    llm = ChatGroq(
        model=MODEL_NAME,
        temperature=0,
        api_key=api_key,
    )

    llm_with_tools = llm.bind_tools(TOOLS)

    messages = [
        SystemMessage(content=(
            "Tu es un assistant technique spécialisé en Angular et Spring Boot. "
            "RÈGLE ABSOLUE : Si l'utilisateur demande un quiz, un QCM, un test ou des questions de révision, "
            "tu DOIS appeler l'outil generer_quiz. N'utilise JAMAIS chercher_dans_documents pour un quiz. "
            "Pour toute autre question technique, utilise chercher_dans_documents. "
            "Base ta réponse finale sur le résultat de l'outil utilisé."
        )),
        HumanMessage(content=question),
    ]

    # Étape 1 : le LLM analyse la question et décide quel outil utiliser
    first_response = llm_with_tools.invoke(messages)
    messages.append(first_response)

    # Étape 2 : si le LLM a demandé un outil, on l'exécute
    if first_response.tool_calls:
        for tool_call in first_response.tool_calls:
            tool_name = tool_call["name"]
            tool_args = tool_call["args"]
            selected_tool = TOOLS_BY_NAME[tool_name]
            tool_output = selected_tool.invoke(tool_args)

            # ── Fix quiz : retourner le JSON directement sans repasser par le LLM
            # Si on repasse par le LLM, il réécrit le JSON en texte normal
            if tool_name == "generer_quiz":
                return tool_output

            messages.append(
                ToolMessage(
                    content=tool_output,
                    tool_call_id=tool_call["id"],
                )
            )

        # Étape 3 : réponse finale (uniquement pour chercher_dans_documents)
        final_response = llm_with_tools.invoke(messages)
        return final_response.content

    return first_response.content


# ── Mode terminal ──────────────────────────────────────────────
if __name__ == "__main__":
    print("--- Agent RAG prêt (Groq + LLaMA3) ---")
    print("Exemples :")
    print("  - Comment créer un composant Angular ?")
    print("  - Génère un quiz sur Spring Boot.")
    print("  - Tapez 'exit' pour quitter.\n")

    while True:
        query = input("Question > ").strip()
        if query.lower() == "exit":
            break
        if not query:
            continue
        try:
            response = run_agent(query)
            print("\n--- Réponse ---")
            print(response)
            print()
        except Exception as e:
            print("Erreur :", e)
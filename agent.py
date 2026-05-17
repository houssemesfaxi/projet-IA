import os
import re
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
from langchain.agents import AgentExecutor, create_react_agent
from langchain import hub
from langchain_core.tools import Tool

# 1. LLM (Ollama)

llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model_name="llama3-8b-8192",
    temperature=0.3,        # Faible = réponses plus précises et moins créatives
    max_tokens=1024,
)
# 2. Embeddings + Vector DB
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

vector_db = Chroma(
    persist_directory="db_vectorielle",
    embedding_function=embeddings
)

retriever = vector_db.as_retriever()

# 3. Fonction RAG
def ask_docs(query: str) -> str:
    docs = retriever.invoke(query)
    if not docs:
        return "Aucune information trouvée dans les documents."

    return "\n\n".join([doc.page_content for doc in docs])

# 4. Tools
tools = [
    Tool(
        name="Documentation_Dev",
        func=ask_docs,
        description="Utilise cet outil pour répondre aux questions techniques liées à Angular ou Spring Boot."
    )
]

# 5. Prompt ReAct (agent)
prompt = hub.pull("hwchase17/react")

# 6. Création Agent
agent = create_react_agent(llm, tools, prompt)

# 7. Executor
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    verbose=True
)

# 8. Test
if __name__ == "__main__":
    print("--- Agentic RAG prêt ---")
    
    while True:
        query = input("\nPose ta question (ou 'exit') : ")
        if query.lower() == "exit":
            break

        try:
            response = agent_executor.invoke({"input": query})
            print("\nRéponse :", response["output"])
        except Exception as e:
            print("Erreur :", e)

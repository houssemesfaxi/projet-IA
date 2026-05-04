import os
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.llms import Ollama
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate

# Imports spécifiques pour l'Agent (Version 0.3+)
from langchain.agents import AgentExecutor, create_react_agent
from langchain import hub
from langchain_core.tools import Tool

# 1. Configuration du LLM (Ollama avec llama3)
llm = Ollama(model="llama3")

# 2. Chargement de ta base vectorielle
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-miniLM-L6-v2")
vector_db = Chroma(persist_directory="db_vectorielle", embedding_function=embeddings)
retriever = vector_db.as_retriever()

# 3. Création de la fonction de recherche (RAG)
def ask_docs(query):
    # Recherche simple par similarité
    docs = retriever.get_relevant_documents(query)
    return "\n\n".join([doc.page_content for doc in docs])

# 4. Définition des outils pour l'Option 3
tools = [
    Tool(
        name="Documentation_Dev",
        func=ask_docs,
        description="Recherche des informations techniques dans les PDF de SpringBoot et Angular."
    )
]

# 5. Initialisation de l'Agent ReAct
# On télécharge la logique de réflexion (le prompt)
prompt = hub.pull("hwchase17/react")

# On crée l'agent
agent = create_react_agent(llm, tools, prompt)

# On crée l'exécuteur qui gère la boucle de réflexion
agent_executor = AgentExecutor(
    agent=agent, 
    tools=tools, 
    verbose=True, 
    handle_parsing_errors=True
)

if __name__ == "__main__":
    print("--- Agentic RAG prêt (Thème Fullstack) ---")
    try:
        agent_executor.invoke({"input": "Comment créer un service en Angular ?"})
    except Exception as e:
        print(f"Erreur d'exécution : {e}")
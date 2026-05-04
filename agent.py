from langchain_community.vectorstores import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.agents import initialize_agent, Tool
from langchain.agents import AgentType
# Note: Tu auras besoin d'un LLM (ex: Ollama ou OpenAI)

# 1. Charger la base de données qu'on va créer
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-miniLM-L6-v2")
vector_db = Chroma(persist_directory="db_vectorielle", embedding_function=embeddings)

# 2. Définir l'outil de recherche (RAG)[cite: 1]
def chercher_dans_doc(query):
    docs = vector_db.similarity_search(query, k=3)
    return "\n".join([d.page_content for d in docs])

tools = [
    Tool(
        name="Documentation_Dev",
        func=chercher_dans_doc,
        description="Utile pour répondre aux questions techniques sur SpringBoot et Angular."
    )
]

# 3. L'Agent (Option 3)[cite: 1]
# Ici, on initialise l'agent qui va "décider" d'utiliser l'outil ci-dessus
# agent = initialize_agent(tools, llm, agent=AgentType.ZERO_SHOT_REACT_DESCRIPTION, verbose=True)
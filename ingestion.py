import os
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma

# 1. Chemins des dossiers
DATA_PATH = "data/"
CHROMA_PATH = "db_vectorielle"

def create_vector_db():
    # Vérifier si le dossier data contient des fichiers
    if not os.listdir(DATA_PATH):
        print(f"Erreur : Le dossier {DATA_PATH} est vide. Ajoute tes PDF !")
        return

    # 2. Chargement des documents (PDF)
    print("Chargement des documents en cours...")
    loader = DirectoryLoader(DATA_PATH, glob="*.pdf", loader_cls=PyPDFLoader)
    documents = loader.load()
    
    # 3. Chunking (Découpage du texte)
    # On découpe le texte en morceaux de 1000 caractères pour que l'IA ne soit pas submergée
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000, 
        chunk_overlap=150  # On garde un peu de contexte entre deux morceaux
    )
    chunks = text_splitter.split_documents(documents)
    print(f"{len(chunks)} morceaux de texte créés.")

    # 4. Création des Embeddings (Modèle de Hugging Face)
    # Ce modèle transforme le texte en nombres (vecteurs)
    print("Génération des embeddings (cela peut prendre un moment)...")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-miniLM-L6-v2")

    # 5. Stockage dans ChromaDB
    vector_db = Chroma.from_documents(
        chunks, 
        embeddings, 
        persist_directory=CHROMA_PATH
    )
    
    print(f"Succès ! Ta base vectorielle est prête dans : {CHROMA_PATH}")

if __name__ == "__main__":
    create_vector_db()
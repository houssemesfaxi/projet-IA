import os
from pathlib import Path
from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_chroma import Chroma

# ── Configuration ──────────────────────────────────────────────
DATA_PATH = "data/"
CHROMA_PATH = "db_vectorielle"
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
CHUNK_SIZE = 800
CHUNK_OVERLAP = 150


def create_vector_db():
    # Vérifier si le dossier data/ existe et contient des PDFs
    if not os.path.exists(DATA_PATH) or not os.listdir(DATA_PATH):
        print(f"Erreur : le dossier '{DATA_PATH}' est vide ou inexistant.")
        print("Ajoute tes fichiers PDF dans le dossier data/ puis relance.")
        return

    # 1. Chargement des PDF
    print("Chargement des documents PDF...")
    loader = DirectoryLoader(DATA_PATH, glob="*.pdf", loader_cls=PyPDFLoader)
    documents = loader.load()
    print(f"  {len(documents)} page(s) chargée(s).")

    # 2. Chunking — découpage en morceaux
    # Pourquoi ? Le LLM ne peut pas lire un document entier d'un coup.
    # CHUNK_SIZE = 800 : chaque morceau fait environ 800 caractères.
    # CHUNK_OVERLAP = 150 : deux morceaux se chevauchent pour ne pas perdre le contexte.
    print("Découpage en chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = text_splitter.split_documents(documents)
    print(f"  {len(chunks)} morceaux créés.")

    # 3. Embeddings — transformation du texte en vecteurs numériques
    # Un embedding = représentation numérique d'un texte.
    # Des textes similaires donnent des vecteurs proches → utile pour la recherche.
    print("Génération des embeddings (peut prendre 1-2 minutes)...")
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

    # 4. Stockage dans ChromaDB
    print("Stockage dans ChromaDB...")
    Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PATH,
    )

    print(f"\nBase vectorielle prête dans : '{CHROMA_PATH}/'")
    print("Lance maintenant : python agent.py")


if __name__ == "__main__":
    create_vector_db()

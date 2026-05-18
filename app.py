import streamlit as st
from agent import run_agent

# ── Configuration page ─────────────────────────────
st.set_page_config(
    page_title="Agent RAG IA",
    page_icon="🤖",
    layout="centered"
)

# ── Titre ──────────────────────────────────────────
st.title("🤖 ASSITANT ACADEMIQUE ")

st.markdown("""
Pose une question technique ou demande un quiz.

### Exemples :
- Comment créer un composant Angular ?
- Génère un quiz sur Spring Boot
- Explique les services Angular
""")

# ── Champ utilisateur ─────────────────────────────
question = st.text_input("Votre question :")

# ── Bouton ────────────────────────────────────────
if st.button("Envoyer"):

    if question.strip() == "":
        st.warning("Veuillez saisir une question.")
    else:

        with st.spinner("Réflexion en cours..."):

            try:
                response = run_agent(question)

                st.success("Réponse générée")

                st.markdown("### Réponse :")
                st.write(response)

            except Exception as e:
                st.error(f"Erreur : {e}")
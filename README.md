# 🎤 Donner La Parole - Viral Factory

## 🚀 Le Concept
**Donner La Parole** est une plateforme innovante qui transforme les témoignages vécus en vidéos virales TikTok. Propulsée par une intelligence artificielle multi-agents (inspirée de CrewAI), elle automatise tout le processus : de la soumission du récit jusqu'au montage vidéo final, incarné par la voix clonée de **Dolunaelka**.

---

## 🏗️ Architecture Technique

### 🎨 Frontend (React + Vite)
- **Style Premium** : Mode sombre, gradients émeraude/violet, animations fluides (Framer Motion).
- **Tableau de Bord Client** : Gamification (badges de créateur), suivi de production en temps réel et Wallet (Stripe Connect).
- **Centre de Commande Admin** : Gestion du "Crible" (sélection IA), Studio d'édition de scripts, et gestion centralisée des Clés API.

### ⚙️ Backend (Node.js + Express)
- **Multi-Agent System** : Simulation d'agents spécialisés utilisant **Gemini 1.5 Pro**.
- **Production Engine** : Orchestrateur de flux gérant les appels API externes et la synchronisation des assets.
- **Storage** : Firebase (Firestore pour les données, Storage pour les fichiers médias).

---

## 🤖 Le Workflow des Agents (inspiré de CrewAI)

La plateforme utilise un "Crew" d'IA travaillant en séquence :

1.  **🕵️ Scout Agent** : Analyse l'histoire soumise et lui attribue un **Score de Virilité** (potentiel de partage).
2.  **✍️ Curator Agent (Persona: Dolu)** : Réécrit le récit brut en un script TikTok percutant, avec le ton, les expressions (Créole/Antillais) et le rythme de Dolunaelka.
3.  **👁️ Visual Agent** : Génère des prompts ultra-détaillés pour chaque segment du script destinés à la génération d'images.
4.  **📣 Manager Agent** : Coordonne la production et prépare les métadonnées pour TikTok (hashtags, hooks).

---

## 🎬 Pipeline de Production Média

| Composant | Technologie | Rôle |
| :--- | :--- | :--- |
| **Scripting** | Gemini 1.5 Pro | Intelligence narrative et ton "Dolu". |
| **Images** | FLUX (Fal.ai) | Génération visuelle haute fidélité. |
| **Audio** | GPT-SoVITS / Fish Speech | Clonage de voix premium (>89% de ressemblance). |
| **Vidéo** | FFmpeg / Remotion | Assemblage final, sous-titres dynamiques et mixage audio. |

---

## 🧭 Guide d'Utilisation

### Pour les Clients (Followers)
1. Dépose ton histoire via le formulaire (Landing Page).
2. Signe l'accord légal (Partage des gains 40/60).
3. Suis l'évolution de ta vidéo sur ton Dashboard.
4. Récupère tes gains une fois la vidéo publiée et monétisée.

### Pour l'Admin (Dolu & Team)
1. Accède au **Command Center**.
2. Sélectionne les meilleures pépites dans le **Crible**.
3. Valide ou modifie le script et les visuels dans le **Studio**.
4. Configure les **Clés API** globales pour alimenter tout le système.

---

## 🛠️ Installation & Tech Stack
- **Node.js** (v18+)
- **React 18** (Tailwind CSS, Lucide-React, Framer Motion)
- **Firebase** (Firestore, Admin SDK)
- **External APIs** : Google GenAI (Gemini), Fal.ai, OpenAI.

---

> [!IMPORTANT]
> **Donner La Parole** n'est pas qu'un outil technique, c'est un écosystème équitable où chaque histoire a sa valeur et chaque créateur sa juste part (40%).

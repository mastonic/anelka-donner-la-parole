#!/bin/bash

# Script de déploiement automatique pour DOLUANELKA
# Usage: ./deploy.sh

PROJECT_ID="dolunaleka"

echo "🚀 Début du déploiement global..."

# 1. Cloud Functions
echo "--- 📦 Préparation des Cloud Functions ---"
cd functions
npm install
firebase deploy --only functions --project $PROJECT_ID --non-interactive
cd ..

# 2. Frontend Build
echo "--- 🎨 Build du Frontend ---"
cd frontend
npm install
npm run build
cd ..

# 3. Firebase Hosting
echo "--- 🌐 Mise en ligne (Hosting) ---"
firebase deploy --only hosting --project $PROJECT_ID --non-interactive

echo "✅ Déploiement terminé avec succès !"
echo "Lien : https://dolunaleka.web.app"

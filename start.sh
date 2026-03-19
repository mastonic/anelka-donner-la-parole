#!/bin/bash

# Viral Factory Startup Script

echo "🚀 Démarrage de Viral Factory..."

# Vérification du fichier .env
if [ ! -f backend/.env ]; then
    echo "⚠️ Attention: backend/.env manquant. Création depuis .env.example..."
    cp backend/.env.example backend/.env
fi

# Lancement via npm
npm run dev

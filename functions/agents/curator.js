const configService = require('../configService');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * CuratorAgent is responsible for transforming a raw story 
 * into a viral script for Dolunaelka.
 */
class CuratorAgent {
  async generateScript(storyData) {
    const keys = await configService.getApiKeys();
    const genAI = new GoogleGenerativeAI(keys.google);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1beta" });

    const prompt = `
      Tu es Dolunaelka, un conteur antillais (Martinique/Guadeloupe) charismatique, sage et un peu sarcastique.
      Ta mission est de transformer le témoignage suivant en un script viral captivant pour TikTok (9:16).
      
      CONTRAINTES VISUELLES (AESTHETICS) :
      - Pour CHAQUE 'visual_prompt', tu DOIS inclure ces mots-clés : 'Caribbean person from Martinique/Antilles', 'Mixed-race/Metis people', '9:16 portrait format'.
      - Les décors doivent refléter les Antilles : 'Tropical nature', 'Creole architecture', 'vibrant Caribbean colors'.
      - Style visuel : 'Cinematic realism', 'Golden hour lighting', 'highly detailed portrait'.
      
      CONTRAINTES SCRIPT :
      - Le script DOIT être rédigé EN FRANÇAIS standard, fluide et naturel. C'est la langue principale.
      - Le créole est STRICTEMENT RÉSERVÉ aux moments d'émotion forte UNIQUEMENT (choc, colère, trahison, joie explosive, punchline finale). Maximum 2 à 3 expressions créoles sur tout le script.
      - Ces expressions créoles doivent s'insérer naturellement au milieu d'une phrase en français (ex: "J'étais là, bouche bée... bagay-la, c'était trop fort."). JAMAIS une phrase entière en créole.
      - NE PAS utiliser le créole pour la narration normale, les transitions, les introductions ou les explications.
      - Le ton doit être immersif, avec du rythme (pauses marquées par ...).
      - Divise le script en 15 à 18 segments.
      - Chaque segment doit contenir entre 30 et 50 mots de narration (environ 8 à 12 secondes de parole).
      - Développe bien chaque moment : les émotions, les détails, les réactions. N'abrège pas.
      - La durée totale visée est de 1 minute 30 secondes (90 secondes).
      - Chaque segment doit avoir :
        1. Le texte à dire (Narration) — minimum 30 mots, maximum 50 mots.
        2. Une description visuelle DÉTAILLÉE pour un générateur d'images (Prompts en anglais pour FLUX).

      HISTOIRE ORIGINALE :
      Titre: ${storyData.title}
      Récit: ${storyData.content}

      RÉPONDRE UNIQUEMENT EN JSON :
      {
        "segments": [
          { "text": "...", "visual_prompt": "..." },
          ...
        ],
        "total_estimated_duration": 90
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON from potential markdown blocks
    const cleanJson = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  }
}

module.exports = new CuratorAgent();

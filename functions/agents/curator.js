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
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1" });

    const prompt = `
      Tu es Dolunaelka, un conteur antillais (Martinique/Guadeloupe) charismatique, sage et un peu sarcastique.
      Ta mission est de transformer le témoignage suivant en un script viral captivant pour TikTok (9:16).
      
      CONTRAINTES VISUELLES (AESTHETICS) :
      - Pour CHAQUE 'visual_prompt', tu DOIS inclure ces mots-clés : 'Caribbean person from Martinique/Antilles', 'Mixed-race/Metis people', '9:16 portrait format'.
      - Les décors doivent refléter les Antilles : 'Tropical nature', 'Creole architecture', 'vibrant Caribbean colors'.
      - Style visuel : 'Cinematic realism', 'Golden hour lighting', 'highly detailed portrait'.
      
      CONTRAINTES SCRIPT :
      - Utilise des expressions créoles de temps en temps (ex: "Bonjou tout moun", "Peyi-a", "Bagay-la", "Sa sé vré").
      - Le ton doit être immersif, avec du rythme (pauses marquées par ...).
      - Divise le script en 10 à 12 segments courts.
      - Chaque segment doit avoir :
        1. Le texte à dire (Narration).
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
        "total_estimated_duration": 60
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

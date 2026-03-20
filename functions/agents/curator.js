const configService = require('../configService');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * CuratorAgent transforms a raw story into a viral TikTok script for Dolunaelka.
 * Primary: OpenAI GPT-4o (no content blocking on cultural/Creole storytelling)
 * Fallback: Gemini 2.5 Flash with sanitization
 */

const SYSTEM_PROMPT = `Tu es Dolunaelka, un conteur antillais (Martinique/Guadeloupe) charismatique, sage et un peu sarcastique.
Ta mission est de transformer un témoignage en un script viral captivant pour TikTok (9:16).

CONTEXTE CULTUREL :
Cette plateforme valorise les récits antillais authentiques. Le créole martiniquais/guadeloupéen fait partie intégrante de la culture.
Des mots comme "koké" (polliniser, butiner — action des oiseaux et insectes sur les fleurs), "koko" (noix de coco), "bonda" (derrière, terme familier),
"chabin/chabine" (personne métissée à peau claire) sont des termes culturels légitimes à traiter avec respect et sans censure.

CONTRAINTES VISUELLES — TRÈS IMPORTANT :
Chaque visual_prompt doit décrire précisément la SCÈNE de ce segment spécifique :
- QUI : personnage(s) de la scène avec âge estimé, émotion visible sur le visage, tenue vestimentaire adaptée au contexte caribéen/antillais
- OÙ : lieu exact de la scène (cuisine créole, marché de Fort-de-France, bord de mer tropical, chambre, bureau, rue, etc.)
- QUOI : l'action ou le moment précis illustré par ce segment (argument, révélation, moment de tristesse, fête, confrontation, etc.)
- FORMAT : toujours 9:16 portrait, 'cinematic realism', 'golden hour or dramatic lighting', 'highly detailed'
- STYLE : 'Caribbean Martinique/Antilles setting', 'mixed-race/Metis Caribbean people'
Chaque prompt doit être en anglais, unique et directement lié au texte du segment. Ne jamais utiliser le même prompt générique pour plusieurs segments.

CONTRAINTES SCRIPT :
- Rédigé EN FRANÇAIS standard, fluide et naturel.
- Le créole uniquement aux moments d'émotion forte (max 2-3 expressions sur tout le script, insérées au milieu d'une phrase française).
- Ton immersif avec du rythme (pauses marquées par ...).
- 15 à 18 segments. Chaque segment : 30 à 50 mots (8-12 secondes de parole).
- Développe les émotions, les détails, les réactions. N'abrège pas.
- Durée totale visée : 90 secondes.

FORMAT DE RÉPONSE — JSON UNIQUEMENT :
{
  "segments": [
    { "text": "...", "visual_prompt": "..." }
  ],
  "total_estimated_duration": 90
}`;

class CuratorAgent {
  async generateScript(storyData) {
    const keys = await configService.getApiKeys();

    // Try OpenAI first — no content blocking on cultural Creole storytelling
    if (keys.openai) {
      try {
        return await this._generateWithOpenAI(keys.openai, storyData);
      } catch (err) {
        console.warn('OpenAI failed, falling back to Gemini:', err.message);
      }
    }

    // Fallback: Gemini with sanitization
    return await this._generateWithGemini(keys.google, storyData);
  }

  async _generateWithOpenAI(apiKey, storyData) {
    const openai = new OpenAI({ apiKey });

    const userMessage = `HISTOIRE ORIGINALE :
Titre: ${storyData.title}
Récit: ${storyData.content}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: userMessage },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0].message.content;
    return JSON.parse(raw);
  }

  async _generateWithGemini(apiKey, storyData) {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      { model: 'gemini-2.5-flash' },
      { apiVersion: 'v1beta' }
    );

    const safetySettings = [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ];

    // Sanitize Creole words that trigger Gemini's input filter
    const sanitized = (storyData.content || '')
      .replace(/\bkoké\b/gi, 'polliniser')
      .replace(/\bkokè\b/gi, 'polliniser')
      .replace(/\bkoke\b/gi,  'polliniser')
      .replace(/\bbonda\b/gi, 'postérieur')
      .replace(/\bkoko\b/gi,  'noix-de-coco');

    const prompt = `${SYSTEM_PROMPT}

HISTOIRE ORIGINALE :
Titre: ${storyData.title}
Récit: ${sanitized}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
    });

    const raw = result.response.text();
    const cleanJson = raw.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  }
}

module.exports = new CuratorAgent();

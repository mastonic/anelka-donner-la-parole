const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Live-Manager Agent: Generates a TikTok Live interaction guide based on the script.
 */
class LiveManagerAgent {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateLiveGuide(scriptContent) {
    const prompt = `Basé sur ce script viral : "${scriptContent}"
    Génère une fiche d'interaction pour un Live TikTok.
    Inclure :
    - 3 questions pour engager l'audience.
    - 5 points clés à clarifier ou approfondir pendant le live.
    - Des suggestions de réactions face aux commentaires.
    
    Format : JSON { "engagement_questions": [string], "key_points": [string], "reaction_tips": [string] }`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  }
}

module.exports = LiveManagerAgent;

const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Visual Agent: Creates a storyboard JSON cut into 5-8s clips.
 * Descriptions in English for video generation models.
 */
class VisualAgent {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1" });
  }

  async generateStoryboard(script) {
    const prompt = `Based on the following script: "${script.script}"
    
    Create a storyboard for a 2m30s video (150 seconds).
    Divide the video into clips of 5 to 8 seconds each.
    For each clip, provide:
    1. Visual description in English (detailed).
    2. A precise video generation prompt in English describing the character: "A mixed-race woman from Martinique, expressive, authentic, in a modern Caribbean setting".
    3. Duration (5-8 seconds).
    
    Format: JSON { "storyboard": [{ "clip_id": number, "duration": number, "prompt": string, "description": string }] }`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  }
}

module.exports = VisualAgent;

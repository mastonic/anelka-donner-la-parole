const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Scout Agent: Analyzes trends and verifies facts via Google Search.
 */
class ScoutAgent {
  constructor(apiKey) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // Note: In a real environment, search capability is enabled via tools.
    });
  }

  async analyzeTrends(topic) {
    const prompt = `Analyze current trends and verify key facts related to the topic: "${topic}". 
    Focus on social media virality (TikTok/Reels). 
    Return a list of 5 key insights that can be used for a viral video script.
    Output format: JSON { "insights": [string], "trends": [string] }`;

    const result = await this.model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    // Clean JSON if needed
    text = text.replace(/```json|```/g, "").trim();
    return JSON.parse(text);
  }
}

module.exports = ScoutAgent;

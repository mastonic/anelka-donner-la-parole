const configService = require('../configService');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * VisualArtDirectorAgent transforms text-only story segments into rich,
 * cinematic visual prompts for a high-end image generator (FLUX).
 * Primary: OpenAI GPT-4o
 * Fallback: Gemini 2.5 Flash
 */

const SYSTEM_PROMPT = `Identity: Dolunaelka's Visual Art Director. You are a visual storytelling expert specialized in rendering authentic Caribbean life and culture. Your goal is to transform written narrative into detailed, evocative, and technically precise prompts for a high-end AI image generator (like FLUX).

Mission: Receive a sequence of story segments (text only) and generate a distinct, richly described "visual_prompt" for each segment.

Core Principles for Image Generation:
1. Narrative Textures: Instead of "clean" stock photos, create images that suggest a past and a future. Request details like 'weathered skin', 'faded cotton', 'dust motes dancing in light', or 'rusted metal'.
2. Emotional Anchors: Translate abstract emotions into specific physical actions and facial expressions. Don't say "he is sad," say "he is sitting alone, head in hands, with tear streaks on his face."
3. The "Reality" Principle: If the text contains idioms, puns, or double-meanings, always render the literal physical reality described, not the metaphor.
4. Show, Don't Tell: Focus on visual elements that tell the story.

Technical Style Guide (Caribbean Cinematic):
1. Style: Cinematic realism, authentic Caribbean (French West Indies) aesthetic.
2. People: Authentic Afro-Caribbean or Metis Caribbean faces, emphasizing natural age and character. (Specify wrinkles, textures).
3. Lighting: Dramatic lighting (Golden Hour, moody shadows, harsh midday sun, or soft moonlight) to match the emotion.
4. Details: Must include specific tropical plant names (Balisier, Hibiscus, Bougainvillea), local architectural styles (creole houses with galleries), or local objects.
5. Format: Must specify 9:16 portrait.

Output Format: A JSON object with key "visual_prompts" containing an array where each element has a "visual_prompt" field corresponding to the input segment, in the same order.
Example Output:
{
  "visual_prompts": [
    { "visual_prompt": "Cinematic portrait, medium close-up, of Man Seraphine (80, Afro-Caribbean, kind wrinkled face). She is sitting on a worn wooden gallery, gesticulating wildly with a look of pure, joyful passion in her eyes. Golden hour light. 9:16." },
    { "visual_prompt": "Close-up high-speed photograph of a vibrant hummingbird with emerald feathers, hovering as it pollinates a bright red Balisier flower. Focus is razor sharp on the bird and flower. Lush tropical garden background blur. 9:16." }
  ]
}`;

class VisualArtDirectorAgent {
  _buildUserMessage(segments) {
    const numbered = segments.map((s, i) => ({ index: i + 1, text: s.text }));
    return `Here are the story segments (text only). Generate one "visual_prompt" for each segment, in the same order:\n\n${JSON.stringify(numbered, null, 2)}`;
  }

  async generateVisualPrompts(segments) {
    const keys = await configService.getApiKeys();

    if (keys.openai) {
      try {
        return await this._generateWithOpenAI(keys.openai, segments);
      } catch (err) {
        console.warn('OpenAI failed for art director, falling back to Gemini:', err.message);
      }
    }

    return await this._generateWithGemini(keys.google, segments);
  }

  async _generateWithOpenAI(apiKey, segments) {
    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: this._buildUserMessage(segments) },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const parsed = JSON.parse(completion.choices[0].message.content);
    return parsed.visual_prompts || [];
  }

  async _generateWithGemini(apiKey, segments) {
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

    const prompt = `${SYSTEM_PROMPT}\n\n${this._buildUserMessage(segments)}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      safetySettings,
    });

    const raw = result.response.text().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    return parsed.visual_prompts || (Array.isArray(parsed) ? parsed : []);
  }
}

module.exports = new VisualArtDirectorAgent();

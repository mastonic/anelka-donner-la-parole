const admin = require('firebase-admin');

class ConfigService {
  constructor() {
    this.configPath = 'config/api_keys';
  }

  get db() {
    return admin.firestore();
  }

  async getApiKeys() {
    try {
      const doc = await this.db.doc(this.configPath).get();
      if (!doc.exists) {
        console.warn('⚠️ No API keys found in Firestore. Using environment variables.');
        return {
          openai: process.env.OPENAI_API_KEY,
          google: process.env.GEMINI_API_KEY,
          fal: process.env.FAL_KEY,
          fish: process.env.FISH_SPEECH_KEY
        };
      }
      return doc.data();
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return {};
    }
  }

  async getApiKey(service) {
    const keys = await this.getApiKeys();
    return keys[service];
  }

  async updateApiKeys(keys) {
    try {
      await this.db.doc(this.configPath).set(keys, { merge: true });
      return { success: true };
    } catch (error) {
      console.error('Error updating API keys:', error);
      throw error;
    }
  }
}

module.exports = new ConfigService();

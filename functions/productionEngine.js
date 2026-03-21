const curatorAgent = require('./agents/curator');
const artDirectorAgent = require('./agents/art_director');
const configService = require('./configService');
const axios = require('axios');
const admin = require('firebase-admin');
const path = require('path');

class ProductionEngine {
  constructor() {
    this.db = admin.firestore();
  }

  // Télécharge une image depuis une URL Fal.ai et la stocke dans Firebase Storage
  async uploadImageToStorage(imageUrl, storyId, index) {
    try {
      const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data);
      const bucket = admin.storage().bucket();
      const filePath = `stories/${storyId}/segment_${index}.jpg`;
      const file = bucket.file(filePath);
      await file.save(buffer, { contentType: 'image/jpeg', metadata: { cacheControl: 'public, max-age=31536000' } });
      await file.makePublic();
      return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    } catch (err) {
      console.error(`Failed to upload image ${index} to Storage:`, err.message);
      return imageUrl; // fallback sur l'URL Fal.ai originale
    }
  }

  async startProduction(storyId) {
    console.log(`🚀 Starting production for story: ${storyId}`);
    
    const storyRef = this.db.collection('stories').doc(storyId);
    const storyDoc = await storyRef.get();
    if (!storyDoc.exists) throw new Error('Histoire non trouvée dans la base de données.');
    const storyData = storyDoc.data();

    // 0. Validate Config
    const keys = await configService.getApiKeys();
    if (!keys.google) throw new Error("Clé Google AI manquante. Configure-la dans les Paramètres.");
    if (!keys.fal) throw new Error("Clé Fal.ai manquante. Configure-la dans les Paramètres.");

    try {
      // 1. Script Generation
      console.log('--- Step 1: Generating Script ---');
      await storyRef.update({ 
        status: 'generating_script',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const productionData = await curatorAgent.generateScript(storyData);

      if (!productionData || !Array.isArray(productionData.segments)) {
        throw new Error("L'IA n'a pas généré de segments valides. Réessaye avec un autre sujet.");
      }

      // 1.5. Visual Prompt Generation
      console.log('--- Step 1.5: Generating Visual Prompts (Art Director) ---');
      await storyRef.update({
        status: 'generating_visual_prompts',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      const visualPrompts = await artDirectorAgent.generateVisualPrompts(productionData.segments);

      // Merge text segments with their visual prompts
      const enrichedSegments = productionData.segments.map((seg, i) => ({
        ...seg,
        visual_prompt: visualPrompts[i]?.visual_prompt || '',
      }));

      await storyRef.update({
        status: 'generating_images',
        script: enrichedSegments,
        productionData: { ...productionData, segments: enrichedSegments }
      });

      // 2. Media Generation (Images with Fixed Seed)
      console.log('--- Step 2: Generating Media Assets (FLUX) ---');
      const seed = Math.floor(Math.random() * 1000000);

      const segmentsWithImages = await Promise.all(enrichedSegments.map(async (seg, index) => {
        console.log(`Generating image for segment ${index + 1}/${enrichedSegments.length}...`);
        try {
          const response = await axios.post('https://fal.run/fal-ai/flux/schnell', {
            prompt: `(Dolu Character: A handsome young Metis man from the Antilles, medium-toned tan skin, short stylish hair, athletic build) ${seg.visual_prompt}, cinematic 8k, highly detailed textures, vibrant colors, 9:16 portrait orientation`,
            image_size: "portrait_4_3",
            seed: seed,
            num_inference_steps: 4
          }, {
            headers: { 'Authorization': `Key ${keys.fal}` }
          });
          
          const falUrl = response.data.images[0].url;
          // Stocker dans Firebase Storage pour URL permanente
          const permanentUrl = await this.uploadImageToStorage(falUrl, storyId, index);
          return {
            ...seg,
            img_url: permanentUrl
          };
        } catch (err) {
          console.error(`Failed to generate image ${index}:`, err.message);
          return { ...seg, img_url: null, error: "Image generation failed" };
        }
      }));

      // 3. Finalize
      await storyRef.update({ 
        status: 'validée', // This will trigger the Cloud Function to start the VM
        segments: segmentsWithImages,
        visualSeed: seed,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`✅ Assets prepared for ${storyId}. Pipeline optimized.`);
      return { success: true, jobId: storyId };

    } catch (error) {
      console.error('❌ Production Pipeline Failed:', error);
      await storyRef.update({ 
        status: 'error_production', 
        feedback: error.message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      throw error;
    }
  }
}

module.exports = new ProductionEngine();

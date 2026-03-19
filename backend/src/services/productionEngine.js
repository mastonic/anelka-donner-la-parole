const curatorAgent = require('../agents/curator');
const configService = require('./configService');
const axios = require('axios');
const admin = require('firebase-admin');

class ProductionEngine {
  constructor() {
    this.db = admin.firestore();
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

      await storyRef.update({ 
        status: 'generating_images',
        script: productionData.segments,
        productionData: productionData
      });

      // 2. Media Generation (Images with Fixed Seed)
      console.log('--- Step 2: Generating Media Assets (FLUX) ---');
      const seed = Math.floor(Math.random() * 1000000);
      
      const segmentsWithImages = await Promise.all(productionData.segments.map(async (seg, index) => {
        console.log(`Generating image for segment ${index + 1}/${productionData.segments.length}...`);
        try {
          const response = await axios.post('https://fal.run/fal-ai/flux/schnell', {
            prompt: `(Dolu character consistency: --seed ${seed}) ${seg.visual_prompt}, highly detailed, cinematic lighting, 9:16 aspect ratio`,
            image_size: "portrait_4_3",
            seed: seed,
            num_inference_steps: 4
          }, {
            headers: { 'Authorization': `Key ${keys.fal}` }
          });
          
          return {
            ...seg,
            img_url: response.data.images[0].url
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

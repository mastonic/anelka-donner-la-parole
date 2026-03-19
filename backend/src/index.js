const productionEngine = require('./services/productionEngine');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Firebase (Assuming local emulator or service account already set up)
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID
  });
}

const db = admin.firestore();

// --- API Routes ---

// Submit Story
app.post('/api/stories', async (req, res) => {
  try {
    const story = {
      ...req.body,
      status: 'wait',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };
    const docRef = await db.collection('stories').add(story);
    res.json({ id: docRef.id });
  } catch (err) {
    console.error("API Error (stories):", err);
    res.status(500).json({ error: err.message });
  }
});

// Update Story
app.post('/api/stories/:id/update', async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection('stories').doc(id).update({
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.json({ success: true });
  } catch (err) {
    console.error("API Error (update story):", err);
    res.status(500).json({ error: err.message });
  }
});

// Get Stories
app.get('/api/stories', async (req, res) => {
  try {
    let query = db.collection('stories');
    const { pseudo, status } = req.query;
    if (pseudo) query = query.where('pseudo', '==', pseudo);
    if (status) query = query.where('status', '==', status);
    
    const snapshot = await query.get();
    const stories = [];
    snapshot.forEach(doc => {
      stories.push({ id: doc.id, ...doc.data() });
    });

    // In-memory sorting by createdAt (desc)
    stories.sort((a, b) => {
      const timeA = a.createdAt?.toDate?.()?.getTime() || a.createdAt?._seconds * 1000 || 0;
      const timeB = b.createdAt?.toDate?.()?.getTime() || b.createdAt?._seconds * 1000 || 0;
      return timeB - timeA;
    });

    res.json(stories);
  } catch (err) {
    console.error("API Error (get stories):", err);
    res.status(500).json({ error: err.message });
  }
});

// Get Admin Stats
app.get('/api/admin/stats', async (req, res) => {
  try {
    const snapshot = await db.collection('stories').get();
    let total = 0;
    let pending = 0;
    let published = 0;
    snapshot.forEach(doc => {
      total++;
      const data = doc.data();
      if (data.status === 'wait') pending++;
      if (data.status === 'published') published++;
    });
    
    res.json({
      totalStories: total,
      pendingValidations: pending,
      totalRevenue: (published * 105.25).toFixed(2),
      followerRevenuePercentage: 40,
      doluRevenuePercentage: 30,
      apiRevenuePercentage: 30,
      activeAgents: 4
    });
  } catch (err) {
    console.error("API Error (admin stats):", err);
    res.status(500).json({ error: err.message });
  }
});

// Get User Profile
app.get('/api/user/profile/:pseudo', async (req, res) => {
  try {
    const { pseudo } = req.params;
    const snapshot = await db.collection('stories').where('pseudo', '==', pseudo).get();
    const stories = [];
    snapshot.forEach(doc => stories.push({ id: doc.id, ...doc.data() }));
    
    const publishedStories = stories.filter(s => s.status === 'published');
    const balance = publishedStories.length * 42.10;
    
    res.json({
      pseudo,
      storiesCount: stories.length,
      balance: balance.toFixed(2),
      stories: stories
    });
  } catch (err) {
    console.error("API Error (profile):", err);
    res.status(500).json({ error: err.message });
  }
});

// Start Production (Admin only)
app.post('/api/production/start', async (req, res) => {
  try {
    const { storyId } = req.body;
    const result = await productionEngine.startProduction(storyId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Improve Story
app.post('/api/ai/improve', async (req, res) => {
  try {
    const { text } = req.body;
    const keys = await configService.getApiKeys();
    if (!keys.google) throw new Error("Google API Key missing");
    
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(keys.google);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Tu es une IA d'aide à l'écriture. Améliore l'histoire suivante pour un format TikTok viral narré par Dolunaelka. Conserve l'authenticité et le vécu, mais structure le récit pour maximiser l'impact émotionnel et le suspense. Ajoute un 'Hook' percutant au début. Réponds avec le texte amélioré uniquement.

HISTOIRE A AMÉLIORER :
${text}`;
    
    const result = await model.generateContent(prompt);
    res.json({ improvedText: result.response.text() });
  } catch (err) {
    console.error("API Error (ai help):", err);
    res.status(500).json({ error: err.message });
  }
});

// Update Config (Admin only)
app.get('/api/config', async (req, res) => {
  try {
    const keys = await configService.getApiKeys();
    res.json(keys);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/config', async (req, res) => {
  try {
    await db.doc('config/api_keys').set(req.body, { merge: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

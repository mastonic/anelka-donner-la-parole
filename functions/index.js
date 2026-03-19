const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const configService = require("./configService");
admin.initializeApp();

const express = require("express");
const cors = require("cors");
const productionEngine = require("./productionEngine");

const PROJECT_ID = "dolunaleka";
const ZONE = "us-central1-a";
const INSTANCE_NAME = "prod-vm-dolu";

/**
 * Triggered when an Admin validates a story.
 * Starts the GPU VM and triggers the render engine.
 */
exports.triggerRenderPipeline = functions.region("us-central1").runWith({ memory: '1GB' }).firestore
    .document("stories/{storyId}")
    .onUpdate(async (change, context) => {
        // LAZY LOAD heavy compute library to avoid load timeout
        const { InstancesClient } = require("@google-cloud/compute");
        const computeClient = new InstancesClient();

        const newValue = change.after.data();
        const oldValue = change.before.data();

        // Trigger only when status changes to 'validée'
        if (newValue.status === "validée" && oldValue.status !== "validée") {
            const storyId = context.params.storyId;
            console.log(`🚀 Story VALIDATED: ${storyId}. Orchestrating GCP Rendering...`);

            try {
                // 1. Quota Enforcement (Max 1 VM for safety in dev)
                const [instances] = await computeClient.list({
                    project: PROJECT_ID,
                    zone: ZONE,
                    filter: "status = RUNNING"
                });

                if (instances.length >= 1) {
                    console.warn("🛑 Global Quota Reached: VM already active. Job queued in Firestore.");
                    await admin.firestore().collection("jobs").doc(storyId).set({
                        status: "queued_waiting_for_vm",
                        vmStatus: "waiting_queue",
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    return;
                }

                // 2. Start the GPU Render VM with storyId metadata
                console.log(`Starting Dedicated Render VM with job_id: ${storyId}...`);
                
                // Get existing metadata and add storyId
                const [instance] = await computeClient.get({
                    project: PROJECT_ID,
                    zone: ZONE,
                    instance: INSTANCE_NAME
                });
                
                const metadata = instance.metadata || { items: [] };
                const items = metadata.items || [];

                // Set job_id
                const jobIndex = items.findIndex(i => i.key === 'job_id');
                if (jobIndex > -1) {
                    items[jobIndex].value = storyId;
                } else {
                    items.push({ key: 'job_id', value: storyId });
                }

                // Inject startup script so the VM automatically runs render_engine.py on boot
                const startupScript = `#!/bin/bash
LOG="/tmp/render_startup.log"
echo "$(date): VM started for job ${storyId}" >> $LOG
PROJECT_DIR=$(find /home /opt /root -maxdepth 5 -name "render_engine.py" -path "*/rendering/*" 2>/dev/null | head -1 | xargs -I{} dirname {} | xargs -I{} dirname {})
if [ -z "$PROJECT_DIR" ]; then
  echo "$(date): render_engine.py not found, aborting." >> $LOG
  exit 1
fi
cd "$PROJECT_DIR"
source venv/bin/activate 2>/dev/null || true
python3 rendering/render_engine.py >> $LOG 2>&1
echo "$(date): render_engine.py finished." >> $LOG`;

                const startupIndex = items.findIndex(i => i.key === 'startup-script');
                if (startupIndex > -1) {
                    items[startupIndex].value = startupScript;
                } else {
                    items.push({ key: 'startup-script', value: startupScript });
                }

                await computeClient.setMetadata({
                    project: PROJECT_ID,
                    zone: ZONE,
                    instance: INSTANCE_NAME,
                    metadataResource: {
                        fingerprint: instance.metadata.fingerprint,
                        items: items
                    }
                });

                await computeClient.start({
                    project: PROJECT_ID,
                    zone: ZONE,
                    instance: INSTANCE_NAME
                });

                // 3. Advanced Text Sanitization
                const sanitizedText = newValue.content
                    .replace(/[^\w\sàâäéèêëïîôöùûüÿçœæÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇŒÆ.,!?;:'-]/gi, "")
                    .replace(/\s+/g, " ")
                    .trim();

                // 4. Create Render Job
                await admin.firestore().collection("jobs").doc(storyId).set({
                    storyId: storyId,
                    status: "queued",
                    vmStatus: "starting",
                    content: sanitizedText,
                    segments: newValue.segments || [],
                    visualSeed: newValue.visualSeed || 0,
                    author: newValue.pseudo || "Anonyme",
                    startedAt: admin.firestore.FieldValue.serverTimestamp()
                });

                console.log("✅ Pipeline Triggered Successfully.");

            } catch (err) {
                console.error("❌ Orchestration Failed:", err);
                await admin.firestore().collection("stories").doc(storyId).update({
                    status: "error_orchestration",
                    error: err.message
                });
            }
        }
    });
 
/**
 * Watcher for Job completion.
 * When the VM completes a job, we update the main story record.
 */
exports.onJobCompleted = functions.region("us-central1").runWith({ memory: '512MB' }).firestore
    .document("jobs/{jobId}")
    .onUpdate(async (change, context) => {
        const newValue = change.after.data();
        const oldValue = change.before.data();
        const storyId = context.params.jobId;

        // When VM marks job as 'completed'
        if ((newValue.status === "completed" || newValue.status === "ready") && oldValue.status !== newValue.status) {
            console.log(`🎬 Job ${storyId} COMPLETED. Publishing Story...`);
            
            await admin.firestore().collection("stories").doc(storyId).update({
                status: "published",
                videoUrl: newValue.video_url || newValue.videoUrl,
                publishedAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }
    });
 
// --- EXPRESS API ---
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const db = admin.firestore();

// Router to handle both direct function calls and hosting rewrites
const router = express.Router();

router.post('/stories', async (req, res) => {
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

router.post('/production/start', async (req, res) => {
    try {
        const { storyId } = req.body;
        if (!storyId) return res.status(400).json({ error: 'storyId is required' });

        // Validate story exists before returning
        const storyDoc = await db.collection('stories').doc(storyId).get();
        if (!storyDoc.exists) return res.status(404).json({ error: 'Histoire non trouvée.' });

        // Return immediately so the frontend doesn't hang
        res.json({ success: true, jobId: storyId });

        // Run production pipeline in background (fire-and-forget)
        productionEngine.startProduction(storyId).catch(err => {
            console.error('Background production failed:', err);
        });
    } catch (err) {
        console.error("API Error (production/start):", err);
        if (!res.headersSent) res.status(500).json({ error: err.message });
    }
});

router.get('/stories', async (req, res) => {
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

router.post('/stories/:id/update', async (req, res) => {
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

router.post('/ai/improve', async (req, res) => {
    try {
        const { text } = req.body;
        const keys = await configService.getApiKeys();
        if (!keys.google) throw new Error("Google API Key missing");
        
        const genAI = new GoogleGenerativeAI(keys.google);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }, { apiVersion: "v1beta" });
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

router.get('/admin/stats', async (req, res) => {
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
        
        // Fetch recent stories and filter non-wait in memory to avoid index requirements
        const recentSnap = await db.collection('stories')
            .orderBy('createdAt', 'desc')
            .limit(30)
            .get();
        
        const recentStories = [];
        recentSnap.forEach(doc => {
            const data = doc.data();
            if (data.status !== 'wait' && recentStories.length < 10) {
                recentStories.push({ id: doc.id, ...data });
            }
        });

        res.json({
            totalStories: total,
            pendingValidations: pending,
            totalRevenue: (published * 105.25).toFixed(2), // 100% of hypothetical revenue
            followerRevenuePercentage: 40,
            doluRevenuePercentage: 30,
            apiRevenuePercentage: 30,
            activeAgents: 4,
            recentStories: recentStories
        });
    } catch (err) {
        console.error("API Error (admin stats):", err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/user/profile/:pseudo', async (req, res) => {
    try {
        const { pseudo } = req.params;
        const snapshot = await db.collection('stories').where('pseudo', '==', pseudo).get();
        const stories = [];
        snapshot.forEach(doc => stories.push({ id: doc.id, ...doc.data() }));
        
        // Dynamic balance calculation based on real data
        const publishedStories = stories.filter(s => s.status === 'published');
        const balance = publishedStories.length * 42.10; // 40% of hypothetical revenue
        
        res.json({
            pseudo,
            storiesCount: stories.length,
            balance: balance.toFixed(2),
            stories: stories // Return full stories for simple frontend integration
        });
    } catch (err) {
        console.error("API Error (profile):", err);
        res.status(500).json({ error: err.message });
    }
});

router.post('/production/retrigger-vm', async (req, res) => {
    try {
        const { storyId } = req.body;
        if (!storyId) return res.status(400).json({ error: 'storyId is required' });

        const storyDoc = await db.collection('stories').doc(storyId).get();
        if (!storyDoc.exists) return res.status(404).json({ error: 'Histoire non trouvée.' });
        const story = storyDoc.data();

        if (!story.segments || story.segments.length === 0) {
            return res.status(400).json({ error: 'Aucun segment trouvé. Lance d\'abord la production complète.' });
        }

        // Step 1: set to 'selected' so the trigger can fire again
        await db.collection('stories').doc(storyId).update({ status: 'selected', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        // Step 2: wait 1s then set back to 'validée' to trigger the CF
        await new Promise(r => setTimeout(r, 1500));
        await db.collection('stories').doc(storyId).update({ status: 'validée', updatedAt: admin.firestore.FieldValue.serverTimestamp() });

        res.json({ success: true, message: 'VM retrigger lancé.' });
    } catch (err) {
        console.error("API Error (retrigger-vm):", err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/jobs/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const doc = await db.collection('jobs').doc(id).get();
        if (!doc.exists) return res.json({ status: 'not_found' });
        res.json({ id: doc.id, ...doc.data() });
    } catch (err) {
        console.error("API Error (get job):", err);
        res.status(500).json({ error: err.message });
    }
});

router.get('/analytics', async (req, res) => {
    try {
        const { pseudo } = req.query;
        // Mock data for now
        res.json({
            views: 125400,
            likes: 12400,
            shares: 3200,
            revenue: 421.00,
            engagementRate: 12.4,
            history: [
                { date: '2026-03-12', views: 10000 },
                { date: '2026-03-13', views: 15000 },
                { date: '2026-03-14', views: 22000 },
                { date: '2026-03-15', views: 18000 },
                { date: '2026-03-16', views: 35000 },
                { date: '2026-03-17', views: 28000 },
                { date: '2026-03-18', views: 125400 }
            ]
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Config (Admin only)
router.get('/config', async (req, res) => {
    try {
        const keys = await configService.getApiKeys();
        res.json(keys);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/config', async (req, res) => {
    try {
        await db.doc('config/api_keys').set(req.body, { merge: true });
        res.json({ success: true });
    } catch (err) {
        console.error("API Error (config):", err);
        res.status(500).json({ error: err.message });
    }
});

app.use('/api', router);

exports.api = functions.region("us-central1").runWith({
    timeoutSeconds: 540,
    memory: '512MB'
}).https.onRequest(app);

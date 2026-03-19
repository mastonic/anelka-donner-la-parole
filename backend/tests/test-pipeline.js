const ScoutAgent = require('../src/agents/scout');
const configService = require('../src/services/configService');
require('dotenv').config();

// 0. Credential Check
if (!process.env.FIREBASE_PROJECT_ID) {
    console.error("❌ ERREUR : FIREBASE_PROJECT_ID n'est pas configuré dans backend/.env");
    console.log("Veuillez remplir vos clés API dans le fichier avant de lancer le test.");
    process.exit(1);
}

// Initialize Firebase FIRST
if (!admin.apps.length) {
    admin.initializeApp();
}

/**
 * Mock function to check active VMs (Phase 13 Logic)
 */
async function checkActiveVMs() {
    const db = admin.firestore();
    const activeJobs = await db.collection('jobs')
        .where('status', 'in', ['processing', 'queued'])
        .get();
    return activeJobs.size;
}

/**
 * Main Test Pipeline Simulation
 */
async function runViralTest() {
    console.log("🚀 DÉMARRAGE DU TEST ANTIGRAVITY...");

    try {
        // 1. Simulation Soumission & Légal
        console.log("--- Etape 1: Simulation Soumission ---");
        const story = { 
            title: "Test Viralité Antigravity", 
            content: "C'est l'histoire d'un codeur qui voulait automatiser le monde...", 
            consent: true,
            pseudo: "@test_user"
        };
        
        if (!story.consent) throw new Error("❌ Blocage Légal : Consentement absent.");
        console.log("✅ Check Légal : OK (Cession de droits validée)");

        // 2. Simulation Scoring Gemini (Scout Agent)
        console.log("--- Etape 2: Scoring Gemini (Scout) ---");
        const googleKey = await configService.getApiKey('google');
        const scout = new ScoutAgent(googleKey);
        
        const scanResult = await scout.analyzeTrends(story.content);
        // Simple heuristic for "Virality Score" based on scan length or keywords
        const score = Math.min(Math.floor(scanResult.insights.length * 20), 100);
        console.log(`📊 Score de Virilité Calculé : ${score}%`);
        console.log(`💡 Insights IA : ${scanResult.insights[0]}`);

        // 3. Test Quota VM (Phase 13)
        console.log("--- Etape 3: Vérification Quota GPU ---");
        const activeVMs = await checkActiveVMs();
        console.log(`🔍 Instances actives détectées : ${activeVMs}`);
        
        if (activeVMs >= 2) {
            console.log("⚠️ QUOTA ATTEINT : Protection active (Max 2 simultaneous VMs).");
            console.log("🕒 Le job sera mis en attente.");
        } else {
            console.log("✅ QUOTA DISPONIBLE : Lancement de la production autorisé.");
        }

        console.log("\n✨ TEST DE PIPELINE TERMINÉ AVEC SUCCÈS.");
        console.log("Note : Pour tester le rendu réel, lancez 'python rendering/render_engine.py <job_id>'");

    } catch (error) {
        console.error("❌ ÉCHEC DU TEST :", error.message);
    }
}

runViralTest();

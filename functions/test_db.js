const admin = require('firebase-admin');
admin.initializeApp({
    projectId: 'dolunaleka'
});
const db = admin.firestore();

async function check() {
    const id = "bUExpAUJxSYqp3w77foa";
    const story = await db.collection('stories').doc(id).get();
    console.log(`Story Status: ${story.data()?.status}`);
    const job = await db.collection('jobs').doc(id).get();
    if (job.exists) {
        console.log(`Job exists! Status: ${job.data().status}, VM: ${job.data().vmStatus}`);
    } else {
        console.log(`Job DOES NOT EXIST`);
    }
}
check();

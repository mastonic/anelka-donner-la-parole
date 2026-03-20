import os
import time
import base64
import requests
import subprocess
import firebase_admin
import msgpack
from firebase_admin import credentials, storage, firestore

# --- Configuration ---
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(SCRIPT_DIR, "assets")
TEMP_DIR = os.path.join(SCRIPT_DIR, "temp_assets")
os.makedirs(TEMP_DIR, exist_ok=True)

# On GCP VM, use Application Default Credentials (service account attached to VM).
# Fallback to local serviceAccountKey.json for local testing.
_sa_path = os.path.join(SCRIPT_DIR, "..", "serviceAccountKey.json")
if os.path.exists(_sa_path):
    cred = credentials.Certificate(_sa_path)
    firebase_admin.initialize_app(cred, {'storageBucket': 'dolunaleka.firebasestorage.app'})
else:
    firebase_admin.initialize_app(options={'storageBucket': 'dolunaleka.firebasestorage.app'})

db = firestore.client()
bucket = storage.bucket()

def sync_voice_ref():
    """
    Télécharge le fichier de référence vocale depuis Firebase Storage.
    Si 'assets/dolu_ref.mp3' existe dans Storage, il remplace le fichier local.
    Cela permet de mettre à jour la voix de référence sans redéployer la VM.
    """
    local_path = os.path.join(ASSETS_DIR, "dolu_ref_short.mp3")
    blob = bucket.blob("assets/dolu_ref.mp3")
    try:
        if blob.exists():
            print("🔄 Downloading latest voice reference from Firebase Storage...")
            blob.download_to_filename(local_path)
            size_kb = os.path.getsize(local_path) // 1024
            print(f"✅ Voice reference updated: {size_kb} KB")
        else:
            print("ℹ️ No voice reference in Storage, using local file.")
    except Exception as e:
        print(f"⚠️ Could not sync voice ref: {e}. Using existing local file.")


DOLU_FISH_MODEL_ID = None  # reference_id API non supporté sur ce modèle, on utilise l'audio inline

def get_api_keys():
    """Récupère toutes les clés API depuis Firestore."""
    try:
        doc = db.collection('config').document('api_keys').get()
        if doc.exists:
            keys = doc.to_dict()
            keys.setdefault('fish_model_id', DOLU_FISH_MODEL_ID)
            return keys
    except Exception as e:
        print(f"⚠️ Could not fetch API keys from Firestore: {e}")
    return {
        'google': os.environ.get('GEMINI_API_KEY'),
        'fish': os.environ.get('FISH_SPEECH_KEY'),
        'fish_model_id': DOLU_FISH_MODEL_ID
    }

def clean_text(text):
    """Nettoie le texte pour la synthèse vocale."""
    chars_to_remove = ["*", "#", "_", "~", "[", "]", "(", ")"]
    for char in chars_to_remove:
        text = text.replace(char, "")
    return text.strip()

def generate_voiceover_fish_speech(text, segment_id, fish_key, model_id=None):
    """
    Génère la voix clonée via Fish Speech API (msgpack, qualité maximale).
    - Si model_id disponible : utilise le modèle persistant (meilleure qualité).
    - Sinon : utilise la référence audio inline (fallback).
    """
    print(f"🎙️ Fish Speech: Generating cloned voice for segment {segment_id}...")
    output_path = os.path.join(TEMP_DIR, f"audio_{segment_id}.mp3")

    if model_id:
        # Meilleure qualité : modèle persistant pré-entraîné
        print(f"   → Using persistent model: {model_id}")
        payload = {
            "text": text,
            "reference_id": model_id,
            "format": "mp3",
            "mp3_bitrate": 192,
            "normalize": True,
            "latency": "normal"
        }
    else:
        # Fallback : référence audio inline (base64)
        print(f"   → No model_id, using inline audio reference.")
        ref_audio_path = os.path.join(ASSETS_DIR, "dolu_ref_short.mp3")
        with open(ref_audio_path, "rb") as f:
            ref_audio_bytes = f.read()
        payload = {
            "text": text,
            "references": [
                {
                    "audio": ref_audio_bytes,
                    "text": "C'est Dolunaelka, je raconte mon histoire depuis les Antilles."
                }
            ],
            "format": "mp3",
            "mp3_bitrate": 192,
            "normalize": True,
            "latency": "normal"
        }

    # Fish Speech accepte JSON et msgpack. On utilise JSON pour la compatibilité maximale.
    # Pour le mode inline (references avec bytes audio), encoder en base64 string.
    if not model_id and "references" in payload:
        for ref in payload["references"]:
            if isinstance(ref.get("audio"), bytes):
                ref["audio"] = base64.b64encode(ref["audio"]).decode("utf-8")

    response = requests.post(
        "https://api.fish.audio/v1/tts",
        json=payload,
        headers={
            "Authorization": f"Bearer {fish_key}",
        },
        stream=True,
        timeout=120
    )

    if response.status_code == 200:
        with open(output_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=4096):
                if chunk:
                    f.write(chunk)
        print(f"✅ Fish Speech cloned voice OK (segment {segment_id})")
        return output_path
    else:
        raise Exception(f"Fish Speech API error {response.status_code}: {response.text[:200]}")

def generate_voiceover(text, segment_id, keys, job_id):
    """
    Génère la voix pour un segment.
    Priorité : Fish Speech (clone) → GPT-SoVITS (local) → Erreur
    """
    cleaned = clean_text(text)

    # 1. Fish Speech direct API (voice clone, cloud, aucun GPU requis)
    if keys.get('fish'):
        try:
            model_id = keys.get('fish_model_id')  # Persistent model for best quality
            return generate_voiceover_fish_speech(cleaned, segment_id, keys['fish'], model_id=model_id)
        except Exception as e:
            print(f"⚠️ Fish Speech failed: {e}. Trying GPT-SoVITS...")
            db.collection('jobs').document(job_id).update({
                'logs': firestore.ArrayUnion([f"Segment {segment_id}: Fish Speech échoué ({e}), tentative SoVITS..."])
            })

    # 2. GPT-SoVITS (local, nécessite GPU)
    try:
        params = {
            "text": cleaned,
            "text_language": "fr",
            "refer_wav_path": os.path.join(ASSETS_DIR, "dolu_ref_short.mp3"),
            "prompt_text": "C'est Dolunaelka, je raconte mon histoire.",
            "prompt_language": "fr"
        }
        response = requests.get("http://localhost:9880", params=params, timeout=10)
        if response.status_code == 200:
            wav_path = os.path.join(TEMP_DIR, f"audio_{segment_id}.wav")
            with open(wav_path, "wb") as f:
                f.write(response.content)
            print(f"✅ GPT-SoVITS OK (segment {segment_id})")
            return wav_path
    except Exception as e:
        print(f"⚠️ GPT-SoVITS failed: {e}")

    raise Exception("Aucun moteur TTS disponible. Vérifie la clé Fish Speech dans les Paramètres.")

def create_segment_video(img_url, audio_path, segment_id, subtitle_text):
    """Génère une vidéo de segment avec Ken Burns effect + sous-titres via FFmpeg."""
    print(f"🎬 Rendering segment {segment_id}...")
    img_path = os.path.join(TEMP_DIR, f"img_{segment_id}.jpg")
    output_path = os.path.join(TEMP_DIR, f"segment_{segment_id}.mp4")
    font_path = os.path.join(ASSETS_DIR, "DejaVuSans-Bold.ttf")

    # Download image
    img_data = requests.get(img_url, timeout=30).content
    with open(img_path, "wb") as f:
        f.write(img_data)

    # Escape subtitle text for FFmpeg drawtext
    def esc(t):
        return t.upper().replace("\\","\\\\").replace("'","\u2019").replace(":","\\:").replace(",","\\,").replace("!","\\!").replace(";","\\;").replace("%","\\%")

    # Wrap at 22 chars per line max (fontsize 52 bold uppercase ≈ 42px/char → 22*42=924px < 1080px)
    words = subtitle_text.upper().split()
    lines, cur = [], []
    for w in words:
        test = " ".join(cur + [w])
        if len(test) <= 22:
            cur.append(w)
        else:
            if cur:
                lines.append(" ".join(cur))
            cur = [w]
    if cur:
        lines.append(" ".join(cur))
    # Keep max 3 lines, show first 3 only
    lines = lines[:3]
    while len(lines) < 3:
        lines.append("")

    l1, l2, l3 = esc(lines[0]), esc(lines[1]), esc(lines[2])
    fs = 52  # fontsize
    lh = 68  # line height in pixels
    # Position: bottom area with safe margin from edge
    y3 = "h-120"
    y2 = f"h-{120+lh}"
    y1 = f"h-{120+lh*2}"

    sub_filters = (
        f"drawtext=text='{l1}':fontcolor=white:fontsize={fs}:fontfile='{font_path}'"
        f":x=(w-text_w)/2:y={y1}:shadowcolor=black:shadowx=3:shadowy=3:borderw=4:bordercolor=black:fix_bounds=1"
    )
    if l2:
        sub_filters += (
            f",drawtext=text='{l2}':fontcolor=white:fontsize={fs}:fontfile='{font_path}'"
            f":x=(w-text_w)/2:y={y2}:shadowcolor=black:shadowx=3:shadowy=3:borderw=4:bordercolor=black:fix_bounds=1"
        )
    if l3:
        sub_filters += (
            f",drawtext=text='{l3}':fontcolor=white:fontsize={fs}:fontfile='{font_path}'"
            f":x=(w-text_w)/2:y={y3}:shadowcolor=black:shadowx=3:shadowy=3:borderw=4:bordercolor=black:fix_bounds=1"
        )

    cmd = [
        "ffmpeg", "-loop", "1", "-i", img_path, "-i", audio_path,
        "-filter_complex",
        f"[0:v]scale=2160:-1,zoompan=z='min(zoom+0.0015,1.5)':d=750:fps=25:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920[v];"
        f"[v]{sub_filters}",
        "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-r", "25",
        "-c:a", "aac", "-ar", "44100", "-shortest", output_path, "-y"
    ]

    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"⚠️ FFmpeg segment error: {result.stderr[-500:]}")
    return output_path

def process_job(job_id, data):
    """Logique principale du rendu."""
    print(f"🚀 Processing Job: {job_id}")
    try:
        keys = get_api_keys()
        sync_voice_ref()  # Always pull the latest voice reference from Firebase Storage
        db.collection('jobs').document(job_id).update({
            'status': 'processing',
            'vmStatus': 'running',
            'logs': firestore.ArrayUnion(["🎬 Rendu démarré..."])
        })

        segments = data.get('segments', [])
        if not segments:
            raise Exception("Aucun segment trouvé dans le job.")

        video_clips = []

        # 1. Générer voix + vidéo pour chaque segment
        for i, seg in enumerate(segments):
            print(f"--- Segment {i+1}/{len(segments)} ---")
            db.collection('jobs').document(job_id).update({
                'logs': firestore.ArrayUnion([f"Segment {i+1}/{len(segments)}: génération voix..."])
            })

            if not seg.get('img_url'):
                print(f"⚠️ Segment {i} has no image, skipping.")
                continue

            audio = generate_voiceover(seg['text'], i, keys, job_id)
            clip = create_segment_video(seg['img_url'], audio, i, seg['text'])
            # Vérifier que le clip existe et n'est pas vide avant de l'ajouter
            if os.path.exists(clip) and os.path.getsize(clip) > 0:
                video_clips.append(clip)
            else:
                print(f"⚠️ Clip {i} invalide ou vide, ignoré.")

        if not video_clips:
            raise Exception("Aucun clip vidéo généré.")

        # 2. Concaténation finale
        print("🔗 Concatenating clips...")
        concat_output = os.path.join(TEMP_DIR, f"{job_id}_concat.mp4")
        list_file = os.path.join(TEMP_DIR, "list.txt")
        with open(list_file, "w") as f:
            for clip in video_clips:
                f.write(f"file '{clip}'\n")

        # Re-encoder au lieu de stream-copier pour éviter les incompatibilités de timebase entre segments
        subprocess.run([
            "ffmpeg", "-f", "concat", "-safe", "0", "-i", list_file,
            "-c:v", "libx264", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-ar", "44100",
            concat_output, "-y"
        ], check=True)

        # 3. Ajout musique de fond
        print("🎵 Mixing background music...")
        final_output = os.path.join(TEMP_DIR, f"final_{job_id}.mp4")
        bg_music = os.path.join(ASSETS_DIR, "background_music.mp3")

        subprocess.run([
            "ffmpeg", "-i", concat_output, "-i", bg_music,
            "-filter_complex", "[1:a]volume=0.12[bg];[0:a][bg]amix=inputs=2:duration=first",
            "-c:v", "copy", "-c:a", "aac", final_output, "-y"
        ], check=True)

        # 4. Upload dans Firebase Storage
        print(f"📤 Uploading final video to Firebase Storage...")
        blob_path = f"final_videos/final_{job_id}.mp4"
        blob = bucket.blob(blob_path)
        blob.upload_from_filename(final_output)
        blob.make_public()
        video_url = blob.public_url
        print(f"✅ Video ready: {video_url}")

        # 5. Mise à jour Firestore
        db.collection('jobs').document(job_id).update({
            'status': 'completed',
            'video_url': video_url,
            'finishedAt': firestore.SERVER_TIMESTAMP,
            'logs': firestore.ArrayUnion(["✅ Rendu terminé avec succès!"])
        })
        db.collection('stories').document(job_id).update({
            'status': 'published',
            'videoUrl': video_url,
            'publishedAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        print("🎉 Workflow Complete!")

    except Exception as e:
        print(f"❌ Critical Error: {e}")
        db.collection('jobs').document(job_id).update({
            'status': 'error',
            'error': str(e),
            'logs': firestore.ArrayUnion([f"❌ Erreur critique: {str(e)}"])
        })
        db.collection('stories').document(job_id).update({
            'status': 'error_production',
            'feedback': f"Rendu échoué: {str(e)}"
        })

    finally:
        print("💤 Shutting down VM in 15 seconds...")
        time.sleep(15)
        os.system("sudo shutdown -h now")

if __name__ == "__main__":
    import sys
    job_id = None

    if len(sys.argv) > 1:
        job_id = sys.argv[1]
    else:
        try:
            print("Checking VM Metadata for job_id...")
            met_url = "http://metadata.google.internal/computeMetadata/v1/instance/attributes/job_id"
            res = requests.get(met_url, headers={"Metadata-Flavor": "Google"}, timeout=5)
            if res.status_code == 200:
                job_id = res.text.strip()
                print(f"Found Job ID in Metadata: {job_id}")
        except Exception as e:
            print(f"Could not reach Metadata: {e}")

    if job_id:
        doc = db.collection('jobs').document(job_id).get()
        if doc.exists:
            process_job(job_id, doc.to_dict())
        else:
            print(f"Job {job_id} not found in Firestore.")
    else:
        print("Usage: python render_engine.py <job_id> OR set 'job_id' VM metadata.")

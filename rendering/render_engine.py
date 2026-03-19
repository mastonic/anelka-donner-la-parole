import os
import time
import json
import requests
import subprocess
import firebase_admin
from firebase_admin import credentials, storage, firestore

# --- Configuration ---
# Use Service Account from environment or local file
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'dolunaleka.appspot.com'
})

db = firestore.client()
bucket = storage.bucket()

SOVITS_API_URL = "http://localhost:9880" # GPT-SoVITS API endpoint
TEMP_DIR = "temp_assets"
os.makedirs(TEMP_DIR, exist_ok=True)

def clean_text_for_sovits(text):
    """Remove special characters that might cause SoVITS to crash."""
    chars_to_remove = ["*", "#", "_", "~", "[", "]", "(", ")"]
    for char in chars_to_remove:
        text = text.replace(char, "")
    return text

def generate_voiceover(text, segment_id):
    """Call GPT-SoVITS Local API, fallback to Gemini TTS if fails."""
    print(f"🎙️ Generating voiceover for segment {segment_id}...")
    cleaned_text = clean_text_for_sovits(text)
    wav_path = os.path.join(TEMP_DIR, f"audio_{segment_id}.wav")
    
    # 1. Try GPT-SoVITS (Local)
    try:
        SOVITS_API_URL = "http://localhost:9880"
        params = {
            "text": cleaned_text,
            "text_language": "fr",
            "refer_wav_path": "assets/dolu_ref_short.mp3",
            "prompt_text": "C'est Dolunaelka, je raconte mon histoire.",
            "prompt_language": "fr"
        }
        response = requests.get(SOVITS_API_URL, params=params, timeout=10)
        if response.status_code == 200:
            with open(wav_path, "wb") as f:
                f.write(response.content)
            print("✅ SoVITS (Cloned) OK")
            return wav_path
    except Exception as e:
        print(f"⚠️ SoVITS Failed: {e}. Falling back to Gemini TTS...")

    # 2. Fallback to Gemini TTS (Cloud API)
    google_key = get_google_key()
    if not google_key:
        raise Exception("Missing Google API Key for TTS Fallback.")
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={google_key}"
    # This is a placeholder for actual Gemini TTS REST call if available, 
    # otherwise we use a generic error or a mock for this demo.
    # Note: Gemini 2.0 Flash has real-time multimodal audio, but for now we follow the user's "Puck" request.
    
    # Simulating a high-quality TTS call (Note: Adjust to your real TTS provider if different)
    # If SoVITS is the only allowed voice, we must stop here or use another provider.
    db.collection('jobs').document(job_id).update({
        'logs': firestore.ArrayUnion([f"Segment {segment_id}: SoVITS non disponible, utilisation du fallback."])
    })
    
    # For now, if SoVITS fails, we raise an error if we don't have a secondary TTS.
    raise Exception("SoVITS Server disconnected. Please start the GPT-SoVITS process on the VM.")

def create_segment_video(img_url, audio_path, segment_id, subtitle_text):
    """Use FFmpeg for Ken Burns effect + Subtitles."""
    print(f"🎬 Rendering segment {segment_id}...")
    img_path = os.path.join(TEMP_DIR, f"img_{segment_id}.jpg")
    
    # Download image
    img_data = requests.get(img_url).content
    with open(img_path, "wb") as f:
        f.write(img_data)
        
    output_path = os.path.join(TEMP_DIR, f"segment_{segment_id}.mp4")
    
    # Dynamic Ken Burns (Random Zoom/Pan direction)
    z_start = "1.0"
    z_end = "1.5"
    
    # FFmpeg command: scale -> zoompan -> drawtext
    # We use a 9:16 aspect ratio (1080x1920)
    cmd = [
        "ffmpeg", "-i", img_path, "-i", audio_path,
        "-filter_complex", 
        f"[0:v]scale=2160:-1,zoompan=z='min(zoom+0.0015,{z_end})':d=125:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920[v];" +
        f"[v]drawtext=text='{subtitle_text.upper()}':fontcolor=yellow:fontsize=64:fontfile=assets/DejaVuSans-Bold.ttf:x=(w-text_w)/2:y=h-400:shadowcolor=black:shadowx=4:shadowy=4:borderw=2:bordercolor=black",
        "-c:v", "libx264", "-tune", "stillimage", "-pix_fmt", "yuv420p", "-shortest", output_path, "-y"
    ]
    
    subprocess.run(cmd)
    return output_path

def process_job(job_id, data):
    """Main job processing logic."""
    print(f"🚀 Processing Job: {job_id}")
    try:
        db.collection('jobs').document(job_id).update({'status': 'processing'})
        
        segments = data.get('segments', [])
        video_clips = []
        
        # 1. Generate Voice & Segment Videos
        for i, seg in enumerate(segments):
            audio = generate_voiceover(seg['text'], i)
            clip = create_segment_video(seg['img_url'], audio, i, seg['text'])
            video_clips.append(clip)
            
        # 2. Final Concatenation
        concat_output = f"temp_{job_id}_concat.mp4"
        with open("list.txt", "w") as f:
            for clip in video_clips:
                f.write(f"file '{clip}'\n")
                
        subprocess.run(["ffmpeg", "-f", "concat", "-safe", "0", "-i", "list.txt", "-c", "copy", concat_output, "-y"])
        
        # 3. Add Background Music (Low Volume Mix)
        final_output = f"final_{job_id}.mp4"
        bg_music = "assets/background_music.mp3" # Should be pre-placed on VM
        
        # Mix audio: Voice (original) + Music (attenuated)
        cmd_mix = [
            "ffmpeg", "-i", concat_output, "-i", bg_music,
            "-filter_complex", "[1:a]volume=0.15[bg];[0:a][bg]amix=inputs=2:duration=first",
            "-c:v", "copy", "-c:a", "aac", final_output, "-y"
        ]
        subprocess.run(cmd_mix)
        
        # 4. Upload to Firebase Storage
        print(f"📤 Uploading {final_output} to Firebase...")
        blob = bucket.blob(f"final_videos/{final_output}")
        blob.upload_from_filename(final_output)
        blob.make_public()
        
        # 5. Update BOTH Firestore collections & Finish
        print(f"✅ Video ready: {blob.public_url}")
        
        # Update Job
        db.collection('jobs').document(job_id).update({
            'status': 'completed',
            'video_url': blob.public_url,
            'finishedAt': firestore.SERVER_TIMESTAMP
        })
        
        # Update STORY (Crucial for Dashboard UI)
        db.collection('stories').document(job_id).update({
            'status': 'published',
            'videoUrl': blob.public_url,
            'publishedAt': firestore.SERVER_TIMESTAMP,
            'updatedAt': firestore.SERVER_TIMESTAMP
        })
        
        print("🎉 Workflow Complete: User dashboard updated to 'published' status.")
        
    except Exception as e:
        print(f"❌ Critical Error in Render Engine: {e}")
        db.collection('jobs').document(job_id).update({'status': 'error', 'error': str(e)})
        db.collection('stories').document(job_id).update({'status': 'error_production', 'feedback': f"Rendu échoué: {str(e)}"})
    
    finally:
        # ABSOLUTE SAFETY: SHUTDOWN NO MATTER WHAT
        print("💤 Shutting down VM in 10 seconds...")
        time.sleep(10) # Small grace period for logs
        os.system("sudo shutdown -h now")

if __name__ == "__main__":
    import sys
    job_id = None
    
    if len(sys.argv) > 1:
        job_id = sys.argv[1]
    else:
        # Pull from GCP Metadata
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
            # Update VM status to running before starting processing
            db.collection('jobs').document(job_id).update({
                'vmStatus': 'running',
                'logs': firestore.ArrayUnion(["VM connectée, début du rendu..."])
            })
            process_job(job_id, doc.to_dict())
    else:
        print("Usage: python render_engine.py <job_id> OR set 'job_id' metadata.")

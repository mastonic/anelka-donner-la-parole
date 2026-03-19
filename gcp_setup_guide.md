# Guide de Configuration Google Cloud Platform (GCP) - Viral Factory

Ce guide détaille les étapes nécessaires pour préparer l'infrastructure Cloud GPU pour le moteur de rendu de **Donner La Parole**.

## 1. Activation des API
Exécutez ces commandes via le Cloud Shell ou la console GCP :
```bash
gcloud services enable compute.googleapis.com
gcloud services enable iam.googleapis.com
gcloud services enable firebasestorage.googleapis.com
gcloud services enable firestore.googleapis.com
```

## 2. Gestion des Quotas GPU
- Accédez à **IAM & Admin > Quotas**.
- Filtrez par `NVIDIA_L4_GPUS`.
- Vérifiez que la limite est au moins de **1** dans votre région (ex: `us-central1`).
- Si elle est à 0, cliquez sur **Request Increase**.

## 3. Création du Template d'Instance (G2 Spot)
Le mode **Spot** réduit les coûts de ~70%.
- **Nom** : `template-render-dolu`
- **Machine Type** : `g2-standard-4` (NVIDIA L4 24GB VRAM)
- **Provisioning Model** : **Spot**
- **Disque de démarrage** : Image avec **Deep Learning VM** (PyTorch/TensorFlow) pour avoir les drivers CUDA pré-installés.

## 4. Configuration de la VM `prod-vm-dolu`
- Créez l'instance à partir du template.
- **Service Account** : Assurez-vous qu'elle a le rôle `Storage Admin` et `Cloud Datastore User`.

## 5. Déploiement du Code
1. Copiez `rendering/render_engine.py` sur la VM.
2. Installez les dépendances :
```bash
pip install firebase-admin google-cloud-storage requests
sudo apt-get install ffmpeg
```
3. Configurez le script au démarrage via un `systemd` service ou un script de démarrage.

---

> [!IMPORTANT]
> Ne jamais supprimer l'instruction `os.system('sudo shutdown -h now')` du script. C'est votre seule garantie contre les facturations inutiles quand l'instance est inactive.

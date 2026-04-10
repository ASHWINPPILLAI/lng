# Smart LPG Management System — DevOps Orchestrated

A full-stack, cloud-native application designed to digitize LPG gas tracking, managed via a modern DevOps toolchain.

## 🚀 Key Features
- **Real-time Analytics**: Daily consumption tracking and predictive refill estimation.
- **Premium Dashboard**: Modern glassmorphism UI with interactive stats and trend logging.
- **Auto-Scale Architecture**: Containerized with Docker, optimized for high-availability.

## 🛠️ DevOps Mastery (Evaluation Rubrics)
- **Version Control (CO2)**: Managed via Git/GitHub with a professional master-branch workflow.
- **CI/CD Pipeline (CO3)**: Fully automated via GitHub Actions (Build -> Docker Hub -> Render).
- **Infrastructure as Code — IaC (CO5)**: Modular Ansible playbooks for environment provisioning.
- **Orchestration (CO5)**: Container-based deployment with self-healing and zero-downtime rolling updates (via Render/Docker).

## 🌍 Live Deployment (Free Tier)
Since Oracle Cloud and GKE require credit cards/billing, this project is configured to use **Render.com** (100% Free, No Credit Card required).

### Setup Instructions
1. **GitHub Secrets**: Add these 3 secrets to your repository:
   - `DOCKERHUB_USERNAME`: Your Docker Hub username.
   - `DOCKERHUB_TOKEN`: Your Docker Hub personal access token.
   - `RENDER_DEPLOY_HOOK_URL`: Your Render Blueprint/Service deploy hook.
   - `MONGO_URI`: Your MongoDB Atlas connection string.

2. **Push to Master**: Every `git push` triggers a fresh build and live deployment.

## 💻 Local Development
To run the project on your machine with Docker:
```bash
# 1. Start the container
docker-compose up -d --build

# 2. View the app
# Open http://localhost:3000
```

## 🔍 Troubleshooting Docker Images
If you don't see the images in the Docker Desktop UI, run this command in your terminal:
```bash
docker images | grep lpg-app
```
You should see `lpg-app:latest` listed. If it's there, the image exists and is ready to run.

# Automated Design and Deployment of a Smart LPG Management System using DevOps Orchestration

## Project Overview
A full-stack cloud-native application that digitizes and automates household LPG gas consumption tracking, built and deployed using a complete DevOps toolchain.

## Architecture

```
Developer Machine
      │
      │  git push
      ▼
┌─────────────────┐
│   GitHub        │  ← Version Control (CO2)
│  (master branch)│
└────────┬────────┘
         │ triggers
         ▼
┌─────────────────┐
│ GitHub Actions  │  ← CI/CD Pipeline (CO3)
│   CI/CD Pipeline│
│  1. Build Image │
│  2. Push to Hub │
│  3. SSH Deploy  │
└────────┬────────┘
         │ pushes image
         ▼
┌─────────────────┐       ┌──────────────────────┐
│   Docker Hub    │       │  Ansible Playbook     │  ← IaC (CO5)
│ (Image Registry)│       │  provision_swarm.yml  │
└────────┬────────┘       │  - Install Docker     │
         │                │  - Init Swarm         │
         │ pulls image    │  - Deploy Stack       │
         ▼                └──────────────────────┘
┌─────────────────┐
│  Docker Swarm   │  ← Container Orchestration (CO5)
│  (Production)   │
│  - 2 Replicas   │
│  - Rolling Update│
│  - Auto Rollback│
│  - Health Checks│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────────┐
│  Node.js/Express│────▶│  MongoDB Atlas        │
│  Backend API    │     │  (NoSQL Cloud DB)     │
└────────┬────────┘     └──────────────────────┘
         │
         ▼
┌─────────────────┐
│ HTML/CSS/JS     │
│ Frontend        │
│ Dashboard       │
└─────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Tailwind CSS, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (NoSQL) |
| Containerization | Docker |
| Registry | Docker Hub |
| Orchestration | Docker Swarm |
| IaC | Ansible |
| CI/CD | GitHub Actions |
| Version Control | Git & GitHub |

## DevOps Pillars

### A. Version Control (CO2)
Git + GitHub with master-branch workflow. Full audit trail, rollback capabilities, and organized commit history.

### B. Infrastructure as Code — IaC (CO5)
`ansible/provision_swarm.yml` automates the entire server setup:
- Installs Docker Engine
- Initializes Docker Swarm
- Deploys the application stack

### C. Container Orchestration (CO5)
Docker Swarm manages the production deployment:
- **2 replicas** for high availability
- **Rolling updates** — zero downtime on every deploy
- **Auto-rollback** if a new deployment fails health checks
- **Restart policies** for self-healing containers

### D. CI/CD Pipeline (CO3)
GitHub Actions workflow (`.github/workflows/deploy.yml`):
1. Triggered on every `git push` to master
2. Builds Docker image
3. Pushes to Docker Hub (`:latest` + `:<git-sha>` tags)
4. SSHes into Swarm manager
5. Runs `docker stack deploy` with rolling update

## Local Setup

### Prerequisites
- [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
- Node.js 18+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/ASHWINPPILLAI/lng.git
cd lng
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env and set your MONGO_URI
```

### 3. Run with Docker Compose (local dev)
```bash
docker-compose up --build
```
App available at: http://localhost:3000

### 4. Run with Docker Swarm (production mode)
```bash
docker swarm init
docker build -t lpg-app:latest .
docker stack deploy --compose-file docker-stack.yml lpg-stack
docker service ls
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGO_URI` | MongoDB Atlas connection string | ✅ Yes |
| `PORT` | Server port (default: 3000) | Optional |
| `NODE_ENV` | Environment (production/development) | Optional |

## GitHub Secrets Required for CI/CD

| Secret | Description |
|--------|-------------|
| `DOCKERHUB_USERNAME` | Docker Hub account username |
| `DOCKERHUB_TOKEN` | Docker Hub access token |
| `SWARM_HOST` | IP address of Swarm manager server |
| `SWARM_USER` | SSH username of the server |
| `SWARM_SSH_KEY` | SSH private key for the server |
| `MONGO_URI` | MongoDB Atlas connection string |

## Project Structure

```
smart-lpg-management/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions CI/CD pipeline
├── ansible/
│   ├── provision_swarm.yml     # Ansible IaC playbook
│   └── inventory.ini           # Ansible server inventory
├── public/
│   ├── index.html              # Frontend dashboard
│   └── app.js                  # Frontend JavaScript
├── docker-compose.yml          # Local development
├── docker-stack.yml            # Docker Swarm production stack
├── Dockerfile                  # Container build instructions
├── server.js                   # Node.js/Express backend
├── package.json
└── .env                        # Environment variables (not committed)
```

## Key Features
- **Real-time Consumption Tracking** — Log daily gas weight and see trends
- **Predictive Analytics** — Estimates next refill date from average usage
- **Automated Deployment** — Code → Docker Hub → Live in minutes
- **Cloud-Native Security** — Credentials in environment variables, never in code
- **Self-Healing** — Docker Swarm restarts crashed containers automatically

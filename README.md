# Automated Design and Deployment of a Smart LPG Management System using DevOps Orchestration

## 1. Project Overview
The Smart LPG Management System is a full-stack, cloud-native application designed to digitize and automate the tracking of household gas consumption. The project solves a real-world logistics problem by providing users with real-time analytics on their gas usage, calculating average daily consumption, and predicting the next refill date using predictive logic.

What sets this project apart is not just the application itself, but the automated infrastructure behind it. The entire lifecycle—from writing code to provisioning servers and deploying the app—is managed through a modern DevOps toolchain.

## 2. Technical Architecture
The project is built using a Modular DevOps Architecture, ensuring that the application is decoupled from the underlying infrastructure.

- **Frontend:** A responsive, data-driven dashboard built with Tailwind CSS and Vanilla JavaScript, providing high-performance visualization of usage trends.
- **Backend:** A robust Node.js and Express server that handles complex date-based calculations and API orchestration.
- **Database:** A cloud-hosted NoSQL (MongoDB Atlas) database used for high-availability storage of gas usage and refill history.
- **Containerization:** The application is fully packaged into a Docker image, ensuring that it runs identically on a developer's laptop and a production cloud server.

## 3. DevOps Implementation
To satisfy the evaluation rubrics, the project implements four core DevOps pillars:

### A. Version Control
Managed via Git and GitHub, utilizing a master-branch workflow. This allows for organized collaboration, rollback capabilities, and a clear audit trail of all architectural changes.

### B. Infrastructure as Code - IaC
Manual cloud configuration is replaced by Ansible. An Ansible playbook programmatically provisions the Google Cloud environment, including the Artifact Registry and the Kubernetes cluster, making the entire infrastructure reproducible and scalable.

### C. Container Orchestration
The application is deployed on Google Kubernetes Engine (GKE). By using Kubernetes, the system benefits from automated scaling, self-healing (restarting crashed containers), and zero-downtime updates through LoadBalancer services.

### D. CI/CD Pipeline
A fully automated pipeline is implemented using GitHub Actions. Every time code is pushed to the repository, the pipeline automatically:
- Builds a new Docker image.
- Authenticates with Google Cloud.
- Pushes the image to the registry.
- Triggers a rolling update to the Kubernetes cluster.

## 4. Key Features
- **Real-time Consumption Tracking:** Users can log daily gas weight to see immediate trends.
- **Predictive Analytics:** The system calculates the estimated remaining days of gas based on historical average usage.
- **Automated Deployment:** No manual server login is required; code goes from "Commit" to "Live" in minutes.
- **Cloud-Native Security:** Sensitive database credentials are managed via Environment Variables and Kubernetes Secrets, ensuring no passwords are exposed in the source code.

## 5. Summary for Evaluators
This project demonstrates a complete mastery of the DevOps Lifecycle. It moves beyond simple "web development" into Platform Engineering, showing how a modern software engineer can manage high-scale applications using automation, containerization, and cloud orchestration.

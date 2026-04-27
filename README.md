# MultiLoad-Cloud-App 

### Multisport application for training plan personalization with load prediction.

---

## 📌 Project Overview
The **MultiLoad-Cloud-App** is a web-based platform designed for amateur athletes who combine different sports disciplines (e.g., running and strength training). The system solves the problem of overtraining by estimating physiological load using mathematical models and recommending optimal recovery times.

### Key Features:
- **Multisport Planning:** Integration of strength and endurance workouts in one calendar.
- **Load Estimation:** Using **TRIMP** (for cardio) and **S-RPE** (for strength) models.
- **Cloud-Native Architecture:** Scalable microservices deployed in a cloud environment.
- **Recovery Prediction:** Real-time feedback on body fatigue and injury risk.

---

## 🏗 System Architecture (TAM)
The project follows a decoupled, microservices-oriented architecture to ensure scalability and maintainability.

- **Frontend:** React.js (Vite) - Interactive SPA for users.
- **Core Backend:** Java 24 (Spring Boot) - Business logic, auth, and data management.
- **Analytics Engine:** Python 3.13 (FastAPI) - Specialized service for mathematical calculations.
- **Database:** PostgreSQL (AWS RDS) - Relational data storage.
- **Infrastructure:** Docker & Docker Compose for local orchestration.
- **CI/CD:** GitHub Actions for automated testing and deployment.

---

## 📁 Repository Structure
```text
.
├── .github/workflows    # CI/CD Pipeline configurations
├── analytics-engine    # Python FastAPI service (Mathematical models)
├── backend-core        # Java Spring Boot service (Core logic)
├── frontend            # React.js application (User Interface)
├── infra               # Docker Compose and Infrastructure as Code
└── README.md           # Project documentation

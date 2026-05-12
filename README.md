# AWARE – AI-Powered Blockchain-Inspired Civic Issue Reporting Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-aware--project.onrender.com-brightgreen)](https://aware-project.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-OVERLORDxx%2FAware--Project-blue)](https://github.com/OVERLORDxx/Aware-Project)

> A production-deployed, full-stack civic tech platform combining blockchain-inspired data integrity, zero-shot AI image classification, and GPS-based geolocation — built and deployed end-to-end.

---

## 🌐 Live Demo

**[https://aware-project.onrender.com](https://aware-project.onrender.com)**

- Frontend hosted on **Render** (Static Site)
- Backend hosted on **Render** (Web Service)
- Database hosted on **Railway** (Managed MySQL)

---

## 🧠 What is AWARE?

AWARE (AI-Powered Blockchain-Inspired Civic Issue Reporting Platform) lets citizens report local infrastructure problems — potholes, garbage, water leakage, broken streetlights — with cryptographic data integrity and AI-assisted classification. Every submitted report is cryptographically chained using SHA-256, making any tampering instantly detectable.

---

## 🚀 Key Features

### 🔗 Blockchain-Inspired Hash Chain
Each report generates a SHA-256 hash linked to the previous report's hash, forming an immutable chain. Any modification to a past report breaks the chain and is immediately flagged by the verification endpoint.

### 🤖 AI Image Classification
Integrates **ResNet-50 and ViT** models via HuggingFace Inference API. Users upload a photo and the model automatically classifies the issue type (Pothole, Garbage, Water Leakage, etc.) — no custom training data required.

### 📍 GPS Location Detection
Uses the browser Geolocation API with **OpenStreetMap Nominatim** reverse geocoding to auto-fill the human-readable address from GPS coordinates.

### 👤 Role-Based Access Control
Two roles — **User** (submit and track reports) and **Admin** (manage all reports, update statuses, verify hash chain integrity).

### 🔄 Real-Time Status Tracking
Citizens track their reports through three states: `Pending → In Progress → Completed`.

### ☁️ Full Cloud Deployment
Not a localhost prototype — fully deployed and publicly accessible.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, HTML5, CSS3, JavaScript (ES6+), Axios |
| Backend | Spring Boot 3.x (Java 17), Spring Data JPA, Hibernate |
| Database | MySQL 8.0 (hosted on Railway) |
| AI | microsoft/resnet-50 + google/vit-base-patch16-224 via HuggingFace Inference API |
| Location | OpenStreetMap Nominatim API |
| Security | SHA-256 (java.security.MessageDigest), BCrypt password hashing |
| Deployment | Render (frontend + backend), Railway (MySQL) |
| DevOps | Git, GitHub, Docker, CI/CD via Render GitHub integration |

---

## ⚙️ How It Works

1. User registers and logs in
2. User uploads an image → ResNet-50 and ViT models classify the issue type automatically
3. GPS location is detected and reverse-geocoded via OpenStreetMap
4. On submission, the backend fetches the last report's hash, computes `SHA-256(reportData + prevHash)`, and stores the new report with its hash
5. Admin can update report status and verify the entire hash chain for integrity
6. Any tampered record is flagged as `INVALID` by the verification endpoint

---

## 🔐 Hash Chain Algorithm

```java
hash(n) = SHA-256(issueType + description + location + userId + timestamp + hash(n-1))
```

The first report uses `"GENESIS"` as `prevHash`. Verification recomputes every hash sequentially and compares it to the stored value.

---

## 📂 Project Structure

```
Aware-Project/
├── frontend/          # React.js application
│   └── src/
│       ├── components/
│       └── pages/
├── backend/           # Spring Boot application
│   └── src/main/java/
│       ├── controller/
│       ├── service/
│       ├── model/
│       └── repository/
└── README.md
```

---

## 🛠️ Local Setup

### Prerequisites
- Node.js 18+, npm 9+
- Java JDK 17, Maven 3.9+
- MySQL 8.0

### Backend

```bash
cd backend
# Configure application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/aware
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.hibernate.ddl-auto=update

mvn clean package
java -jar target/aware-backend.jar
```

Set your HuggingFace token as an environment variable `HF_TOKEN` on your deployment platform (e.g. Render → Environment tab).

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🌩️ Deployment Architecture

```
Citizens / Admins
      │
      ▼
React.js Frontend  ──────────────────────►  Spring Boot Backend
(Render Static Site)    HTTPS REST APIs     (Render Web Service)
                                                    │
                          HuggingFace API ◄─────────┤
                    (ResNet-50 + ViT models)         │
                                                    ▼
                                            MySQL Database
                                           (Railway Cloud)
```

CI/CD is handled automatically — every push to `main` triggers a redeploy on Render.

---

## 📡 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login and get session |
| POST | `/api/reports` | User | Submit report (triggers hash generation) |
| GET | `/api/reports/user/{id}` | User | Get own reports |
| GET | `/api/admin/reports` | Admin | Get all reports |
| PATCH | `/api/admin/reports/{id}/status` | Admin | Update report status |
| GET | `/api/admin/verify-chain` | Admin | Verify hash chain integrity |

---

## 🧪 Test Results (Live Deployment)

- ✅ 15/15 functional test cases passed
- ✅ Hash chain tamper detection verified (SQL-level tampering detected correctly)
- ✅ AI classification accuracy: **82.5%** across 5 civic issue categories (zero-shot, no training data)
- ✅ Cross-browser tested: Chrome, Firefox, Edge

---

## 🔮 Future Improvements

- JWT-based stateless authentication
- Native Android / iOS app (React Native)
- Fine-tuned civic-issue AI model (target >95% accuracy)
- Real blockchain anchoring (Ethereum / Hyperledger)
- Geospatial heatmap for civic issue density
- Integration with government grievance portals (UMANG)
- Multilingual support (Hindi, Tamil, Telugu)

---

## 👨‍💻 Author

**Kuldeep Singh**
- GitHub: [@OVERLORDxx](https://github.com/OVERLORDxx)
- Email: ks14635142@gmail.com
- LinkedIn: https://linkedin.com/in/kuldeep-singh2004

---

## 📄 License

This project is open source. Feel free to fork, explore, and build on it.

# AWARE – AI-Powered Blockchain-Inspired Civic Issue Reporting Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-aware--project.onrender.com-brightgreen)](https://aware-project.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-OVERLORDxx%2FAware--Project-blue)](https://github.com/OVERLORDxx/Aware-Project)

> A production-deployed, full-stack civic tech platform combining blockchain-inspired data integrity and GPS-based geolocation — built and deployed end-to-end.

---

## 🌐 Live Demo

**[https://aware-project.onrender.com](https://aware-project.onrender.com)**

- Frontend hosted on **Render** (web service)
- Backend hosted on **Render** (Web Service)
- Database hosted on **Railway** (Managed MySQL)

---

## 🧠 What is AWARE?

AWARE (Advanced Web-based Application for Reporting Events) empowers citizens to report local infrastructure problems — potholes, garbage, water leakage, broken streetlights — with cryptographic data integrity and GPS geolocations. Every submitted report is cryptographically chained using SHA-256, making any tampering instantly detectable.

---

## 🚀 Key Features

### 🔗 Blockchain-Inspired Hash Chain
Each report generates a SHA-256 hash linked to the previous report's hash, forming an immutable chain. Any modification to a past report breaks the chain and is immediately flagged.

### 📍 GPS Location Detection
Uses the browser Geolocation API with **OpenStreetMap Nominatim** reverse geocoding to auto-fill the human-readable address from GPS coordinates.

### 👤 Role-Based Access Control
Two roles — **User** (submit and track reports) and **Admin** (manage all reports, update statuses, verify hash chain integrity).

### 🔄 Real-Time Status Tracking
Citizens track their reports through three states: `Pending → In Progress → Completed`.

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js 18, HTML5, CSS3, JavaScript (ES6+), Axios |
| Backend | Spring Boot 3.x (Java 17), Spring Data JPA, Hibernate |
| Database | MySQL 8.0 (hosted on Railway) |
| Location | OpenStreetMap Nominatim API |
| Security | SHA-256 (java.security.MessageDigest) |
| Deployment | Render (frontend + backend), Railway (MySQL) |
| DevOps | Git, GitHub, Docker, CI/CD via Render GitHub integration |

---

## ⚙️ How It Works

1. User registers and logs in.
2. User enters issue details and detects GPS location (using OpenStreetMap reverse geocoding).
3. User optionally uploads an image.
4. On submission, the backend fetches the last report's hash, computes `SHA-256(issueType + description + prevHash)`, and stores the new report with its hash.
5. Admin can update report status and verify the entire hash chain for integrity.
6. Any tampered record breaks the hash chain, making tampering instantly detectable.

---

## 🔐 Hash Chain Algorithm

```java
hash(n) = SHA-256(issueType + description + hash(n-1))
```

The first report uses `"0"` as `previousHash`. Verification recomputes every hash sequentially and compares it to the stored value.

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
                                                     ▼
                                             MySQL Database
                                            (Railway Cloud)
```

CI/CD is handled automatically — every push to `main` triggers a redeploy on Render.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| **POST** | `/api/reports` | Create a new report (includes image upload, geolocation, and hash generation) |
| **GET** | `/api/reports` | Retrieve all reports |
| **PATCH** | `/api/reports/{id}/status` | Update status (`PENDING`, `IN_PROGRESS`, etc.) |
| **DELETE**| `/api/reports/{id}` | Delete a specific report |
| **DELETE**| `/api/reports/all` | Delete all reports and reset the hash chain |

---

## 🧪 Test Results (Live Deployment)

- ✅ 15/15 functional test cases passed
- ✅ Hash chain tamper detection verified (SQL-level tampering detected correctly)
- ✅ Cross-browser tested: Chrome, Firefox, Edge

---

## 🔮 Future Improvements

- JWT-based stateless authentication
- Native Android / iOS app (React Native)
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

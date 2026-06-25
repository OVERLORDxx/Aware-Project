# AWARE – Secure, Blockchain-Inspired Civic Issue Reporting Platform

[![Live Demo](https://img.shields.io/badge/Live%20Demo-aware--project.onrender.com-brightgreen)](https://aware-project.onrender.com)
[![GitHub](https://img.shields.io/badge/GitHub-OVERLORDxx%2FAware--Project-blue)](https://github.com/OVERLORDxx/Aware-Project)

> A production-deployed, full-stack civic technology platform combining blockchain-inspired cryptographic data integrity, real-time map visualizations, and JWT authentication — styled with a premium green, black, and white design language.

---

## 🌐 Deployed Services & Environment

- **Frontend Application**: Hosted on **Render** (Static Web App)
- **Backend APIs**: Hosted on **Render** (Spring Boot Web Service)
- **Managed Database**: Hosted on **Aiven Cloud** (Managed MySQL 8.0 instance)

---

## 🧠 Core Architecture & Features

AWARE (Advanced Web-based Application for Reporting Events) is designed to give citizens a direct, transparent, and tamper-proof method to file civic complaints (such as road damage, street light outages, or waste issues). 

### 1. 🔗 Blockchain-Inspired Hash Chain
To guarantee that data cannot be altered by database administrators or bad actors, AWARE chains all entries. 
* Every report stores a SHA-256 hash calculated from its core data: `SHA-256(issueType + description + previousHash)`.
* The first report uses `"0"` as its previous hash. Subsequent reports query the database for the hash of the latest record.
* **Live Tamper Verification**: Any user or administrator can trigger a live verify-chain check. The backend sequentially re-computes every hash in the database, verifying links match perfectly. If any byte is altered in MySQL, the chain breaks immediately.

### 2. 🔐 JWT & BCrypt Security
* **Password Hashing**: User passwords are encrypted on-disk using strong salt hashing via **BCrypt**.
* **Stateless Authorization**: User login returns a signed **HMAC-256 JWT token** valid for 24 hours.
* **Role-Based Protection**: Users must sign in to submit new reports. Administrative actions (deleting reports, updating status, viewing all records) are fully secured in Spring Boot using strict token header validation.

### 3. 🗺️ Geolocation Map & GPS Tracking
* **Automatic Geolocation**: Detects exact GPS coordinates via the HTML5 Geolocation API.
* **Reverse Geocoding**: Queries **OpenStreetMap Nominatim API** on-the-fly to auto-convert latitude/longitude coordinates into human-readable Indian or regional addresses.
* **Interactive Issue Map**: Leverages **Leaflet.js** utilizing a premium **CartoDB Dark Matter** layer style. Plotted coordinates appear as pins matching our modern design layout, featuring quick-access status summaries inside Leaflet popups.

### 4. 🕒 Accurate Timestamps
* Every record is tracked with database-level creation timestamps.
* The frontend automatically parses and format these into human-readable relative/absolute dates in report cards.

---

## 🏗️ Technical Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js 19 (ES6+), Vanilla CSS (premium dark/neon green styling), Leaflet.js CDN mapping |
| **Backend** | Spring Boot 3.x (Java 17), Spring Data JPA, Hibernate, JWT, BCrypt |
| **Database** | MySQL 8.x (Hosted on Aiven Cloud) |
| **Security** | SHA-256 Hashing, HMAC-256 Tokenization, BCrypt Hashing |
| **Deployment** | Render Static Site + Web Service, Aiven MySQL Cloud |

---

## 📂 Project Structure

```
Aware-Project-main/
├── AWARE_PROJECT/
│   ├── aware-backend/                     # Spring Boot Application
│   │   ├── pom.xml                        # Maven dependencies (java-jwt, jbcrypt)
│   │   ├── src/main/java/com/aware/aware/
│   │   │   ├── Application.java           # Main Boot entry point
│   │   │   ├── CorsConfig.java            # Global CORS configuration
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java    # Register (/api/auth/register), Login (/api/auth/login)
│   │   │   │   └── ReportController.java  # Secured endpoints, verify-chain, GET/POST reports
│   │   │   ├── model/
│   │   │   │   ├── User.java              # User database model
│   │   │   │   └── Report.java            # Report database model (lat, lon, createdAt, hash, prevHash)
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java    # UserRepository interface
│   │   │   │   └── ReportRepository.java  # ReportRepository interface
│   │   │   └── util/
│   │   │       ├── HashUtil.java          # Helper for SHA-256 calculations
│   │   │       └── JwtUtil.java           # Helper for JWT HMAC-256 generation/decoding
│   │   └── src/main/resources/
│   │       └── application.properties     # Spring properties (${DB_URL}, ${DB_USERNAME}, ${DB_PASSWORD})
│   │
│   └── aware-frontend/                    # React.js Frontend
│       ├── .env                           # Backend endpoint url (REACT_APP_API_URL)
│       ├── package.json                   # Client-side configuration
│       ├── public/
│       │   └── index.html                 # Leaflet CSS/JS CDN dependencies
│       └── src/
│           ├── App.js                     # Main application layout, maps, Forms, and dashboards
│           └── App.css                    # Premium Green/Black UI layout system
│
└── README.md                              # Technical guide & documentation
```

---

## ⚙️ Local Development Setup

### Prerequisites
* **Java JDK 17** & **Maven 3.9+**
* **Node.js 18+** & **npm 9+**
* A running **MySQL 8.x** database

### 1. Database Configuration
Ensure a MySQL database exists (e.g. `aware`).
Spring Boot uses Hibernate's `ddl-auto=update` property to automatically build database tables (`users`, `reports`) on startup. No manual query execution is required.

### 2. Backend Setup
Set required environment variables and run the application:

```powershell
# Set Environment Variables (Windows PowerShell)
$env:DB_URL="jdbc:mysql://localhost:3306/aware?useSSL=false"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your_mysql_password"
$env:PORT="8080"

# Navigate to backend directory
cd AWARE_PROJECT/aware-backend

# Clean compile & launch
.\mvnw.cmd clean package
java -jar target/aware-backend-0.0.1-SNAPSHOT.jar
```

### 3. Frontend Setup
Configure the client to target the local backend and start:

```powershell
# Navigate to frontend directory
cd ../aware-frontend

# Set backend URL to local
echo "REACT_APP_API_URL=http://localhost:8080" > .env

# Install dependencies and start development server
npm install
npm start
```

*Note: Open `http://localhost:3000` to interact with the system locally.*

---

## 📡 API Reference Documentation

### Authentication Endpoints

#### `POST /api/auth/register`
* **Description**: Registers a new user. If username is `"admin"`, role is automatically assigned as `ADMIN`.
* **Payload**:
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```

#### `POST /api/auth/login`
* **Description**: Validates credentials and returns signed JWT access token.
* **Payload**:
  ```json
  {
    "username": "johndoe",
    "password": "securepassword123"
  }
  ```
* **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "USER"
  }
  ```

---

### Report Management Endpoints

#### `GET /api/reports`
* **Description**: Returns list of all civic issues in database order. (Public)

#### `GET /api/reports/verify-chain`
* **Description**: Sequentially reads all database report records, recomputes SHA-256 hashes, and flags chain anomalies.
* **Response (Success)**:
  ```json
  {
    "status": "VALID",
    "message": "Hash chain verified. All 23 records are cryptographically secure and intact."
  }
  ```
* **Response (Tampered)**:
  ```json
  {
    "status": "INVALID",
    "message": "Chain broken at Report #12! Expected previousHash...",
    "failedReportId": 12
  }
  ```

#### `POST /api/reports` (Secured: Bearer Token required)
* **Description**: Creates a new issue entry. Fetches previous hash, calculates SHA-256 hash, and saves coordinates/creation date.
* **Headers**: `Authorization: Bearer <JWT_TOKEN>`
* **Content-Type**: `multipart/form-data`
* **Request Params**:
  * `issueType` (String)
  * `description` (String)
  * `location` (String)
  * `latitude` (Double)
  * `longitude` (Double)
  * `image` (Multipart file, optional)

#### `PATCH /api/reports/{id}/status` (Secured: Admin Bearer Token required)
* **Description**: Updates report handling status.
* **Headers**: `Authorization: Bearer <ADMIN_JWT_TOKEN>`
* **Payload**: `{ "status": "IN_PROGRESS" }` (Valid values: `PENDING`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`)

#### `DELETE /api/reports/{id}` (Secured: Admin Bearer Token required)
* **Description**: Delete one report by ID.

#### `DELETE /api/reports/all` (Secured: Admin Bearer Token required)
* **Description**: Resets entire report chain database.

---

## 👨‍💻 Creator & Developer

**Kuldeep Singh**
- **GitHub**: [@OVERLORDxx](https://github.com/OVERLORDxx)
- **Email**: ks14635142@gmail.com
- **LinkedIn**: [Kuldeep Singh](https://linkedin.com/in/kuldeep-singh2004)

---

## 📄 License
This project is open-source and free to adapt. Feel free to copy, modify, and build upon the cryptographic chain features!

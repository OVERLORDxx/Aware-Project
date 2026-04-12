# 🔗 AWARE – Blockchain-Inspired Civic Issue Reporting Platform

AWARE is a full-stack web application that allows users to report civic issues (like potholes, garbage, water leakage, etc.) in a secure and tamper-proof way using a blockchain-inspired approach.

---

## 🚀 Features

- 🔗 Hash Chain Integrity  
  Each report is linked using SHA-256 hashing to ensure data integrity and prevent tampering  

- 🤖 AI-Based Issue Detection  
  Uses CLIP model (zero-shot learning) to automatically detect issue type from uploaded images  

- 📍 Location Detection  
  GPS-based location detection using OpenStreetMap API  

- 👤 User & Admin Roles  
  Users can submit reports and admins can update status  

- 🔄 Real-Time Status Tracking  
  Track report progress (Pending → In Progress → Completed)  

- 🗂 Image Upload Support  
  Users can attach images for better clarity  

---

## 🏗️ Tech Stack

Frontend: React.js, HTML, CSS, JavaScript  
Backend: Spring Boot (Java), REST APIs  
Database: MySQL  
AI: OpenAI CLIP Model (via HuggingFace API)  
Other: SHA-256 Hashing, OpenStreetMap API  

---

## ⚙️ How It Works

1. User submits a report with issue type, description, image, and location  
2. AI analyzes the image and suggests issue type  
3. Backend generates SHA-256 hash and links it with previous report  
4. Report is stored in database  
5. Admin updates status  
6. Any modification breaks hash chain → ensures integrity  

---

## 📂 Project Structure

aware/  
├── frontend/ (React App)  
├── backend/ (Spring Boot)  
├── database/ (MySQL)  

---

## 🛠️ Setup Instructions

1. Clone Repository  
git clone https://github.com/your-username/aware.git  
cd aware  

2. Backend Setup  
- Open backend in IDE (IntelliJ / Eclipse)  
- Configure MySQL in application.properties  
- Run Spring Boot  

Example:  
server.port=8080  
spring.datasource.url=jdbc:mysql://localhost:3306/aware  

3. Frontend Setup  
cd frontend  
npm install  
npm start  

4. AI Setup  
Add your HuggingFace API token in code:  
const HF_TOKEN = "your_token_here";  

---

## 🔐 Security & Integrity

- SHA-256 hashing ensures data integrity  
- Reports are linked forming a chain  
- Any modification breaks the chain and is detectable  

---

## 📸 Screenshots

(Add screenshots of your UI here)

---

## 📌 Future Improvements

- Blockchain integration (Ethereum)  
- Mobile app version  
- JWT Authentication  
- Real-time notifications  

---

## 👨‍💻 Author

Kuldeep Singh  
Email: ks14635142@gmail.com  
LinkedIn: https://www.linkedin.com/in/kuldeep-singh-b4164228b  

---

## ⭐ Contribution

Feel free to fork and contribute to the project!

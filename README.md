# Smart Resume-Job Matching and Optimisation Engine

An AI-powered resume analysis platform built with the **MERN stack** that analyzes resumes for ATS readiness, provides improvement suggestions, and manages multiple resume versions.

## ✨ Features

* 📄 **Resume Upload & Parsing** – Upload PDF resumes and extract structured resume data.
* 🤖 **AI ATS Analysis** – Get an ATS score with keyword, formatting, impact, and clarity analysis.
* ✍️ **AI Rewrites** – Generate improved resume bullet points to enhance ATS performance.
* 🔄 **Resume Versioning** – Automatically maintain different versions of uploaded and rewritten resumes.
* 🔍 **Diff Comparison** – Compare two resume versions using word-level and line-level differences.
* 📊 **Dashboard & Insights** – Track ATS scores, improvements, keywords, and resume activity.
* 📑 **PDF Export** – Preview and export resume versions as PDFs.
* 🔐 **Authentication** – Secure user authentication using JWT, HTTP-only cookies, and bcrypt.

## 🛠️ Tech Stack

**Frontend**

* React
* Vite
* Tailwind CSS
* TanStack Query
* Framer Motion
* Recharts

**Backend**

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcrypt
* Multer
* Zod

**AI & Processing**

* Google Gemini API
* PDF Parse
* Diff

## 🏗️ Architecture

```text
React
  ↓
Express REST API
  ↓
Authentication & Validation
  ↓
MongoDB / Mongoose
  ↓
Gemini AI
  ↓
ATS Analysis / Rewrites
  ↓
Resume Versioning & Diff
```

## 🔄 Workflow

```text
Upload Resume
      ↓
Extract & Parse PDF
      ↓
AI ATS Analysis
      ↓
View Score & Suggestions
      ↓
Apply AI Rewrites
      ↓
Create New Resume Version
      ↓
Compare Versions & Track Improvements
```

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/sonaa1107/AI-resume_Analysis.git
cd AI-resume-Analysis
```

### 2. Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLIENT_ORIGIN=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## 🔮 Future Improvements

* Job description matching
* DOCX resume support
* LinkedIn profile analysis
* Job-specific ATS scoring
* More resume templates
* Google/GitHub authentication

## 👨‍💻 Author

**Sona Agrawal**

Computer Science Engineering Student | Software Developer

---

⭐ If you found this project useful, consider giving it a star!

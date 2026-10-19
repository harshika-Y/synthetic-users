# REGALUX AI — Synthetic User Research Intelligence

> **AI-Powered Synthetic User Research & Product Validation Platform**  
> *Royal Emerald Digital Research Suite with Dynamic Personas & Targeted Survey Simulation*

[![Agile Documentation](https://img.shields.io/badge/Agile%20Documentation-Scrum%20%26%20Kanban-10B981?style=flat&logo=jira)](AGILE_DOCUMENTATION.md)
![Architecture](https://img.shields.io/badge/Architecture-Full--Stack%20FastAPI%20%2B%20React-10B981)
![Testing Suite](https://img.shields.io/badge/Test%20Suite-100%25%20Passing-34D399)
![License](https://img.shields.io/badge/License-Apache--2.0-123D32)

📄 **[View Complete Agile Project Documentation (AGILE_DOCUMENTATION.md)](AGILE_DOCUMENTATION.md)**

---

## 1. Executive Summary & Vision

**REGALUX AI** is a production-minded synthetic user research and product validation platform engineered for executive product leaders, UX strategists, and venture architects. 

Instead of static landing pages or fabricated dashboard cards, REGALUX AI provides a fully operational simulation engine where diverse, AI-synthesized customer personas participate in parallel quantitative surveys, engage in stateful multi-turn discovery interviews powered by vector memory, and yield explainable product adoption scores (0–100) supported by verifiable quotes and downloadable 18-chapter PDF dossiers.

### The Flagship Subject Study: SwiftBite
The initial preloaded study investigates **SwiftBite — Smart Food Delivery App** across 5 core hypotheses for urban working professionals:
1. **30-Minute Food Delivery Guarantee:** Investigating meeting calendar predictability vs. extreme speed.
2. **Dietician-Curated Healthy Food Section:** Measuring demand for transparent macro disclosures (protein, carbs, calories) and zero refined oils.
3. **SwiftBite Prime Subscription Plan:** Evaluating break-even economics for frequent corporate diners.
4. **Live Real-Time GPS Tracking:** Assessing sub-meter arrival notifications to prevent phone call disruptions.
5. **₹99 Delivery Fee:** Analyzing severe price elasticity across budget associates vs. corporate consultants.

---

## 2. Royal Visual Identity & Aesthetic System

Designed with a distinctive **Royal Obsidian + Champagne Gold + Royal Emerald** visual language combining an exclusive research laboratory with a luxury editorial publication:

- **Obsidian Black (`#0B0D10`):** Ultra-dark foundational workspace canvas.
- **Midnight Navy (`#111827`):** Layered card surfaces with backdrop blur.
- **Deep Royal Emerald (`#123D32`):** Strategic verification accents and healthy nutrition tags.
- **Antique Champagne Gold (`#D6B66F`):** Metrics, active borders, progress dials, and headlines.
- **Soft Ivory (`#F6F1E7`):** High-contrast editorial typography.
- **Muted Silver (`#A8B0BC`):** Refined secondary metadata labels.
- **Three.js Particle Constellation:** Ambient celestial background on landing hero with graceful WebGL fallback.

---

## 3. Technology Stack

- **Frontend:** React 19 + Vite 8 + Tailwind CSS v4.
- **State & Routing:** React Router v7 + React Context API (`AuthContext`).
- **Data Visualizations:** Recharts (Sentiment Doughnuts, Segment Bar Charts, Radar Distributions).
- **Icons & Motion:** Lucide React + Framer Motion.
- **Cinematic Canvas:** Three.js Particle Constellation with reduced-motion fallbacks.
- **Backend:** Python 3.13 FastAPI with async routing and CORS middleware.
- **Database:** SQLAlchemy 2.0 ORM with MySQL support and SQLite automatic local fallback.
- **Database Migrations:** Alembic migration suite (`backend/alembic`).
- **LLM Provider:** Groq API (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`).
- **Persona Vector Memory:** NumPy-based local cosine vector memory store with sub-millisecond semantic retrieval.
- **Authentication:** JWT Bearer tokens with PBKDF2/SHA-256 secure password hashing.
- **PDF Generation Engine:** ReportLab with custom `NumberedCanvas`, luxury editorial palette, dynamic tables, and page decoration.
- **Testing Suites:** Pytest + Httpx integration test runner.

---

## 4. Key Application Modules

### 1. Research Dashboard (`/dashboard`)
Executive overview displaying live metrics: Active Studies, Synthetic Personas, Completed Surveys, Interview Sessions, Extracted Themes, and Overall Adoption Potential (74.6%). Visualizes sentiment distributions and segment scores via interactive Recharts.

### 2. Persona Studio (`/personas`)
Explore 8 preloaded working professional archetypes:
1. **Arjun Sharma:** Senior Software Engineer *(Time-pressed corporate professional)*
2. **Pooja Hegde:** Associate Marketing Specialist *(Budget-conscious office employee)*
3. **Dr. Kavita Narayanan:** Clinical Research Lead *(Health-conscious working professional)*
4. **Rohan Mehra:** Management Consultant *(Frequent food delivery customer)*
5. **Sunita Patil:** Senior HR Director *(Occasional restaurant-ordering customer)*
6. **Vikram Sethi:** Equity Research Analyst *(Vegetarian professional)*
7. **Tanmay Ghosh:** Cloud Reliability Engineer *(Night-shift worker)*
8. **Ayesha Farooqi:** Venture Partner *(Premium convenience-focused professional)*
Includes dynamic archetype re-synthesis, deep profile expansion, and side-by-side comparison modal.

### 3. Experiment Builder (`/experiments/new`)
6-step guided wizard: Product Definition → Select Personas → Choose Research Methods (Survey, Interview, Both) → Questions Configuration → Review & Launch with live progress execution bar.

### 4. Survey Lab (`/surveys`)
Side-by-side persona comparison matrix across all survey questions. Features segment filtering, expandable persona reasoning, consistency validation scores, and one-click CSV export.

### 5. Interview Room (`/interviews`)
3-pane split qualitative discovery room:
- **Left Pane:** Persona profile dossier (schedule, budget, dietary habits, objections).
- **Center Pane:** Multi-turn conversational chat with suggested opening prompts and typing indicator.
- **Right Pane:** Vector Memory Radar retrieving episodic facts and identity alignment guards.

### 6. Insights & Evidence Intelligence (`/insights`)
Clusters research responses into structured themes with confidence ratings, sentiment pills, product strategy implications, and genuine participant quotes.

### 7. Product Adoption Scoring (`/adoption`)
Transparent, explainable 0–100 scoring algorithm:
$$\text{Score} = 0.25 \times \text{Speed} + 0.20 \times \text{Health} + 0.20 \times \text{Subscription} + 0.15 \times \text{Tracking} + 0.20 \times \text{Fee Tolerance}$$
Includes segment mean scores, top features, and primary barriers.

### 8. Scenario Library (`/scenarios`)
5 preloaded cross-domain templates ready for 1-click instantiation:
- **SwiftBite:** Food Delivery & Hyperlocal
- **NexLearn:** Online Upskilling Platform
- **PulseFit:** AI Workout & Longevity Companion
- **ArthaWealth:** Automated Personal Finance Vault
- **Chronos Flow:** Task & Meeting Orchestrator
Includes automated cross-domain validation testing.

### 9. Research Reports (`/reports`)
Generates and downloads publication-grade PDF dossiers with all 18 mandatory chapters, numbered canvas footers, executive summaries, and prominent synthetic research notices.

### 10. Subject Prototype Preview (`/cafe`)
Directly integrates the Kadappa Cafe & SwiftBite live food prototype under study with a top ribbon return banner.

---

## 5. Quickstart & Installation Guide

### Prerequisites
- Node.js v18+ and npm
- Python 3.10+ (tested on Python 3.13)

### Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database auto-seeding
python -m app.db.seed

# Start backend server (runs on port 8001)
python run.py
```

### Frontend Setup
```bash
# In project root:
npm install

# Start Vite dev server with proxy to backend
npm run dev
```
Open **`http://localhost:5173`** (or `http://localhost:5174`) in your browser.

---

## 6. Default Seeded Credentials

- **Email:** `researcher@regalux.ai`
- **Password:** `RoyalSecret2026!`
- *(Or click the **"Autofill Seeded Demo Credentials"** button on the Login page for 1-click access)*

---

## 7. Environment Configuration (`.env`)

Create a `.env` file in the root or `backend/` directory:

```env
# Server & Security
SECRET_KEY=regalux-royal-champagne-emerald-secret-2026-production
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Database (MySQL recommended in production; SQLite auto-fallback locally)
DATABASE_URL=sqlite:///./regalux.db
# For MySQL: mysql+pymysql://<user>:<password>@localhost:3306/regalux_db

# Groq LLM API Configuration (Optional)
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile

# Demo Mode (Forces deterministic simulation when true or when API key is empty)
DEMO_MODE=false
```

---

## 8. Automated Testing

### 1. Pytest Backend Suite (9 Unit & Integration Tests)
```bash
# In project root:
$env:PYTHONPATH="backend"; backend\venv\Scripts\pytest.exe backend\tests\test_api.py -v
```
**Results:** `9 passed in 1.04s`

### 2. Full System End-to-End Verification (10 Key Capabilities)
```bash
$env:PYTHONIOENCODING="utf-8"; backend\venv\Scripts\python.exe backend\tests\verify_full_system.py
```
**Results:** `ALL 10 END-TO-END VERIFICATION CHECKS PASSED WITH ROYAL DISTINCTION!`

---

## 9. Project Archive Artifact

A clean project archive ready for distribution is available at:
`regalux_ai_suite.zip` (root directory, ~24.5 MB, excluding `node_modules`, `venv`, and build artifacts).

---

## 10. Mandatory Disclaimer & Limitations

> [!WARNING]
> **SYNTHETIC RESEARCH NOTICE:** All personas, survey answers, conversational replies, and adoption scores generated by REGALUX AI are algorithmic simulations designed for exploratory hypothesis testing. They do **not** represent statistically verified empirical customer feedback or measured market demand. Real-world validation (A/B testing, pilot user interviews, smoke tests) is strongly recommended before committing capital to production deployment.

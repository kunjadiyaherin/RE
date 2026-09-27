# 🏢 Property Intelligence — India Real Estate Market Intelligence Platform

[![Python Version](https://img.shields.io/badge/Python-3.10%2B-blue.svg?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI%200.115%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB.svg?logo=react&logoColor=black)](https://vitejs.dev)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20SQLite%20Failover-336791.svg?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Machine Learning](https://img.shields.io/badge/ML-Scikit--Learn%20OLS%20Regression-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

**Property Intelligence (v3.0.0)** is an enterprise-grade real estate market intelligence, official regulatory verification, algorithmic price forecasting, and fraud detection platform tailored for the Indian real estate ecosystem. 

It aggregates and cross-analyzes data across state **RERA (Real Estate Regulatory Authority)** registries, government land revenue circle rates (Jantar Mantri / Ready Reckoner), developer track records, infrastructure expansion corridors, and live public macro indicators to empower home buyers, institutional investors, financial institutions, and regulatory bodies.

---

## 📑 Table of Contents

- [Features Overview](#-features-overview)
- [System Architecture](#-system-architecture)
- [Project Directory Structure](#-project-directory-structure)
- [Tech Stack](#-tech-stack)
- [Live Public APIs & Macro Data](#-live-public-apis--macro-data)
- [Getting Started & Installation](#-getting-started--installation)
  - [Prerequisites](#prerequisites)
  - [Method 1: Automated PowerShell Runner](#method-1-automated-powershell-runner-recommended-for-windows)
  - [Method 2: Root NPM Workspace Scripts](#method-2-root-npm-workspace-scripts)
  - [Method 3: Manual Service-by-Service Setup](#method-3-manual-service-by-service-setup)
- [Configuration & Environment Variables](#-configuration--environment-variables)
- [Dual-Engine Database & Zero-Config Failover](#-dual-engine-database--zero-config-failover)
- [REST API Documentation](#-rest-api-documentation)
- [Interactive Swagger & OpenAPI Documentation](#-interactive-swagger--openapi-documentation)
- [Standalone Tools (AI Service & Scraper Engine)](#-standalone-tools-ai-service--scraper-engine)
- [License & Contributing](#-license--contributing)

---

## ✨ Features Overview

### 1. 🔍 RERA Registry Explorer & Instant Verification
- Query official project registration records across state authorities (**GujRERA**, **MahaRERA**, **HRERA**, **UP-RERA**, **K-RERA**).
- Instant verification of registration validity, declared completion deadlines, delay metrics, structural audit status, escrow account compliance, and active legal dispute flags.

### 2. 🏗️ Builder & Developer Track Record Index
- Comprehensive builder corporate profiles with CIN, PAN, and established year.
- Quantitative **Trust Score (1–100)** and rating tiers (*Institutional Grade A, Investment Grade B, Speculative C, High Risk D*).
- Portfolio analytics comparing delivered vs. ongoing projects, average project delay (months), and litigation counts.

### 3. 📜 Land Registry & Official Circle Rate Tracker
- Compare government-notified circle rates against prevailing free-market transaction rates across key localities.
- Identify valuation discrepancies, stamp duty calculations, and premium vs. aligned categorization.

### 4. 📈 Integrated AI Price Forecasting Engine
- Native **Scikit-Learn Ordinary Least Squares (OLS) Linear Regression** engine embedded within the FastAPI service (`services/ml_forecast.py`).
- Generates **6-month (+2Q)**, **1-year (+4Q)**, and **5-year (+20Q)** forward projections with model goodness-of-fit metrics ($R^2$ score), historical 12-quarter trend lines, appreciation probabilities, and rental yields.

### 5. 🛡️ Dynamic Fraud Detection & Anomaly Scanner
- Algorithmic anomaly scanner detecting:
  - **Circle Rate Discrepancies**: Transactions registered >15% below government circle rate (tax evasion / undervaluation risk).
  - **Portfolio Delay Risks**: Developers with >25% project delay ratios or average delays >12 months.
  - **Regulatory Warnings**: Projects with active legal disputes or severe timeline extensions.

### 6. 🌐 Real-Time Live Ticker & Macro Indicators
- Live continuous ticker bar presenting:
  - **Foreign Exchange (USD/INR, EUR, GBP, AED, SGD)** for NRI investors via Frankfurter API.
  - **Indian Macroeconomics (CPI Inflation, GDP Growth, RBI Repo Rate, Home Loan Base Rate)** via World Bank Open Data API.
  - **Live Weather & Air Quality Index (US AQI, PM2.5, PM10, Liveability Score)** via Open-Meteo.
  - **Automated Background Worker (`FastAPILiveWorker`)**: Refreshes and logs live macroeconomic data to system logs every 2 minutes.

### 7. 🚆 Micro-Market & Infrastructure Growth Corridors
- Evaluates real estate appreciation catalysts including Metro Line expansions, Expressways, and Airport proximity with distance-weighted impact boosts.

### 8. 📊 Multi-City Investment Comparison Hub
- Side-by-side comparative analysis of **Mumbai, Ahmedabad, Pune, Surat, Bangalore, and Hyderabad** across infrastructure growth, real estate demand, population influx, and average deal size.

### 9. 🔖 Authenticated Investor Watchlist
- JWT-authenticated bookmarking system allowing users to save, monitor, and manage target cities, localities, builders, and RERA projects.

### 10. ⚙️ Admin Command Center & Health Diagnostics
- Live telemetry for database connectivity, table record tallies, registered government datasets, manual crawler sync triggers, and descending system audit logs.

### 11. 💡 Buyer & Investor Guidance Center
- Interactive due diligence checklists, circle rate cheat sheets, stamp duty calculators, and legal property acquisition guidelines.

---

## 📐 System Architecture

```mermaid
graph TD
    subgraph Client Layer
        A[React 19 + Vite Client\n:5173]
        A --> B[LiveTickerBar Component]
        A --> C[Recharts Data Visualizations]
        A --> D[Axios / Fetch API Client]
    end

    subgraph Backend API [Python FastAPI Service :5000]
        E[FastAPI Core Router\n/api/*]
        F[Live Background Worker\nFastAPILiveWorker]
        G[ML Forecast Engine\nScikit-Learn OLS]
        H[JWT / Bcrypt Security Middleware]
    end

    subgraph Public APIs & Data Sources
        P1[Open-Meteo Weather & AQI]
        P2[Frankfurter Forex API]
        P3[World Bank India Macro]
        P4[OpenStreetMap Nominatim]
    end

    subgraph Persistence Layer
        DB1[(PostgreSQL Database\nlocalhost:5731)]
        DB2[(SQLite Resilient Failover\nproperty_intel.db)]
    end

    D -->|HTTP / REST API| E
    F -->|Poll every 120s| P2
    F -->|Poll every 120s| P3
    E -->|Spatial Geocode| P4
    E -->|Weather / Liveability| P1
    E -->|Run Regression| G
    E -->|SQLAlchemy ORM| DB1
    DB1 -.->|Auto-Failover on Conn Error| DB2
```

---

## 📂 Project Directory Structure

```text
RE/
├── package.json                   # Root workspace scripts (run both services, install deps)
├── run-dev.ps1                    # One-click PowerShell multi-process launcher
├── README.md                      # Comprehensive project documentation
│
├── backend/                       # Python FastAPI REST API Backend
│   ├── .env                       # Environment configuration (Port, DB URLs, JWT Secret)
│   ├── requirements.txt           # Python dependencies (FastAPI, SQLAlchemy, Scikit-Learn, etc.)
│   ├── property_intel.db          # Pre-seeded resilient SQLite database
│   └── app/
│       ├── main.py                # FastAPI app initialization, CORS, lifespan & background worker
│       ├── database.py            # Dual-engine DB manager (PostgreSQL with SQLite fallback)
│       ├── models.py              # SQLAlchemy ORM schemas (Users, RERA, Builders, Transactions, etc.)
│       ├── schemas.py             # Pydantic request/response models
│       ├── auth.py                # JWT token creation, password hashing, and user dependencies
│       ├── seeder.py              # Database seeder with high-fidelity realistic Indian RE data
│       ├── routers/               # Modular API endpoint routers
│       │   ├── live_routes.py         # Live Ticker, Open-Meteo, Forex, Macroeconomics, Geocoding
│       │   ├── auth_routes.py         # Registration, Login, OTP verification, Password Reset
│       │   ├── rera_routes.py         # RERA project search, verification, and detail endpoints
│       │   ├── builder_routes.py      # Builder directory and track record profiles
│       │   ├── transaction_routes.py  # Property deeds, sales data, and circle rate lookup
│       │   ├── analytics_routes.py    # City comparison, area growth, and ML price forecasting
│       │   ├── fraud_routes.py        # Anomaly scanner and dynamic fraud reports
│       │   ├── watchlist_routes.py    # Investor saved cities, localities, builders, and projects
│       │   └── admin_routes.py        # System health telemetry, crawler sync, and system logs
│       └── services/
│           ├── live_public_apis.py    # Public API integrations with in-memory TTL caching
│           └── ml_forecast.py         # Scikit-Learn OLS linear regression calculation engine
│
├── frontend/                      # React 19 + Vite Single Page Application
│   ├── package.json               # Frontend dependencies (React 19, Recharts, Lucide, Tailwind)
│   ├── vite.config.js             # Vite configuration and proxy setup
│   ├── index.html                 # HTML entry point
│   └── src/
│       ├── main.jsx               # React DOM root mounting point
│       ├── App.jsx                # Main application container, tab switcher, auth state
│       ├── apiService.js          # Unified API service layer with direct public fallback support
│       ├── index.css              # Custom styling, animations, and Tailwind directives
│       ├── components/
│       │   └── LiveTickerBar.jsx  # Real-time streaming macro & forex ticker bar
│       └── pages/                 # 13 Modular UI Analytics Views
│           ├── OverviewTab.jsx        # Executive dashboard, key KPIs, quick verify
│           ├── RERATab.jsx            # RERA registry search, filtering, and risk indicators
│           ├── BuildersTab.jsx        # Developer track record, delivery ratios, litigation
│           ├── CircleRatesTab.jsx     # Government circle rates vs market rates
│           ├── ForecastTab.jsx        # ML price projection graphs (6M / 1Y / 5Y)
│           ├── GrowthTab.jsx          # Micro-market growth and infra corridors
│           ├── ComparisonTab.jsx      # Multi-city investment metrics comparison
│           ├── FraudTab.jsx           # Anomaly scanner and risk categorization
│           ├── HistoricalTab.jsx      # Historical quarterly volume and price charts
│           ├── GuidanceTab.jsx        # Buyer due diligence and legal guidelines
│           ├── WatchlistTab.jsx       # Saved investor bookmarks
│           ├── AdminTab.jsx           # Database status, logs, and crawler sync
│           └── SettingsTab.jsx        # Account settings and preferences
│
├── ai-service/                    # Standalone FastAPI Machine Learning microservice
│   ├── main.py                    # Independent OLS linear regression service (:8000)
│   └── requirements.txt           # AI service dependencies
│
└── data-collector/                # Regulatory Web Scraping Engine
    ├── crawler.py                 # BeautifulSoup4 RERA portal crawler (GujRERA, MahaRERA)
    └── requirements.txt           # Scraper dependencies (BeautifulSoup4, Requests, LXML)
```

---

## 🛠️ Tech Stack

| Domain | Technologies & Libraries | Description |
| :--- | :--- | :--- |
| **Backend Framework** | **Python 3.10+**, **FastAPI 0.115+**, **Uvicorn** | High-throughput asynchronous REST API server |
| **ORM & Database** | **SQLAlchemy 2.0+**, **PostgreSQL**, **SQLite** | Dual-engine database architecture with automatic zero-config fallback |
| **Authentication & Security** | **Python-Jose (JWT)**, **Passlib (Bcrypt)**, **Pydantic v2** | Stateless JWT authentication, secure password hashing, schema validation |
| **Machine Learning** | **Scikit-Learn**, **NumPy**, **Pandas** | Ordinary Least Squares (OLS) Linear Regression for 6M/1Y/5Y property price prediction |
| **Client Frontend** | **React 19**, **Vite 8** | Modern reactive SPA architecture with Hot Module Replacement |
| **UI & Styling** | **Tailwind CSS**, **Lucide React** | Sleek, dark/light responsive interface with custom micro-animations |
| **Data Visualization** | **Recharts 3.9+** | Interactive charts for forecasts, historical trends, and city metrics |
| **Live Public APIs** | **Open-Meteo**, **Frankfurter**, **World Bank**, **Nominatim** | Real-time weather, AQI, forex, Indian macro indicators, and geocoding |
| **Web Scraping** | **BeautifulSoup4**, **LXML**, **HTTPX**, **Requests** | Regulatory RERA portal data extraction and table parsing |

---

## 🌐 Live Public APIs & Macro Data

The platform integrates several public APIs with **in-memory TTL caching** to prevent rate limits:

1. **Frankfurter Currency API**: Fetches real-time foreign exchange rates for Indian Rupee (`USD/INR`, `EUR/INR`, `GBP/INR`, `AED/INR`, `SGD/INR`) for non-resident Indian (NRI) investors.
2. **World Bank Open Data API**: Tracks Indian macro statistics:
   - Consumer Price Index (CPI) Inflation Rate (%)
   - Gross Domestic Product (GDP) Annual Growth Rate (%)
   - Reserve Bank of India (RBI) Repo Rate & Benchmark Home Loan Base Rates
3. **Open-Meteo Weather & Air Quality API**: Retrieves hyper-local weather conditions (temperature, wind speed) and air quality indices (`US AQI`, `PM2.5`, `PM10`) to calculate an **Environmental Liveability Score (0–100)** for top cities.
4. **OpenStreetMap Nominatim**: Provides open reverse geocoding and coordinate resolution without requiring proprietary API keys.

---

## 🚀 Getting Started & Installation

### Prerequisites

Ensure you have the following installed on your system:
- **Python**: v3.10 or higher ([Download Python](https://www.python.org/downloads/))
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm**: v9.0.0 or higher
- *(Optional)* **PostgreSQL**: v14+ (Not required; SQLite automatically handles all operations if PostgreSQL is absent)

---

### Method 1: Automated PowerShell Runner (Recommended for Windows)

From the project root directory, run the automated launcher script:

```powershell
.\run-dev.ps1
```

The script will:
1. Verify and install any missing Python dependencies (`backend/requirements.txt`).
2. Verify and install frontend `node_modules` if needed.
3. Automatically launch the **Python FastAPI Backend** in a new terminal window on `http://127.0.0.1:5000`.
4. Automatically launch the **React + Vite Frontend** in a new terminal window on `http://localhost:5173`.

---

### Method 2: Root NPM Workspace Scripts

From the repository root:

```bash
# 1. Install all dependencies across backend and frontend
npm run install-all

# 2. In Terminal A: Start the FastAPI Backend
npm run dev:backend

# 3. In Terminal B: Start the Vite Frontend Client
npm run dev:frontend
```

---

### Method 3: Manual Service-by-Service Setup

#### 1. Backend Setup (FastAPI)
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Run the FastAPI server via Uvicorn
python -m uvicorn app.main:app --host 127.0.0.1 --port 5000 --reload
```
- API Server: `http://localhost:5000/api`
- Health Endpoint: `http://localhost:5000/health`
- Interactive Swagger UI: `http://localhost:5000/docs`

#### 2. Frontend Setup (React + Vite)
```bash
cd frontend

# Install npm packages
npm install

# Start development server
npm run dev
```
- Frontend Application: `http://localhost:5173`

---

## ⚙️ Configuration & Environment Variables

The backend configuration is managed via `backend/.env`:

```env
# Server Port
PORT=5000

# Primary PostgreSQL Database Connection (Optional)
DATABASE_URL=postgresql://postgres:postgres@localhost:5731/property_intel_db

# Resilient SQLite Fallback Database (Works out of the box with zero setup)
FALLBACK_DB_URL=sqlite:///./property_intel.db

# JWT Authentication Secret Key
JWT_SECRET=real_estate_secret_token_12948

# SMTP Email Notification Credentials (Optional for production OTP dispatch)
GMAIL_USER=propintelligence1111@gmail.com
GMAIL_PASS=nudlmwlarizlsivy
```

> [!NOTE]
> For local development, you do **not** need a running PostgreSQL instance. The application gracefully initializes the pre-seeded SQLite database (`backend/property_intel.db`), providing complete functionality immediately.

---

## 🛡️ Dual-Engine Database & Zero-Config Failover

The platform implements a self-healing **Dual-Engine Database Strategy** (`backend/app/database.py`):

```mermaid
flowchart LR
    Start([FastAPI Startup]) --> AttemptPG{Connect to PostgreSQL\nDATABASE_URL}
    AttemptPG -->|Success| UsePG[Bind Engine to PostgreSQL\nProduction Scale]
    AttemptPG -->|Unavailable| Fallback[Activate Resilient SQLite Engine\nproperty_intel.db]
    UsePG --> Seed[Seed Initial Data if Empty]
    Fallback --> Seed
    Seed --> Ready([API Ready to Accept Traffic])
```

- **PostgreSQL**: Used when available for enterprise relational storage, concurrent writes, and production deployments.
- **SQLite Failover**: Automatically activated with zero developer friction if PostgreSQL is offline or unreachable. Includes pre-seeded sample data across builders, transactions, projects, and circle rates.

---

## 📡 REST API Documentation

All primary API routes are served under the `/api` prefix.

### 1. Live Public APIs (`/api/live`)

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/live/ticker` | - | Aggregated live data: USD/INR, EUR, GBP, AED, CPI inflation, GDP growth, RBI repo rate, and city weather |
| **GET** | `/api/live/geocoding` | `q` (string, required) | OpenStreetMap Nominatim spatial geocoding and coordinates lookup |
| **GET** | `/api/live/weather` | `lat`, `lon`, `city` | Open-Meteo current temperature, wind speed, US AQI, PM2.5, and liveability score |
| **GET** | `/api/live/forex` | - | Real-time foreign currency exchange rates (USD, INR, EUR, GBP, AED, SGD) |
| **GET** | `/api/live/macroeconomics` | - | India macroeconomic indicators from World Bank Open Data |

### 2. Authentication & Users (`/api/auth`)

| Method | Endpoint | Request Body | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | `{ username, email, password, role }` | Register new account; generates verification OTP |
| **POST** | `/api/auth/login` | `{ email, password }` | Authenticate user credentials; returns JWT bearer token |
| **POST** | `/api/auth/verify-otp` | `{ email, otp }` | Verify account via 6-digit OTP code (`123456` in dev) |
| **POST** | `/api/auth/resend-otp` | `{ email }` | Dispatches fresh verification OTP code |
| **POST** | `/api/auth/forgot-password`| `{ email }` | Dispatches password reset code |
| **POST** | `/api/auth/reset-password` | `{ email, resetCode, newPassword }` | Resets password after verifying reset code |
| **GET** | `/api/auth/me` | *Bearer Token Header* | Retrieves authenticated user profile |

### 3. RERA Registry Explorer (`/api/rera`)

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/rera/verify` | `regNumber` (required) | Instant verification of RERA registration ID with risk analysis |
| **GET** | `/api/rera/projects` | `state`, `city`, `status`, `search` | Query and filter RERA projects with keyword search |
| **GET** | `/api/rera/projects/{id}`| `project_id` (path) | Retrieve comprehensive project profile by ID or registration number |

### 4. Builder & Developer Profiles (`/api/builders`)

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/builders` | `state` (optional) | List all tracked builders with trust scores and rating tiers |
| **GET** | `/api/builders/{id}` | `builder_id` (path) | Detailed builder profile with delivery stats, litigations, and associated projects |

### 5. Transactions & Circle Rates (`/api/transactions`)

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/transactions` | `city`, `locality`, `propertyType` | Query registered property transaction deeds |
| **GET** | `/api/transactions/circle-rates` | `city` (optional) | Official circle rates vs prevailing market rates with variance % |

### 6. Analytics & AI Forecasting (`/api/analytics`)

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/analytics/city-comparison` | - | Comparative metrics across 6 major Indian metropolitan areas |
| **GET** | `/api/analytics/area-growth` | `city` (optional) | Locality growth scores boosted by proximity to infrastructure |
| **GET** | `/api/analytics/forecast` | `city`, `locality` (required) | Run Scikit-Learn OLS linear regression for 6M, 1Y, and 5Y price predictions |
| **GET** | `/api/analytics/opportunities` | - | Algorithmic undervaluation opportunities ranked by opportunity score |
| **GET** | `/api/infrastructure-projects` | `city` (optional) | Query planned and active infrastructure corridors (Metro lines, Expressways) |

### 7. Fraud Detection & Anomaly Scanner (`/api/fraud`)

| Method | Endpoint | Query Parameters | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/fraud/reports` | `city`, `riskLevel` | Retrieve flagged fraud reports and risk categorizations |
| **GET** | `/api/fraud/scan` | - | Triggers live rule-based anomaly scan across transactions and builders |

### 8. Investor Watchlist (`/api/watchlist`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/watchlist` | Bearer Token | Retrieve saved cities, localities, builders, and projects |
| **POST** | `/api/watchlist/add` | Bearer Token | Add an item (`{ type: "city"|"locality"|"builder"|"project", value }`) |
| **POST** | `/api/watchlist/remove` | Bearer Token | Remove an item from the user's watchlist |

### 9. Admin & System Health (`/api/admin` & `/health`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **GET** | `/health` | Instant health check returning backend engine and database status |
| **GET** | `/api/admin/health` | Comprehensive system telemetry: table record counts, active background jobs, audit logs |
| **POST** | `/api/admin/sync` | Manually triggers live crawler sync for a specified regulatory dataset |

---

## 📖 Interactive Swagger & OpenAPI Documentation

FastAPI automatically generates interactive, exploratory API documentation accessible directly in your browser:

- **Swagger UI**: [http://localhost:5000/docs](http://localhost:5000/docs)
- **ReDoc UI**: [http://localhost:5000/redoc](http://localhost:5000/redoc)
- **OpenAPI JSON Specification**: [http://localhost:5000/openapi.json](http://localhost:5000/openapi.json)

---

## 🔬 Standalone Tools (AI Service & Scraper Engine)

In addition to the primary FastAPI backend, the repository includes two standalone micro-tools:

### 1. Standalone AI Forecasting Service (`ai-service/`)
A dedicated FastAPI regression service that can be run independently:
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```
- Runs on: `http://127.0.0.1:8000`
- Provides `/api/forecast?city=Mumbai&locality=Bandra` and `/api/health` endpoints.

### 2. Standalone Web Scraping Engine (`data-collector/`)
Demonstrates BeautifulSoup4 and LXML HTML table extraction for official RERA registries:
```bash
cd data-collector
pip install -r requirements.txt
python crawler.py
```
- Scrapes and parses public regulatory portals (GujRERA and MahaRERA) for registration numbers, promoters, and project categories.

---

## 📄 License & Contributing

Distributed under the MIT License. Contributions, issue reports, and feature suggestions are welcome!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

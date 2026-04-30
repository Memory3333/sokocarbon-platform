# sokocarbon-platform
Micro-carbon credit aggregation platform
# Memory3333.github.io
# 🌱 SokoCarbon

**Micro-Carbon Credit Aggregation Platform for Informal Clean Cooking Traders**

> *Breaking the Wall of Carbon Finance Exclusion*

[![Platform: Sub-Saharan Africa](https://img.shields.io/badge/Platform-Sub--Saharan%20Africa-orange.svg)]()
[![Category: ClimaTech](https://img.shields.io/badge/Category-ClimaTech-blue.svg)]()
[![Falling Walls 2026](https://img.shields.io/badge/Falling%20Walls-2026%20Applicant-red.svg)]()

---

## The Problem

Over **90% of urban households** in Eastern and Southern Africa cook on charcoal or firewood, generating an estimated **1.0–1.5 billion tonnes of CO₂-equivalent annually**.

International voluntary carbon markets pay **$5–50 per avoided tonne** — yet the women who dominate the informal cooking fuel trade are entirely excluded:

- ❌ Credits require **100-tonne minimum bundles**
- ❌ Verification costs **$50,000–$200,000**
- ❌ Systems require **formal banking infrastructure**

The people driving the clean cooking transition are locked out of the climate finance system built to reward them.

---

## The Solution

SokoCarbon is a **mobile aggregation platform** that enables informal women cooking fuel traders in Sub-Saharan Africa to:

1. **Collectively generate** micro-carbon credits
2. **Automatically verify** avoided emissions (Gold Standard TPDDTEC methodology)
3. **Monetise** credits through corporate/NGO buyer marketplace
4. **Receive payment** via Airtel Money & TNM Mpamba

Using **USSD and mobile money infrastructure** traders already have — no smartphone required.

---

## How It Works

```
Trader Enrols (USSD *384#)
        ↓
Weekly Fuel Sales Logged
        ↓
Emissions Engine Calculates Avoided CO₂
        ↓
Credits Pool Until Bundle Threshold Met
        ↓
Buyer Dashboard Lists Available Credits
        ↓
Corporate/NGO Purchases Bundle
        ↓
Revenue Disbursed via Mobile Money
        ↓
Trader Receives PDF Certificate
```

---

## Architecture

```
sokocarbon/
├── backend/                    # Node.js / Express API
│   ├── emissions-engine/       # TPDDTEC Gold Standard methodology
│   ├── aggregation/            # Credit pooling & bundle formation
│   ├── disbursement/           # Mobile money integration (Airtel, TNM)
│   └── marketplace/            # Buyer dashboard API
│
├── frontend/                   # React Native (trader app)
│   ├── enrolment/              # Trader onboarding flow
│   ├── fuel-log/               # Weekly sales logging
│   └── earnings/               # Credit balance & history
│
├── ussd/                       # USSD gateway integration
│   ├── flows/                  # Menu tree definitions
│   └── handlers/               # Session state management
│
└── docs/                       # Methodology & audit documentation
    ├── tpddtec-implementation.md
    └── audit-trail-spec.md
```

---

## Emissions Engine

The core emissions calculation implements the **Gold Standard TPDDTEC** (Tool to Determine the Demonstration of Additionality and Emissions Reductions for Clean Cooking Technologies) methodology:

```javascript
// Simplified emissions calculation
function calculateAvoidedEmissions(trader) {
  const { fuelType, quantitySold, region, period } = trader.weeklyLog;
  
  // Baseline emissions from displaced charcoal/firewood
  const baselineEmissions = EMISSION_FACTORS[region][fuelType] * quantitySold;
  
  // Project emissions from clean fuel
  const projectEmissions = CLEAN_FUEL_FACTORS[fuelType] * quantitySold;
  
  // Leakage adjustment (TPDDTEC §4.3)
  const leakage = calculateLeakage(trader.tradeVolume, region);
  
  // Net avoided CO₂-equivalent (kg)
  return (baselineEmissions - projectEmissions) * (1 - leakage);
}
```

---

## USSD Flow

```
*384# → SokoCarbon
  [1] Log this week's sales
  [2] Check my credits
  [3] Withdraw earnings
  [4] Help
```

Designed for **2G feature phones** — zero data, zero smartphone, zero bank account required.

---

## Team

| Name | Role | Institution |
|------|------|-------------|
| **Lydia Wanjiku** | Team Lead, Backend & Emissions Engine | University of Nairobi, Kenya |
| **Amina Barakat** | Mobile & USSD Developer | University of Khartoum, Sudan |
| **Rutendo Chikwanda** | Database Architecture & Audit Systems | University of Zambia |

---

## Impact

| Metric | Target (Year 3) |
|--------|----------------|
| Active traders | 50,000 |
| Countries | 6 (Malawi, Kenya, Zambia, Tanzania, Uganda, Sudan) |
| CO₂ avoided annually | 500,000 tonnes |
| Trader income supplement | $15–40/month |
| Deforestation reduced | ~120,000 hectares/year |

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Africa's Talking USSD API credentials
- Airtel Money / TNM Mpamba API credentials

### Installation

```bash
git clone https://github.com/sokocarbon/sokocarbon-platform
cd sokocarbon-platform
npm install
cp .env.example .env
# Configure your API credentials in .env
npm run dev
```

### Environment Variables

```env
DATABASE_URL=postgresql://...
AFRICASTALKING_API_KEY=...
AFRICASTALKING_USERNAME=...
AIRTEL_MONEY_CLIENT_ID=...
TNM_MPAMBA_API_KEY=...
GOLD_STANDARD_REGISTRY_KEY=...
```

---

## Demo

▶️ **[Watch the 90-second demo](https://youtu.be/YOUR_VIDEO_ID)**

Full flow: Trader USSD enrol → fuel log → emissions calc → bundle formation → buyer purchase → mobile money disbursement → PDF certificate.

---

## Documentation

- [Emissions Methodology (TPDDTEC)](docs/tpddtec-implementation.md)
- [Audit Trail Specification](docs/audit-trail-spec.md)
- [USSD Flow Diagrams](docs/ussd-flows.md)
- [Buyer Dashboard Guide](docs/buyer-guide.md)

---



*Submitted to the Falling Walls Global Call for Science Breakthroughs 2026 — Engineering & Technology*

*Team SokoCarbon | Breaking the Wall of Carbon Finance Exclusion*

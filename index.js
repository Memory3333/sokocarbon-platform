/**
 * SokoCarbon Emissions Engine
 * Implements Gold Standard TPDDTEC methodology for micro-scale
 * avoided emissions calculation in informal cooking fuel trade.
 *
 * Methodology: Tool to Determine the Demonstration of Additionality
 * and Emissions Reductions for Clean Cooking Technologies (TPDDTEC v3.0)
 * Gold Standard Foundation, Geneva
 */

// Regional emission factors (tonnes CO2e per GJ) — Sub-Saharan Africa
const EMISSION_FACTORS = {
  'east-africa': {
    charcoal: 0.0112, // kg CO2e per kg
    firewood: 0.0081,
    crop_residue: 0.0064,
  },
  'southern-africa': {
    charcoal: 0.0118,
    firewood: 0.0085,
    crop_residue: 0.0071,
  },
};

// Clean fuel emission factors
const CLEAN_FUEL_FACTORS = {
  lpg: 0.00227,           // kg CO2e per kg LPG
  ethanol: 0.00139,       // kg CO2e per litre
  improved_cookstove: 0.0045, // kg CO2e per kg wood (60% efficiency gain)
  pellets: 0.0032,        // kg CO2e per kg
};

// Fraction of non-renewable biomass (fNRB) by country
const FNRB = {
  malawi: 0.93,
  kenya: 0.87,
  zambia: 0.91,
  tanzania: 0.89,
  uganda: 0.84,
  sudan: 0.88,
};

/**
 * Calculate weekly avoided emissions for a single trader
 * @param {Object} traderLog - Weekly sales log entry
 * @returns {Object} Emissions result with breakdown
 */
function calculateWeeklyAvoidedEmissions(traderLog) {
  const {
    traderId,
    country,
    region,
    displacedFuelType,
    displacedQuantityKg,
    cleanFuelType,
    cleanFuelQuantity,
    weekEnding,
  } = traderLog;

  // Validate inputs
  if (!FNRB[country]) throw new Error(`No fNRB data for country: ${country}`);
  if (!EMISSION_FACTORS[region]) throw new Error(`No emission factors for region: ${region}`);

  const fNRB = FNRB[country];
  const baselineFactor = EMISSION_FACTORS[region][displacedFuelType];
  const cleanFactor = CLEAN_FUEL_FACTORS[cleanFuelType];

  // Baseline emissions (without project activity)
  // TPDDTEC Equation 1: BE_y = FC_baseline * EF_baseline * fNRB
  const baselineEmissionsKg = displacedQuantityKg * baselineFactor * fNRB * 1000;

  // Project emissions (with clean fuel)
  // TPDDTEC Equation 2: PE_y = FC_project * EF_project
  const projectEmissionsKg = cleanFuelQuantity * cleanFactor * 1000;

  // Leakage (TPDDTEC §4.3) — conservative 5% default for micro-scale
  const leakageFraction = 0.05;
  const leakageKg = baselineEmissionsKg * leakageFraction;

  // Net avoided emissions
  // TPDDTEC Equation 3: ER_y = BE_y - PE_y - LE_y
  const avoidedEmissionsKg = baselineEmissionsKg - projectEmissionsKg - leakageKg;
  const avoidedEmissionsTonnes = Math.max(0, avoidedEmissionsKg / 1000);

  return {
    traderId,
    weekEnding,
    avoidedEmissionsTonnes,
    breakdown: {
      baselineEmissionsKg: parseFloat(baselineEmissionsKg.toFixed(4)),
      projectEmissionsKg: parseFloat(projectEmissionsKg.toFixed(4)),
      leakageKg: parseFloat(leakageKg.toFixed(4)),
      avoidedEmissionsKg: parseFloat((avoidedEmissionsKg).toFixed(4)),
    },
    methodology: 'Gold Standard TPDDTEC v3.0',
    calculatedAt: new Date().toISOString(),
  };
}

/**
 * Aggregate credits across traders until bundle threshold is met
 * @param {Array} traderCredits - Array of individual trader credit records
 * @param {number} bundleThresholdTonnes - Minimum bundle size (default 100t)
 * @returns {Object} Bundle formation result
 */
function formCreditBundle(traderCredits, bundleThresholdTonnes = 100) {
  const totalTonnes = traderCredits.reduce(
    (sum, t) => sum + t.avoidedEmissionsTonnes, 0
  );

  if (totalTonnes < bundleThresholdTonnes) {
    return {
      status: 'accumulating',
      totalTonnes: parseFloat(totalTonnes.toFixed(4)),
      remainingTonnes: parseFloat((bundleThresholdTonnes - totalTonnes).toFixed(4)),
      traderCount: traderCredits.length,
    };
  }

  return {
    status: 'ready',
    totalTonnes: parseFloat(totalTonnes.toFixed(4)),
    traderCount: traderCredits.length,
    bundleId: `SKC-${Date.now()}`,
    readyForListing: true,
    verificationRequired: true,
    estimatedMarketValue: {
      low: parseFloat((totalTonnes * 5).toFixed(2)),
      mid: parseFloat((totalTonnes * 15).toFixed(2)),
      high: parseFloat((totalTonnes * 50).toFixed(2)),
    },
  };
}

/**
 * Calculate individual trader's share of bundle revenue
 * @param {string} traderId
 * @param {Array} bundleTraders - All traders in the bundle
 * @param {number} totalRevenue - Total sale price of bundle (USD)
 * @returns {Object} Revenue allocation
 */
function calculateTraderRevenue(traderId, bundleTraders, totalRevenue) {
  const totalBundleTonnes = bundleTraders.reduce(
    (sum, t) => sum + t.avoidedEmissionsTonnes, 0
  );

  const trader = bundleTraders.find(t => t.traderId === traderId);
  if (!trader) throw new Error(`Trader ${traderId} not found in bundle`);

  const traderShare = trader.avoidedEmissionsTonnes / totalBundleTonnes;

  // Platform fee: 12% (covers verification, admin, technology)
  const platformFeeRate = 0.12;
  const traderRevenue = totalRevenue * traderShare * (1 - platformFeeRate);

  return {
    traderId,
    tonnes: parseFloat(trader.avoidedEmissionsTonnes.toFixed(4)),
    sharePercent: parseFloat((traderShare * 100).toFixed(2)),
    grossUSD: parseFloat((totalRevenue * traderShare).toFixed(2)),
    platformFeeUSD: parseFloat((totalRevenue * traderShare * platformFeeRate).toFixed(2)),
    netUSD: parseFloat(traderRevenue.toFixed(2)),
    disbursementMethod: 'mobile_money',
  };
}

module.exports = {
  calculateWeeklyAvoidedEmissions,
  formCreditBundle,
  calculateTraderRevenue,
  EMISSION_FACTORS,
  CLEAN_FUEL_FACTORS,
  FNRB,
};

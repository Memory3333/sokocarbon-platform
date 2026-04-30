/**
 * SokoCarbon USSD Gateway Handler
 * Integrates with Africa's Talking USSD API
 * Supports 2G feature phones — no smartphone or data required
 */

const express = require('express');
const router = express.Router();

// Session store (use Redis in production)
const sessions = new Map();

/**
 * Main USSD endpoint — called by Africa's Talking on each input
 * POST /ussd
 */
router.post('/', async (req, res) => {
  const { sessionId, serviceCode, phoneNumber, text } = req.body;

  let response = '';
  const input = text.split('*').pop(); // Get latest input
  const level = text === '' ? 0 : text.split('*').length;

  try {
    // Level 0: Main menu
    if (text === '') {
      sessions.set(sessionId, { phoneNumber, state: 'main_menu' });
      response = `CON Welcome to SokoCarbon 🌱
Carbon credits for clean cooking traders

1. Log this week's sales
2. Check my credits
3. Withdraw earnings
4. Register / Help`;

    // Level 1: Route by main menu choice
    } else if (level === 1) {
      const session = sessions.get(sessionId) || {};

      if (input === '1') {
        session.state = 'log_sales_fuel_type';
        sessions.set(sessionId, session);
        response = `CON What clean fuel did you sell this week?

1. LPG / Gas cylinders
2. Ethanol / bioethanol
3. Improved cookstoves
4. Wood pellets`;

      } else if (input === '2') {
        const credits = await getTraderCredits(phoneNumber);
        response = `END Your SokoCarbon Credits:

Pending: ${credits.pendingTonnes} tonnes
Verified: ${credits.verifiedTonnes} tonnes
Earnings ready: MWK ${credits.earningsMWK}

Next payout in ${credits.daysToNextBundle} days`;

      } else if (input === '3') {
        const balance = await getTraderBalance(phoneNumber);
        if (balance.availableUSD < 1) {
          response = `END No earnings to withdraw yet.

Your credits are pooling with other traders.
Check back when you have verified credits.

Dial *384# to check progress.`;
        } else {
          session.state = 'confirm_withdrawal';
          session.pendingWithdrawal = balance.availableUSD;
          sessions.set(sessionId, session);
          response = `CON Withdraw earnings

Available: $${balance.availableUSD} (MWK ${balance.availableMWK})
To: ${phoneNumber} (Airtel Money / TNM)

1. Confirm withdrawal
2. Cancel`;
        }

      } else if (input === '4') {
        response = `CON SokoCarbon Help

1. How credits work
2. Register as trader
3. Contact support`;

      } else {
        response = `END Invalid option. Dial *384# to try again.`;
      }

    // Level 2: Sub-menu handling
    } else if (level === 2) {
      const session = sessions.get(sessionId) || {};

      // Fuel type selected for sales log
      if (session.state === 'log_sales_fuel_type') {
        const fuelMap = { '1': 'lpg', '2': 'ethanol', '3': 'improved_cookstove', '4': 'pellets' };
        session.fuelType = fuelMap[input];
        session.state = 'log_sales_quantity';
        sessions.set(sessionId, session);
        response = `CON How many kg / units sold this week?

Enter number (e.g. 25 for 25kg):`;

      // Confirm withdrawal
      } else if (session.state === 'confirm_withdrawal' && input === '1') {
        await initiateWithdrawal(phoneNumber, session.pendingWithdrawal);
        response = `END Withdrawal initiated! ✓

$${session.pendingWithdrawal} sent to ${phoneNumber}
You will receive an SMS confirmation.

Thank you for growing clean cooking! 🌱`;

      } else if (session.state === 'confirm_withdrawal' && input === '2') {
        response = `END Withdrawal cancelled.
Your earnings are safe. Dial *384# anytime.`;

      // Help sub-menu
      } else if (input === '1' && text.startsWith('4')) {
        response = `END How SokoCarbon Credits Work:

1. You log clean fuel sales weekly
2. We calculate CO2 you helped avoid
3. Credits pool with other traders
4. When we reach 100 tonnes, we sell
5. You get paid by mobile money

Every kg of clean fuel = real money! 🌱`;

      } else if (input === '2' && text.startsWith('4')) {
        response = `CON Register as SokoCarbon Trader

Enter your full name:`;

      } else {
        response = `END Thank you for using SokoCarbon.
Dial *384# to start again.`;
      }

    // Level 3: Quantity entered for sales log
    } else if (level === 3) {
      const session = sessions.get(sessionId) || {};

      if (session.state === 'log_sales_quantity') {
        const quantity = parseFloat(input);
        if (isNaN(quantity) || quantity <= 0) {
          response = `END Invalid quantity. Dial *384# to try again.`;
        } else {
          // Save weekly log and calculate emissions
          const result = await saveSalesLog(phoneNumber, session.fuelType, quantity);
          sessions.delete(sessionId);
          response = `END Sales logged! ✓

${quantity}kg of clean fuel sold
CO2 avoided: ${result.avoidedKg}kg this week
Your total credits: ${result.totalTonnes} tonnes

Keep selling clean fuel — you're earning! 🌱`;
        }
      }

    } else {
      response = `END Thank you. Dial *384# to return to menu.`;
    }

  } catch (err) {
    console.error('USSD error:', err);
    response = `END An error occurred. Please try again or call support: 0800-SOKO (7656)`;
  }

  res.set('Content-Type', 'text/plain');
  res.send(response);
});

// Stub functions — replace with real DB/API calls
async function getTraderCredits(phone) {
  return { pendingTonnes: '0.023', verifiedTonnes: '0.000', earningsMWK: '0', daysToNextBundle: 47 };
}
async function getTraderBalance(phone) {
  return { availableUSD: 0, availableMWK: 0 };
}
async function saveSalesLog(phone, fuelType, quantity) {
  return { avoidedKg: (quantity * 0.0045 * 1000).toFixed(2), totalTonnes: '0.025' };
}
async function initiateWithdrawal(phone, amountUSD) {
  console.log(`Initiating withdrawal of $${amountUSD} to ${phone}`);
}

module.exports = router;

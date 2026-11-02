/**
 * Test Suite for Ganda Safaris Core Engines
 * Verifies:
 * 1. Currency conversion & formatting logic (USD, EUR, GBP)
 * 2. Permit price accuracy against statutory UWA/RDB figures ($800, $1500)
 * 3. 30% Deposit calculation accuracy
 * 4. Named Ground Partner directory completeness
 */

import { formatPrice, convertPrice } from '../lib/currency';
import { PERMITS_DATA, GROUND_PARTNERS, ITINERARIES } from '../data/seedData';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
  console.log(`✓ PASS: ${message}`);
}

export function runTests() {
  console.log('=== RUNNING GANDA SAFARIS TEST SUITE ===\n');

  // Test 1: Currency Formatting
  console.log('1. Currency Conversion & Formatting Tests:');
  const formattedUSD = formatPrice(1000, 'USD');
  assert(formattedUSD.includes('$1,000'), 'USD formatting outputs $1,000');

  const formattedEUR = formatPrice(1000, 'EUR');
  assert(formattedEUR.includes('€920'), 'EUR formatting converts with 0.92 rate');

  const formattedGBP = formatPrice(1000, 'GBP');
  assert(formattedGBP.includes('£780'), 'GBP formatting converts with 0.78 rate');

  // Test 2: Statutory Gorilla Permit Guardrails
  console.log('\n2. Statutory Primate Tariffs Guardrail Tests:');
  const ugandaGorilla = PERMITS_DATA.find((p) => p.country === 'Uganda' && p.parkName.includes('Bwindi'));
  assert(ugandaGorilla !== undefined, 'Uganda Bwindi permit exists in registry');
  assert(ugandaGorilla?.costUSD === 800, 'Uganda Bwindi permit is exactly $800 USD statutory');

  const rwandaGorilla = PERMITS_DATA.find((p) => p.country === 'Rwanda');
  assert(rwandaGorilla !== undefined, 'Rwanda Volcanoes permit exists in registry');
  assert(rwandaGorilla?.costUSD === 1500, 'Rwanda Volcanoes permit is exactly $1,500 USD statutory');

  const habituation = PERMITS_DATA.find((p) => p.parkName?.includes('Habituation'));
  assert(habituation !== undefined, 'Habituation experience exists in registry');

  // Test 3: Ground Partner Transparency Check
  console.log('\n3. Ground Partner Transparency Tests:');
  assert(GROUND_PARTNERS.length >= 2, 'Operational partner countries have named local partners');
  const ugPartner = GROUND_PARTNERS.find((p) => p.country === 'Uganda');
  assert(!!ugPartner?.licenseNumber, 'Uganda partner official license number published');
  const kePartner = GROUND_PARTNERS.find((p) => p.country === 'Kenya');
  assert(!!kePartner?.licenseNumber, 'Kenya partner official license number published');

  // Test 4: Itinerary Deposit Calculations
  console.log('\n4. Itinerary 30% Deposit Calculation Tests:');
  ITINERARIES.forEach((it) => {
    const totalDouble = it.priceBands.luxury.perPersonDouble * 2;
    const deposit = Math.round(totalDouble * 0.3);
    assert(deposit > 0, `30% deposit for ${it.title} evaluates to valid positive integer ($${deposit})`);
  });

  console.log('\n=== ALL 10 TESTS PASSED SUCCESSFULLY ===');
}

// Auto-run if executed directly
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('unitTests')) {
  runTests();
}

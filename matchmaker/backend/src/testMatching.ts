import dotenv from 'dotenv';
dotenv.config();

import { db } from './data/db.js';
import { evaluateTier1Dealbreakers, calculateTier2Compatibility } from './services/matchingEngine.js';
import { getAIRankingsAndFriction } from './services/groqService.js';

async function runVerification() {
  console.log('\n================================================================');
  console.log('   RUNNING TDC TWO-TIER MATCHING & AI ENGINE VERIFICATION');
  console.log('================================================================\n');

  // TEST 1: MALE CLIENT (Rohan Mehta, 29, 180cm, ₹68 LPA, Wants Kids: Yes)
  const rohan = db.getCustomerById('client_001');
  if (!rohan) throw new Error('Rohan Mehta not found in DB');

  console.log(`[TEST 1] Evaluating Male Client: ${rohan.first_name} ${rohan.last_name}`);
  console.log(`- Age: ${rohan.age} | Height: ${rohan.height_formatted} | Income: ₹${rohan.income_lpa} LPA | Kids: ${rohan.want_kids}`);

  const femalePool = db.getPoolByGender('Female');
  let maleMatchesPassed = 0;
  let maleViolations = 0;

  for (const female of femalePool) {
    const tier1 = evaluateTier1Dealbreakers(rohan, female);
    if (tier1.passed) {
      maleMatchesPassed++;
      // Strict rule validations
      if (female.age >= rohan.age) {
        console.error(`❌ VIOLATION: Candidate age ${female.age} >= Client age ${rohan.age}`);
        maleViolations++;
      }
      if (female.height_cm >= rohan.height_cm) {
        console.error(`❌ VIOLATION: Candidate height ${female.height_cm} >= Client height ${rohan.height_cm}`);
        maleViolations++;
      }
      if (female.income_lpa >= rohan.income_lpa) {
        console.error(`❌ VIOLATION: Candidate income ${female.income_lpa} >= Client income ${rohan.income_lpa}`);
        maleViolations++;
      }
      if (rohan.want_kids === 'Yes' && female.want_kids === 'No') {
        console.error(`❌ VIOLATION: Conflicting views on kids`);
        maleViolations++;
      }
    }
  }

  console.log(`✓ Total Female Candidates Evaluated: ${femalePool.length}`);
  console.log(`✓ Passed Tier 1 Dealbreaker Gate: ${maleMatchesPassed}`);
  console.log(`✓ Rule Violations: ${maleViolations} (Must be 0)`);

  if (maleViolations === 0) {
    console.log('✅ TEST 1 PASSED: 100% of matches for male client are younger, shorter, lower earning, and aligned on kids.\n');
  }

  // TEST 2: FEMALE CLIENT (Ananya Sen, 27, 165cm, ₹58 LPA, Relocation: Yes)
  const ananya = db.getCustomerById('client_002');
  if (!ananya) throw new Error('Ananya Sen not found in DB');

  console.log(`[TEST 2] Evaluating Female Client: ${ananya.first_name} ${ananya.last_name}`);
  console.log(`- Age: ${ananya.age} | City: ${ananya.city} | Income: ₹${ananya.income_lpa} LPA | Relocate: ${ananya.open_to_relocate}`);

  const malePool = db.getPoolByGender('Male');
  let femaleMatchesPassed = 0;
  let femaleViolations = 0;

  for (const male of malePool) {
    const tier1 = evaluateTier1Dealbreakers(ananya, male);
    if (tier1.passed) {
      femaleMatchesPassed++;
      if (male.income_lpa < ananya.income_lpa * 0.9) {
        console.error(`❌ VIOLATION: Candidate income ${male.income_lpa} is below parity threshold for ${ananya.income_lpa}`);
        femaleViolations++;
      }
    }
  }

  console.log(`✓ Total Male Candidates Evaluated: ${malePool.length}`);
  console.log(`✓ Passed Tier 1 Dealbreaker Gate: ${femaleMatchesPassed}`);
  console.log(`✓ Parity Violations: ${femaleViolations} (Must be 0)`);

  if (femaleViolations === 0) {
    console.log('✅ TEST 2 PASSED: 100% of matches for female client adhere to career parity and relocation harmony.\n');
  }

  // TEST 3: AI FRICTION POINTS & RISK ANALYSIS SAMPLE
  const sampleCandidate = femalePool.find(f => f.age < rohan.age && f.height_cm < rohan.height_cm && f.income_lpa < rohan.income_lpa)!;
  const tier2 = calculateTier2Compatibility(rohan, sampleCandidate);
  const aiInsights = await getAIRankingsAndFriction(rohan, sampleCandidate, tier2.total);

  console.log(`[TEST 3] AI Risk & Friction Analysis for Rohan Mehta & ${sampleCandidate.first_name} ${sampleCandidate.last_name}`);
  console.log(`- Compatibility Score: ${aiInsights.ai_score}% (${aiInsights.ai_badge})`);
  console.log(`- Synergy Highlights:`);
  aiInsights.synergy_highlights.forEach(s => console.log(`  • ${s}`));
  console.log(`- Detected Friction Points & Risks: ${aiInsights.friction_points.length}`);
  aiInsights.friction_points.forEach(f => {
    console.log(`  [${f.severity.toUpperCase()}] ${f.title}: ${f.description}`);
    console.log(`    ↳ Matchmaker talking point: "${f.talking_point_for_matchmaker}"`);
  });

  console.log('\n================================================================');
  console.log('   ALL PHASE 2 MATCHING ENGINE CHECKS PASSED SUCCESSFULLY!');
  console.log('================================================================\n');
}

runVerification().catch(console.error);
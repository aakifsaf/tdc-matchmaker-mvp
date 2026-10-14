"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const db_js_1 = require("./data/db.js");
const matchingEngine_js_1 = require("./services/matchingEngine.js");
const groqService_js_1 = require("./services/groqService.js");
let passedTests = 0;
let failedTests = 0;
function assert(condition, message) {
    if (condition) {
        console.log(`  ✅ PASS: ${message}`);
        passedTests++;
    }
    else {
        console.error(`  ❌ FAIL: ${message}`);
        failedTests++;
    }
}
async function runTestSuite() {
    console.log('\n================================================================');
    console.log('       TDC MATCHMAKER ENGINE: AUTOMATED TEST SUITE');
    console.log('================================================================\n');
    // -------------------------------------------------------------
    // SUITE 1: TIER 1 MALE HARD DEALBREAKERS
    // (Candidate strictly younger, strictly shorter, lower earning, kids aligned)
    // -------------------------------------------------------------
    console.log('[SUITE 1] Validating Male Client Tier 1 Hard Dealbreakers');
    const maleClient = db_js_1.db.getCustomerById('client_001'); // Rohan Mehta (29y, 180cm, ₹68 LPA, Kids: Yes)
    if (!maleClient)
        throw new Error('Client 001 not found');
    const femalePool = db_js_1.db.getPoolByGender('Female');
    assert(femalePool.length >= 100, `Female candidate pool has ${femalePool.length} profiles (>= 100 required)`);
    let maleTier1PassCount = 0;
    let maleAgeViolations = 0;
    let maleHeightViolations = 0;
    let maleIncomeViolations = 0;
    let maleKidsViolations = 0;
    for (const candidate of femalePool) {
        const res = (0, matchingEngine_js_1.evaluateTier1Dealbreakers)(maleClient, candidate);
        if (res.passed) {
            maleTier1PassCount++;
            if (candidate.age >= maleClient.age)
                maleAgeViolations++;
            if (candidate.height_cm >= maleClient.height_cm)
                maleHeightViolations++;
            if (candidate.income_lpa >= maleClient.income_lpa)
                maleIncomeViolations++;
            if (maleClient.want_kids === 'Yes' && candidate.want_kids === 'No')
                maleKidsViolations++;
        }
    }
    assert(maleTier1PassCount > 0, `At least 1 candidate passed male dealbreakers (${maleTier1PassCount} passed)`);
    assert(maleAgeViolations === 0, `0 candidates older than or equal in age to male client`);
    assert(maleHeightViolations === 0, `0 candidates taller than or equal in height to male client`);
    assert(maleIncomeViolations === 0, `0 candidates earning higher than or equal to male client`);
    assert(maleKidsViolations === 0, `0 candidates with conflicting views on children`);
    // -------------------------------------------------------------
    // SUITE 2: TIER 1 FEMALE HARD DEALBREAKERS
    // (Career parity threshold >= 90% of income, relocation harmony)
    // -------------------------------------------------------------
    console.log('\n[SUITE 2] Validating Female Client Tier 1 Hard Dealbreakers');
    const femaleClient = db_js_1.db.getCustomerById('client_002'); // Ananya Sen (27y, ₹58 LPA, Relocate: Yes)
    if (!femaleClient)
        throw new Error('Client 002 not found');
    const malePool = db_js_1.db.getPoolByGender('Male');
    assert(malePool.length >= 100, `Male candidate pool has ${malePool.length} profiles (>= 100 required)`);
    let femaleTier1PassCount = 0;
    let femaleParityViolations = 0;
    for (const candidate of malePool) {
        const res = (0, matchingEngine_js_1.evaluateTier1Dealbreakers)(femaleClient, candidate);
        if (res.passed) {
            femaleTier1PassCount++;
            // Candidate must earn at least 90% of female client's income
            if (candidate.income_lpa < femaleClient.income_lpa * 0.9) {
                femaleParityViolations++;
            }
        }
    }
    assert(femaleTier1PassCount > 0, `At least 1 candidate passed female dealbreakers (${femaleTier1PassCount} passed)`);
    assert(femaleParityViolations === 0, `0 candidates earning below 90% income threshold for female client`);
    // -------------------------------------------------------------
    // SUITE 3: TIER 2 WEIGHTED COMPATIBILITY MATRIX
    // -------------------------------------------------------------
    console.log('\n[SUITE 3] Validating Tier 2 Weighted Scoring Engine');
    const sampleCandidate = femalePool[0];
    const tier2 = (0, matchingEngine_js_1.calculateTier2Compatibility)(maleClient, sampleCandidate);
    assert(typeof tier2.total === 'number', 'Tier 2 returns numeric total score');
    assert(tier2.total >= 0 && tier2.total <= 100, `Total score is within [0, 100]: ${tier2.total}`);
    assert(tier2.pedigree_and_career <= 25, `Pedigree score <= 25 (${tier2.pedigree_and_career})`);
    assert(tier2.lifestyle_and_habits <= 25, `Lifestyle score <= 25 (${tier2.lifestyle_and_habits})`);
    assert(tier2.cultural_and_family <= 25, `Cultural score <= 25 (${tier2.cultural_and_family})`);
    assert(tier2.relocation_and_geography <= 15, `Relocation score <= 15 (${tier2.relocation_and_geography})`);
    assert(tier2.delta_optimum <= 10, `Delta optimum <= 10 (${tier2.delta_optimum})`);
    // -------------------------------------------------------------
    // SUITE 4: GROQ AI RISK & FRICTION ANALYSIS
    // -------------------------------------------------------------
    console.log('\n[SUITE 4] Validating Groq AI Friction Points & Synergies');
    const validCandidate = femalePool.find(f => f.age < maleClient.age && f.height_cm < maleClient.height_cm && f.income_lpa < maleClient.income_lpa);
    const aiResult = await (0, groqService_js_1.getAIRankingsAndFriction)(maleClient, validCandidate, 85);
    assert(typeof aiResult.ai_score === 'number' && aiResult.ai_score >= 50 && aiResult.ai_score <= 100, `AI score is between 50-100: ${aiResult.ai_score}`);
    assert(typeof aiResult.ai_badge === 'string' && aiResult.ai_badge.length > 0, `AI badge generated: "${aiResult.ai_badge}"`);
    assert(Array.isArray(aiResult.synergy_highlights) && aiResult.synergy_highlights.length > 0, `Synergy highlights present (${aiResult.synergy_highlights.length} items)`);
    assert(Array.isArray(aiResult.friction_points), `Friction points array present (${aiResult.friction_points.length} points)`);
    if (aiResult.friction_points.length > 0) {
        const fp = aiResult.friction_points[0];
        assert(typeof fp.talking_point_for_matchmaker === 'string' && fp.talking_point_for_matchmaker.length > 0, 'Friction point includes matchmaker talking point');
    }
    // -------------------------------------------------------------
    // SUITE 5: AI PROMPT RE-RANKING (COPILOT STEERING)
    // -------------------------------------------------------------
    console.log('\n[SUITE 5] Validating AI Copilot Prompt Re-ranking');
    const topThree = femalePool.slice(0, 3);
    const prompt = 'Strict vegetarian lifestyle with preference for product/tech startup founders';
    const reranked = await (0, groqService_js_1.rerankMatchesWithPrompt)(maleClient, topThree, prompt);
    assert(Array.isArray(reranked) && reranked.length === 3, 'Prompt reranking returns result for all candidates');
    assert(reranked.every(r => typeof r.reranked_score === 'number'), 'All reranked candidates receive numeric score');
    assert(reranked.every(r => typeof r.custom_badge === 'string'), 'All reranked candidates receive custom badges');
    // -------------------------------------------------------------
    // FINAL SUMMARY
    // -------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`   TEST RESULTS: ${passedTests} PASSED | ${failedTests} FAILED`);
    console.log('================================================================\n');
    if (failedTests > 0) {
        process.exit(1);
    }
}
runTestSuite().catch(err => {
    console.error('Fatal test error:', err);
    process.exit(1);
});

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateTier1Dealbreakers = evaluateTier1Dealbreakers;
exports.calculateTier2Compatibility = calculateTier2Compatibility;
/**
 * TIER 1: HARD DEALBREAKER GATEWAYS (Pass / Fail)
 * Implements strict gender-specific requirements from the Assessment and Research specs.
 */
function evaluateTier1Dealbreakers(client, candidate) {
    const reasons = [];
    // Gender check: Candidate must be of the opposite gender
    if (client.gender === candidate.gender) {
        reasons.push('Candidate must be of the opposite gender');
        return { passed: false, reasons };
    }
    // -------------------------------------------------------------
    // MALE CLIENT RULES (Filtering Female Candidates)
    // -------------------------------------------------------------
    if (client.gender === 'Male') {
        // 1. Age Rule: Female must be strictly younger
        if (candidate.age >= client.age) {
            reasons.push(`Female candidate (${candidate.age} yrs) must be strictly younger than client (${client.age} yrs)`);
        }
        // 2. Income Rule: Female must earn strictly less
        if (candidate.income_lpa >= client.income_lpa) {
            reasons.push(`Female candidate (₹${candidate.income_lpa} LPA) must earn strictly less than client (₹${client.income_lpa} LPA)`);
        }
        // 3. Height Rule: Female must be strictly shorter
        if (candidate.height_cm >= client.height_cm) {
            reasons.push(`Female candidate (${candidate.height_formatted}) must be strictly shorter than client (${client.height_formatted})`);
        }
        // 4. Kids Outlook: Must have matching views on "Want Kids"
        if (client.want_kids === 'Yes' && candidate.want_kids === 'No') {
            reasons.push('Conflicting outlook on children: Client wants kids, candidate does not');
        }
        else if (client.want_kids === 'No' && candidate.want_kids === 'Yes') {
            reasons.push('Conflicting outlook on children: Client does not want kids, candidate wants kids');
        }
    }
    // -------------------------------------------------------------
    // FEMALE CLIENT RULES (Filtering Male Candidates)
    // -------------------------------------------------------------
    if (client.gender === 'Female') {
        // 1. Profession & Income Parity: Male must earn equal or higher (within 10% threshold for high-growth trajectory)
        if (candidate.income_lpa < client.income_lpa * 0.9) {
            reasons.push(`Male candidate income (₹${candidate.income_lpa} LPA) falls below parity threshold for client (₹${client.income_lpa} LPA)`);
        }
        // 2. Relocation Harmony:
        // If the female client is NOT open to relocate ('No'), the male must either be in the same city or be open to relocate ('Yes')
        if (client.open_to_relocate === 'No' && candidate.city !== client.city && candidate.open_to_relocate === 'No') {
            reasons.push(`Relocation conflict: Client will not relocate from ${client.city}, and candidate in ${candidate.city} is not open to relocate`);
        }
        // 3. Kids Outlook dealbreaker alignment
        if (client.want_kids === 'Yes' && candidate.want_kids === 'No') {
            reasons.push('Conflicting outlook on children: Client wants kids, candidate does not');
        }
        else if (client.want_kids === 'No' && candidate.want_kids === 'Yes') {
            reasons.push('Conflicting outlook on children: Client does not want kids, candidate wants kids');
        }
    }
    return {
        passed: reasons.length === 0,
        reasons
    };
}
/**
 * TIER 2: WEIGHTED SOFT COMPATIBILITY MATRIX (0 - 100 Score)
 * Evaluates candidate across 5 cultural and lifestyle dimensions.
 */
function calculateTier2Compatibility(client, candidate) {
    // 1. Pedigree & Career Synergy (Max 25 pts)
    let pedigreeScore = 0;
    const tier1Colleges = ['IIT', 'BITS', 'IIM', 'SRCC', 'St. Stephen', 'LSR', 'NLSIU', 'NID', 'NIFT'];
    const clientHasTier1 = tier1Colleges.some(c => client.ug_college.includes(c));
    const candidateHasTier1 = tier1Colleges.some(c => candidate.ug_college.includes(c));
    if (clientHasTier1 && candidateHasTier1) {
        pedigreeScore += 13; // Mutual elite academic background
    }
    else if (clientHasTier1 || candidateHasTier1) {
        pedigreeScore += 9;
    }
    else {
        pedigreeScore += 7;
    }
    // Career synergy (Tech + Product/Finance/Design/Consulting)
    const isCorporateSenior = candidate.income_lpa >= 35;
    pedigreeScore += isCorporateSenior ? 12 : 8;
    pedigreeScore = Math.min(25, pedigreeScore);
    // 2. Lifestyle & Habits Harmony (Max 25 pts)
    let lifestyleScore = 0;
    // Diet alignment
    if (client.diet === candidate.diet) {
        lifestyleScore += 10;
    }
    else if ((client.diet === 'Vegetarian' && candidate.diet === 'Eggetarian') ||
        (client.diet === 'Eggetarian' && candidate.diet === 'Vegetarian')) {
        lifestyleScore += 7;
    }
    else if (client.diet === 'Jain' && candidate.diet !== 'Jain') {
        lifestyleScore += 2; // Strict Jain dietary friction penalty
    }
    else {
        lifestyleScore += 4;
    }
    // Habits (Smoking / Drinking)
    if (client.smoking === candidate.smoking)
        lifestyleScore += 5;
    else if (client.smoking === 'Non-Smoker' && candidate.smoking === 'Occasionally')
        lifestyleScore += 2;
    if (client.drinking === candidate.drinking)
        lifestyleScore += 5;
    else
        lifestyleScore += 3;
    // Pets compatibility
    if (client.open_to_pets === candidate.open_to_pets)
        lifestyleScore += 5;
    else if (client.open_to_pets === 'Yes' && candidate.open_to_pets === 'No')
        lifestyleScore += 1;
    else
        lifestyleScore += 3;
    lifestyleScore = Math.min(25, lifestyleScore);
    // 3. Cultural & Family Harmony (Max 25 pts)
    let culturalScore = 0;
    // Religion
    if (client.religion === candidate.religion)
        culturalScore += 8;
    else
        culturalScore += 2;
    // Caste / Community
    if (client.caste === candidate.caste)
        culturalScore += 6;
    else
        culturalScore += 4; // Moderate penalty, modern Indian profiles remain open
    // Mother Tongue
    if (client.mother_tongue === candidate.mother_tongue)
        culturalScore += 6;
    else {
        const sharedLang = client.languages_known.some(l => candidate.languages_known.includes(l));
        culturalScore += sharedLang ? 4 : 2;
    }
    // Manglik compatibility
    if (client.manglik_status === "Doesn't Matter" ||
        candidate.manglik_status === "Doesn't Matter" ||
        client.manglik_status === candidate.manglik_status) {
        culturalScore += 5;
    }
    else {
        culturalScore += 1;
    }
    culturalScore = Math.min(25, culturalScore);
    // 4. Relocation & Geography (Max 15 pts)
    let geoScore = 0;
    if (client.city === candidate.city) {
        geoScore = 15; // Same city is ideal
    }
    else if (candidate.open_to_relocate === 'Yes' || client.open_to_relocate === 'Yes') {
        geoScore = 11;
    }
    else if (candidate.open_to_relocate === 'Maybe' || client.open_to_relocate === 'Maybe') {
        geoScore = 7;
    }
    else {
        geoScore = 3;
    }
    // 5. Age & Height Delta Optimum (Max 10 pts)
    let deltaScore = 0;
    const ageDelta = Math.abs(client.age - candidate.age);
    if (ageDelta >= 1 && ageDelta <= 4)
        deltaScore += 5; // Cultural sweet spot
    else if (ageDelta <= 6)
        deltaScore += 3;
    else
        deltaScore += 2;
    const heightDelta = Math.abs(client.height_cm - candidate.height_cm);
    if (heightDelta >= 5 && heightDelta <= 18)
        deltaScore += 5;
    else
        deltaScore += 3;
    const total = pedigreeScore + lifestyleScore + culturalScore + geoScore + deltaScore;
    return {
        pedigree_and_career: pedigreeScore,
        lifestyle_and_habits: lifestyleScore,
        cultural_and_family: culturalScore,
        relocation_and_geography: geoScore,
        delta_optimum: deltaScore,
        total: Math.min(100, Math.max(0, total))
    };
}

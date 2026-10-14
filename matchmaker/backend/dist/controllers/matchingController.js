"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMatchesForClient = generateMatchesForClient;
exports.createEmailDraft = createEmailDraft;
exports.dispatchMatchToClient = dispatchMatchToClient;
exports.rerankMatches = rerankMatches;
exports.updateMatchFeedback = updateMatchFeedback;
const db_js_1 = require("../data/db.js");
const matchingEngine_js_1 = require("../services/matchingEngine.js");
const groqService_js_1 = require("../services/groqService.js");
async function generateMatchesForClient(req, res) {
    const id = req.params.id;
    const client = db_js_1.db.getCustomerById(id);
    if (!client) {
        return res.status(404).json({ error: `Client with ID ${id} not found` });
    }
    // 1. Fetch opposite gender pool
    const oppositeGender = client.gender === 'Male' ? 'Female' : 'Male';
    const pool = db_js_1.db.getPoolByGender(oppositeGender);
    // 2. Run Tier 1 Hard Dealbreaker Gateways
    const evaluatedCandidates = [];
    for (const candidate of pool) {
        const tier1 = (0, matchingEngine_js_1.evaluateTier1Dealbreakers)(client, candidate);
        const tier2 = (0, matchingEngine_js_1.calculateTier2Compatibility)(client, candidate);
        evaluatedCandidates.push({
            candidate,
            passedTier1: tier1.passed,
            reasons: tier1.reasons,
            tier2Score: tier2
        });
    }
    // Filter to candidates that passed Tier 1
    const passedCandidates = evaluatedCandidates
        .filter(item => item.passedTier1)
        .sort((a, b) => b.tier2Score.total - a.tier2Score.total);
    // Take top 12 matches for AI enhancement and friction analysis
    const topSlice = passedCandidates.slice(0, 12);
    const enrichedMatches = [];
    for (const item of topSlice) {
        const aiResult = await (0, groqService_js_1.getAIRankingsAndFriction)(client, item.candidate, item.tier2Score.total);
        enrichedMatches.push({
            candidate: item.candidate,
            passed_tier1: true,
            tier1_reasons: [],
            tier2_breakdown: item.tier2Score,
            ai_score: aiResult.ai_score,
            ai_badge: aiResult.ai_badge,
            synergy_highlights: aiResult.synergy_highlights,
            friction_points: aiResult.friction_points,
            icebreakers: aiResult.icebreakers
        });
    }
    // Sort final matches by AI score descending
    enrichedMatches.sort((a, b) => b.ai_score - a.ai_score);
    return res.json({
        client_id: client.id,
        client_name: `${client.first_name} ${client.last_name}`,
        client_gender: client.gender,
        total_pool_evaluated: pool.length,
        passed_tier1_count: passedCandidates.length,
        matches: enrichedMatches
    });
}
async function createEmailDraft(req, res) {
    const { client_id, match_id } = req.body;
    if (!client_id || !match_id) {
        return res.status(400).json({ error: 'client_id and match_id are required' });
    }
    const client = db_js_1.db.getCustomerById(client_id);
    const match = db_js_1.db.getCustomerById(match_id);
    if (!client || !match) {
        return res.status(404).json({ error: 'Client or Match profile not found' });
    }
    const emailDraft = await (0, groqService_js_1.draftIntroEmail)(client, match);
    return res.json({
        client_id,
        match_id,
        match_name: `${match.first_name} ${match.last_name}`,
        ...emailDraft
    });
}
function dispatchMatchToClient(req, res) {
    const { client_id, match_id, email_subject, email_body, score } = req.body;
    if (!client_id || !match_id || !email_subject || !email_body) {
        return res.status(400).json({ error: 'Missing required fields for match dispatch' });
    }
    const client = db_js_1.db.getCustomerById(client_id);
    const match = db_js_1.db.getCustomerById(match_id);
    if (!client || !match) {
        return res.status(404).json({ error: 'Client or Match profile not found' });
    }
    const dispatched = db_js_1.db.addDispatchedMatch(client_id, match_id, `${match.first_name} ${match.last_name}`, score || 90, email_subject, email_body);
    return res.status(201).json({
        message: 'Match introduction email dispatched successfully',
        dispatched
    });
}
async function rerankMatches(req, res) {
    const { client_id, prompt, candidate_ids } = req.body;
    if (!client_id || !prompt) {
        return res.status(400).json({ error: 'client_id and prompt are required' });
    }
    const client = db_js_1.db.getCustomerById(client_id);
    if (!client) {
        return res.status(404).json({ error: 'Client not found' });
    }
    // Fetch candidate objects
    let candidates = [];
    if (Array.isArray(candidate_ids) && candidate_ids.length > 0) {
        candidates = candidate_ids
            .map(id => db_js_1.db.getCustomerById(id))
            .filter((c) => c !== undefined);
    }
    // If candidate_ids was not provided, fetch opposite gender pool
    if (candidates.length === 0) {
        const oppositeGender = client.gender === 'Male' ? 'Female' : 'Male';
        candidates = db_js_1.db.getPoolByGender(oppositeGender).slice(0, 12);
    }
    try {
        const rerankedInsights = await (0, groqService_js_1.rerankMatchesWithPrompt)(client, candidates, prompt);
        return res.json({
            client_id,
            prompt,
            results: rerankedInsights
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message || 'Failed to re-rank matches' });
    }
}
async function updateMatchFeedback(req, res) {
    const id = req.params.id;
    const { status, feedback_notes } = req.body;
    if (!id || !status) {
        return res.status(400).json({ error: 'Dispatch ID and status are required' });
    }
    const updated = db_js_1.db.updateDispatchedMatchFeedback(id, status, feedback_notes);
    if (!updated) {
        return res.status(404).json({ error: 'Dispatched match not found' });
    }
    return res.json({
        message: 'Match feedback updated successfully',
        dispatched: updated
    });
}

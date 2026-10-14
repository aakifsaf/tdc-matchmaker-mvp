"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.getCurrentUser = getCurrentUser;
const db_js_1 = require("../data/db.js");
function login(req, res) {
    const { email, password } = req.body;
    // Standard demo credentials or any @thedatecrew.com matchmaker login
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    // Predefined Senior Matchmaker Priya Sharma
    const matchmakers = db_js_1.db.getMatchmakers();
    const matchmaker = matchmakers.find(m => m.email.toLowerCase() === email.toLowerCase()) || matchmakers[0];
    // In demo mode, accept 'tdc2026' or 'password' or allow demo login
    if (password === 'tdc2026' || password === 'password' || email.includes('demo')) {
        return res.json({
            token: `tdc_jwt_token_${matchmaker.id}_${Date.now()}`,
            matchmaker: {
                id: matchmaker.id,
                name: matchmaker.name,
                email: matchmaker.email,
                role: matchmaker.role,
                avatar_url: matchmaker.avatar_url,
                assigned_client_count: db_js_1.db.getAssignedCustomers(matchmaker.id).length
            }
        });
    }
    return res.status(401).json({
        error: 'Invalid credentials. Use demo credentials: priya.sharma@thedatecrew.com / tdc2026'
    });
}
function getCurrentUser(req, res) {
    const matchmaker = db_js_1.db.getMatchmakerById('mm_priya') || db_js_1.db.getMatchmakers()[0];
    return res.json({
        matchmaker: {
            id: matchmaker.id,
            name: matchmaker.name,
            email: matchmaker.email,
            role: matchmaker.role,
            avatar_url: matchmaker.avatar_url,
            assigned_client_count: db_js_1.db.getAssignedCustomers(matchmaker.id).length
        }
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_js_1 = require("../controllers/authController.js");
const customerController_js_1 = require("../controllers/customerController.js");
const matchingController_js_1 = require("../controllers/matchingController.js");
const router = (0, express_1.Router)();
// Health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'TDC Matchmaker API',
        timestamp: new Date().toISOString()
    });
});
// Auth
router.post('/auth/login', authController_js_1.login);
router.get('/auth/me', authController_js_1.getCurrentUser);
// Dashboard & Customers
router.get('/stats', customerController_js_1.getDashboardStats);
router.get('/customers', customerController_js_1.getCustomers);
router.get('/customers/:id', customerController_js_1.getCustomerById);
router.post('/customers/:id/status', customerController_js_1.updateCustomerStatus);
// Notes
router.get('/customers/:id/notes', customerController_js_1.getCustomerNotes);
router.post('/customers/:id/notes', customerController_js_1.addCustomerNote);
// Dispatches
router.get('/customers/:id/dispatches', customerController_js_1.getCustomerDispatches);
router.put('/matches/dispatch/:id/feedback', matchingController_js_1.updateMatchFeedback);
// Matching Engine & AI Endpoints
router.post('/matches/generate/:id', matchingController_js_1.generateMatchesForClient);
router.post('/matches/draft-email', matchingController_js_1.createEmailDraft);
router.post('/matches/dispatch', matchingController_js_1.dispatchMatchToClient);
router.post('/matches/rerank', matchingController_js_1.rerankMatches);
exports.default = router;

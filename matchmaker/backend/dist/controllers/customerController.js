"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomers = getCustomers;
exports.getCustomerById = getCustomerById;
exports.updateCustomerStatus = updateCustomerStatus;
exports.getCustomerNotes = getCustomerNotes;
exports.addCustomerNote = addCustomerNote;
exports.getCustomerDispatches = getCustomerDispatches;
exports.getDashboardStats = getDashboardStats;
const db_js_1 = require("../data/db.js");
function getCustomers(req, res) {
    const status = req.query.status;
    const search = req.query.search;
    const matchmakerId = req.query.matchmaker_id || 'mm_priya';
    const customers = db_js_1.db.getAssignedCustomers(matchmakerId, status, search);
    return res.json({
        count: customers.length,
        customers
    });
}
function getCustomerById(req, res) {
    const id = req.params.id;
    const customer = db_js_1.db.getCustomerById(id);
    if (!customer) {
        return res.status(404).json({ error: `Customer with ID ${id} not found` });
    }
    const notes = db_js_1.db.getNotesByCustomerId(id);
    const dispatches = db_js_1.db.getDispatchedMatches(id);
    return res.json({
        customer,
        notes,
        dispatches
    });
}
function updateCustomerStatus(req, res) {
    const id = req.params.id;
    const { status_tag } = req.body;
    if (!status_tag) {
        return res.status(400).json({ error: 'status_tag is required' });
    }
    const validStatuses = ['New', 'Interviewing', 'Active Matching', 'Matches Sent', 'Matched'];
    if (!validStatuses.includes(status_tag)) {
        return res.status(400).json({ error: `Invalid status_tag. Must be one of: ${validStatuses.join(', ')}` });
    }
    const updated = db_js_1.db.updateCustomerStatus(id, status_tag);
    if (!updated) {
        return res.status(404).json({ error: `Customer with ID ${id} not found` });
    }
    return res.json({
        message: 'Status updated successfully',
        customer: updated
    });
}
function getCustomerNotes(req, res) {
    const id = req.params.id;
    const notes = db_js_1.db.getNotesByCustomerId(id);
    return res.json({ notes });
}
function addCustomerNote(req, res) {
    const id = req.params.id;
    const { note_text, category } = req.body;
    if (!note_text || !note_text.trim()) {
        return res.status(400).json({ error: 'note_text is required' });
    }
    const customer = db_js_1.db.getCustomerById(id);
    if (!customer) {
        return res.status(404).json({ error: `Customer with ID ${id} not found` });
    }
    const note = db_js_1.db.addNote(id, note_text.trim(), category || 'Call');
    return res.status(201).json({
        message: 'Note logged successfully',
        note
    });
}
function getCustomerDispatches(req, res) {
    const id = req.params.id;
    const dispatches = db_js_1.db.getDispatchedMatches(id);
    return res.json({ dispatches });
}
function getDashboardStats(req, res) {
    const matchmakerId = req.query.matchmaker_id || 'mm_priya';
    const allAssigned = db_js_1.db.getAssignedCustomers(matchmakerId);
    const stats = {
        totalClients: allAssigned.length,
        newOnboarding: allAssigned.filter(c => c.status_tag === 'New').length,
        interviewing: allAssigned.filter(c => c.status_tag === 'Interviewing').length,
        activeMatching: allAssigned.filter(c => c.status_tag === 'Active Matching').length,
        matchesSent: allAssigned.filter(c => c.status_tag === 'Matches Sent').length,
        matched: allAssigned.filter(c => c.status_tag === 'Matched').length
    };
    return res.json({ stats });
}

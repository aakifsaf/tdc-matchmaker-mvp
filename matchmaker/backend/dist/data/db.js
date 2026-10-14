"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const seedProfiles_js_1 = require("./seedProfiles.js");
const dbFilePath = path_1.default.resolve(__dirname, 'database.json');
class DatabaseStore {
    data;
    constructor() {
        this.data = this.loadData();
    }
    loadData() {
        try {
            if (fs_1.default.existsSync(dbFilePath)) {
                const raw = fs_1.default.readFileSync(dbFilePath, 'utf-8');
                return JSON.parse(raw);
            }
        }
        catch (err) {
            console.warn('Could not read existing database.json, generating fresh seed...', err);
        }
        const fresh = (0, seedProfiles_js_1.generateProfiles)();
        this.saveData(fresh);
        return fresh;
    }
    saveData(dataToSave) {
        try {
            const dir = path_1.default.dirname(dbFilePath);
            if (!fs_1.default.existsSync(dir)) {
                fs_1.default.mkdirSync(dir, { recursive: true });
            }
            fs_1.default.writeFileSync(dbFilePath, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
        }
        catch (err) {
            console.error('Failed to save database.json', err);
        }
    }
    // Matchmakers
    getMatchmakers() {
        return this.data.matchmakers;
    }
    getMatchmakerById(id) {
        return this.data.matchmakers.find(m => m.id === id);
    }
    // Customers
    getAssignedCustomers(matchmakerId = 'mm_priya', statusFilter, search) {
        let clients = this.data.customers.filter(c => c.assigned_matchmaker_id === matchmakerId);
        if (statusFilter && statusFilter !== 'All') {
            clients = clients.filter(c => c.status_tag === statusFilter);
        }
        if (search && search.trim()) {
            const q = search.trim().toLowerCase();
            clients = clients.filter(c => c.first_name.toLowerCase().includes(q) ||
                c.last_name.toLowerCase().includes(q) ||
                c.city.toLowerCase().includes(q) ||
                c.current_company.toLowerCase().includes(q) ||
                c.marital_status.toLowerCase().includes(q));
        }
        return clients;
    }
    getCustomerById(id) {
        return this.data.customers.find(c => c.id === id);
    }
    updateCustomerStatus(id, newStatus) {
        const customer = this.data.customers.find(c => c.id === id);
        if (customer) {
            customer.status_tag = newStatus;
            this.saveData();
        }
        return customer;
    }
    // Pool
    getPoolByGender(gender) {
        return this.data.customers.filter(c => c.gender === gender);
    }
    // Notes
    getNotesByCustomerId(customerId) {
        return this.data.notes
            .filter(n => n.customer_id === customerId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    addNote(customerId, noteText, category = 'Call') {
        const newNote = {
            id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            customer_id: customerId,
            matchmaker_id: 'mm_priya',
            matchmaker_name: 'Priya Sharma',
            note_text: noteText,
            category,
            created_at: new Date().toISOString()
        };
        this.data.notes.unshift(newNote);
        this.saveData();
        return newNote;
    }
    // Dispatched Matches
    getDispatchedMatches(clientId) {
        return this.data.dispatchedMatches
            .filter(m => m.client_id === clientId)
            .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
    }
    addDispatchedMatch(clientId, matchId, matchName, score, emailSubject, emailBody) {
        const newDispatch = {
            id: `disp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            client_id: clientId,
            match_id: matchId,
            match_name: matchName,
            compatibility_score: score,
            email_subject: emailSubject,
            email_body: emailBody,
            sent_at: new Date().toISOString(),
            status: 'Sent'
        };
        this.data.dispatchedMatches.unshift(newDispatch);
        // Also update customer status to Matches Sent
        this.updateCustomerStatus(clientId, 'Matches Sent');
        // Also automatically log a match note
        this.addNote(clientId, `Match introduction dispatched to ${matchName} (Score: ${score}%). Email sent with personalized AI intro.`, 'Call');
        this.saveData();
        return newDispatch;
    }
    updateDispatchedMatchFeedback(dispatchId, status, feedbackNotes) {
        const match = this.data.dispatchedMatches.find(m => m.id === dispatchId);
        if (!match)
            return null;
        match.status = status;
        if (feedbackNotes !== undefined) {
            match.feedback_notes = feedbackNotes;
        }
        match.updated_at = new Date().toISOString();
        // If client is interested or scheduled first date, update customer status
        if (status === 'First Date Arranged') {
            this.updateCustomerStatus(match.client_id, 'Matched');
        }
        // Automatically record an interaction note for this feedback
        this.addNote(match.client_id, `Feedback update on match ${match.match_name}: Status changed to "${status}".${feedbackNotes ? ` Notes: "${feedbackNotes}"` : ''}`, 'Client Feedback');
        this.saveData();
        return match;
    }
}
exports.db = new DatabaseStore();

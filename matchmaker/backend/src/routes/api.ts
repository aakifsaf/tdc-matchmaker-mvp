import { Router } from 'express';
import { login, getCurrentUser } from '../controllers/authController.js';
import {
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
  getCustomerNotes,
  addCustomerNote,
  getCustomerDispatches,
  getDashboardStats
} from '../controllers/customerController.js';
import {
  generateMatchesForClient,
  createEmailDraft,
  dispatchMatchToClient,
  rerankMatches,
  updateMatchFeedback
} from '../controllers/matchingController.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TDC Matchmaker API',
    timestamp: new Date().toISOString()
  });
});

// Auth
router.post('/auth/login', login);
router.get('/auth/me', getCurrentUser);

// Dashboard & Customers
router.get('/stats', getDashboardStats);
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.post('/customers/:id/status', updateCustomerStatus);

// Notes
router.get('/customers/:id/notes', getCustomerNotes);
router.post('/customers/:id/notes', addCustomerNote);

// Dispatches
router.get('/customers/:id/dispatches', getCustomerDispatches);
router.put('/matches/dispatch/:id/feedback', updateMatchFeedback);

// Matching Engine & AI Endpoints
router.post('/matches/generate/:id', generateMatchesForClient);
router.post('/matches/draft-email', createEmailDraft);
router.post('/matches/dispatch', dispatchMatchToClient);
router.post('/matches/rerank', rerankMatches);

export default router;
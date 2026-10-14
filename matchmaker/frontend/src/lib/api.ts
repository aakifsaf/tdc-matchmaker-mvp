import { Customer, Matchmaker, MatchNote, DispatchedMatch, JourneyStatus, MatchCandidateResult } from '../types/customer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  // Health
  async getHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  },

  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE_URL}/auth/me`);
    return res.json();
  },

  // Dashboard Stats
  async getStats() {
    const res = await fetch(`${API_BASE_URL}/stats`);
    return res.json();
  },

  // Customers
  async getCustomers(status?: string, search?: string) {
    const params = new URLSearchParams();
    if (status && status !== 'All') params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());
    const res = await fetch(`${API_BASE_URL}/customers?${params.toString()}`);
    return res.json();
  },

  async getCustomerById(id: string): Promise<{ customer: Customer; notes: MatchNote[]; dispatches: DispatchedMatch[] }> {
    const res = await fetch(`${API_BASE_URL}/customers/${id}`);
    if (!res.ok) throw new Error('Customer not found');
    return res.json();
  },

  async updateCustomerStatus(id: string, status_tag: JourneyStatus) {
    const res = await fetch(`${API_BASE_URL}/customers/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status_tag })
    });
    return res.json();
  },

  // Notes
  async addNote(id: string, note_text: string, category: MatchNote['category'] = 'Call') {
    const res = await fetch(`${API_BASE_URL}/customers/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note_text, category })
    });
    return res.json();
  },

  async generateMatches(id: string): Promise<{
    client_id: string;
    client_name: string;
    client_gender: string;
    total_pool_evaluated: number;
    passed_tier1_count: number;
    matches: MatchCandidateResult[];
  }> {
    const res = await fetch(`${API_BASE_URL}/matches/generate/${id}`, {
      method: 'POST'
    });
    return res.json();
  },

  async draftEmail(clientId: string, matchId: string): Promise<{ subject: string; body: string }> {
    const res = await fetch(`${API_BASE_URL}/matches/draft-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: clientId, match_id: matchId })
    });
    return res.json();
  },

  async dispatchMatch(clientId: string, matchId: string, emailSubject: string, emailBody: string, score?: number) {
    const res = await fetch(`${API_BASE_URL}/matches/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        match_id: matchId,
        email_subject: emailSubject,
        email_body: emailBody,
        score: score
      })
    });
    return res.json();
  },

    async rerankMatches(clientId: string, prompt: string, candidateIds: string[]): Promise<{
    client_id: string;
    prompt: string;
    results: Array<{
      candidate_id: string;
      reranked_score: number;
      custom_badge: string;
      prompt_justification: string;
      synergy_highlights?: string[];
      friction_points?: any[];
    }>;
  }> {
    const res = await fetch(`${API_BASE_URL}/matches/rerank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        prompt,
        candidate_ids: candidateIds
      })
    });
    if (!res.ok) throw new Error('Failed to re-rank matches');
    return res.json();
  },

  async updateDispatchFeedback(dispatchId: string, status: string, feedbackNotes?: string): Promise<{
    message: string;
    dispatched: DispatchedMatch;
  }> {
    const res = await fetch(`${API_BASE_URL}/matches/dispatch/${dispatchId}/feedback`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        feedback_notes: feedbackNotes
      })
    });
    if (!res.ok) throw new Error('Failed to update dispatch feedback');
    return res.json();
  }
};

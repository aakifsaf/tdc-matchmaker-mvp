import fs from 'fs';
import path from 'path';
import { Customer, Matchmaker, MatchNote, DispatchedMatch, Gender, JourneyStatus } from '../types/customer.js';
import { generateProfiles } from './seedProfiles.js';

interface DatabaseSchema {
  matchmakers: Matchmaker[];
  customers: Customer[];
  notes: MatchNote[];
  dispatchedMatches: DispatchedMatch[];
}

const dbFilePath = path.resolve(__dirname, 'database.json');

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(dbFilePath)) {
        const raw = fs.readFileSync(dbFilePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read existing database.json, generating fresh seed...', err);
    }

    const fresh = generateProfiles();
    this.saveData(fresh);
    return fresh;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      const dir = path.dirname(dbFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(dbFilePath, JSON.stringify(dataToSave || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database.json', err);
    }
  }

  // Matchmakers
  public getMatchmakers(): Matchmaker[] {
    return this.data.matchmakers;
  }

  public getMatchmakerById(id: string): Matchmaker | undefined {
    return this.data.matchmakers.find(m => m.id === id);
  }

  // Customers
  public getAssignedCustomers(matchmakerId = 'mm_priya', statusFilter?: string, search?: string): Customer[] {
    let clients = this.data.customers.filter(c => c.assigned_matchmaker_id === matchmakerId);

    if (statusFilter && statusFilter !== 'All') {
      clients = clients.filter(c => c.status_tag === statusFilter);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      clients = clients.filter(c =>
        c.first_name.toLowerCase().includes(q) ||
        c.last_name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.current_company.toLowerCase().includes(q) ||
        c.marital_status.toLowerCase().includes(q)
      );
    }

    return clients;
  }

  public getCustomerById(id: string): Customer | undefined {
    return this.data.customers.find(c => c.id === id);
  }

  public updateCustomerStatus(id: string, newStatus: JourneyStatus): Customer | undefined {
    const customer = this.data.customers.find(c => c.id === id);
    if (customer) {
      customer.status_tag = newStatus;
      this.saveData();
    }
    return customer;
  }

  // Pool
  public getPoolByGender(gender: Gender): Customer[] {
    return this.data.customers.filter(c => c.gender === gender);
  }

  // Notes
  public getNotesByCustomerId(customerId: string): MatchNote[] {
    return this.data.notes
      .filter(n => n.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addNote(customerId: string, noteText: string, category: MatchNote['category'] = 'Call'): MatchNote {
    const newNote: MatchNote = {
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
  public getDispatchedMatches(clientId: string): DispatchedMatch[] {
    return this.data.dispatchedMatches
      .filter(m => m.client_id === clientId)
      .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
  }

  public addDispatchedMatch(
    clientId: string,
    matchId: string,
    matchName: string,
    score: number,
    emailSubject: string,
    emailBody: string
  ): DispatchedMatch {
    const newDispatch: DispatchedMatch = {
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
    this.addNote(
      clientId,
      `Match introduction dispatched to ${matchName} (Score: ${score}%). Email sent with personalized AI intro.`,
      'Call'
    );

    this.saveData();
    return newDispatch;
  }

  public updateDispatchedMatchFeedback(
    dispatchId: string,
    status: DispatchedMatch['status'],
    feedbackNotes?: string
  ): DispatchedMatch | null {
    const match = this.data.dispatchedMatches.find(m => m.id === dispatchId);
    if (!match) return null;

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
    this.addNote(
      match.client_id,
      `Feedback update on match ${match.match_name}: Status changed to "${status}".${feedbackNotes ? ` Notes: "${feedbackNotes}"` : ''}`,
      'Client Feedback'
    );

    this.saveData();
    return match;
  }
}

export const db = new DatabaseStore();

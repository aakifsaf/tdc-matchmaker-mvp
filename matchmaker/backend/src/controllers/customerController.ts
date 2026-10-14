import { Request, Response } from 'express';
import { db } from '../data/db.js';
import { JourneyStatus } from '../types/customer.js';

export function getCustomers(req: Request, res: Response) {
  const status = req.query.status as string;
  const search = req.query.search as string;
  const matchmakerId = (req.query.matchmaker_id as string) || 'mm_priya';

  const customers = db.getAssignedCustomers(matchmakerId, status, search);
  return res.json({
    count: customers.length,
    customers
  });
}

export function getCustomerById(req: Request, res: Response) {
  const id = req.params.id as string;
  const customer = db.getCustomerById(id);

  if (!customer) {
    return res.status(404).json({ error: `Customer with ID ${id} not found` });
  }

  const notes = db.getNotesByCustomerId(id);
  const dispatches = db.getDispatchedMatches(id);

  return res.json({
    customer,
    notes,
    dispatches
  });
}

export function updateCustomerStatus(req: Request, res: Response) {
  const id = req.params.id as string;
  const { status_tag } = req.body;

  if (!status_tag) {
    return res.status(400).json({ error: 'status_tag is required' });
  }

  const validStatuses: JourneyStatus[] = ['New', 'Interviewing', 'Active Matching', 'Matches Sent', 'Matched'];
  if (!validStatuses.includes(status_tag)) {
    return res.status(400).json({ error: `Invalid status_tag. Must be one of: ${validStatuses.join(', ')}` });
  }

  const updated = db.updateCustomerStatus(id, status_tag);
  if (!updated) {
    return res.status(404).json({ error: `Customer with ID ${id} not found` });
  }

  return res.json({
    message: 'Status updated successfully',
    customer: updated
  });
}

export function getCustomerNotes(req: Request, res: Response) {
  const id = req.params.id as string;
  const notes = db.getNotesByCustomerId(id);
  return res.json({ notes });
}

export function addCustomerNote(req: Request, res: Response) {
  const id = req.params.id as string;
  const { note_text, category } = req.body;

  if (!note_text || !note_text.trim()) {
    return res.status(400).json({ error: 'note_text is required' });
  }

  const customer = db.getCustomerById(id);
  if (!customer) {
    return res.status(404).json({ error: `Customer with ID ${id} not found` });
  }

  const note = db.addNote(id, note_text.trim(), category || 'Call');
  return res.status(201).json({
    message: 'Note logged successfully',
    note
  });
}

export function getCustomerDispatches(req: Request, res: Response) {
  const id = req.params.id as string;
  const dispatches = db.getDispatchedMatches(id);
  return res.json({ dispatches });
}

export function getDashboardStats(req: Request, res: Response) {
  const matchmakerId = (req.query.matchmaker_id as string) || 'mm_priya';
  const allAssigned = db.getAssignedCustomers(matchmakerId);

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

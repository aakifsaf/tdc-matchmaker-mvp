import { Request, Response } from 'express';
import { db } from '../data/db.js';

export function login(req: Request, res: Response) {
  const { email, password } = req.body;

  // Standard demo credentials or any @thedatecrew.com matchmaker login
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // Predefined Senior Matchmaker Priya Sharma
  const matchmakers = db.getMatchmakers();
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
        assigned_client_count: db.getAssignedCustomers(matchmaker.id).length
      }
    });
  }

  return res.status(401).json({
    error: 'Invalid credentials. Use demo credentials: priya.sharma@thedatecrew.com / tdc2026'
  });
}

export function getCurrentUser(req: Request, res: Response) {
  const matchmaker = db.getMatchmakerById('mm_priya') || db.getMatchmakers()[0];
  return res.json({
    matchmaker: {
      id: matchmaker.id,
      name: matchmaker.name,
      email: matchmaker.email,
      role: matchmaker.role,
      avatar_url: matchmaker.avatar_url,
      assigned_client_count: db.getAssignedCustomers(matchmaker.id).length
    }
  });
}

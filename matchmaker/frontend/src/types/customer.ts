export type Gender = 'Male' | 'Female';
export type JourneyStatus = 'New' | 'Interviewing' | 'Active Matching' | 'Matches Sent' | 'Matched';
export type AnswerChoice = 'Yes' | 'No' | 'Maybe';
export type DietPreference = 'Vegetarian' | 'Non-Vegetarian' | 'Eggetarian' | 'Jain' | 'Vegan';
export type DrinkingHabit = 'Non-Drinker' | 'Socially' | 'Regular';
export type SmokingHabit = 'Non-Smoker' | 'Occasionally' | 'Regular';
export type ManglikStatus = 'Non-Manglik' | 'Manglik' | 'Anshik Manglik' | "Doesn't Matter";
export type FamilyType = 'Nuclear' | 'Joint';
export type MaritalStatus = 'Never Married' | 'Divorced' | 'Awaiting Divorce';

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  gender: Gender;
  dob: string;
  age: number;
  height_cm: number;
  height_formatted: string;
  photo_url: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  hometown: string;

  // Professional
  ug_college: string;
  degree: string;
  current_company: string;
  designation: string;
  income_lpa: number;

  // Cultural & Family
  marital_status: MaritalStatus;
  religion: string;
  caste: string;
  mother_tongue: string;
  languages_known: string[];
  siblings: string;
  family_type: FamilyType;

  // Lifestyle & Research additions
  want_kids: AnswerChoice;
  open_to_relocate: AnswerChoice;
  open_to_pets: AnswerChoice;
  diet: DietPreference;
  drinking: DrinkingHabit;
  smoking: SmokingHabit;
  manglik_status: ManglikStatus;

  // Matchmaker Context & Narrative
  bio_summary: string;
  partner_preferences_summary: string;
  status_tag: JourneyStatus;
  assigned_matchmaker_id: string;
  created_at: string;
}

export interface Matchmaker {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string;
  assigned_client_count: number;
}

export interface MatchNote {
  id: string;
  customer_id: string;
  matchmaker_id: string;
  matchmaker_name: string;
  note_text: string;
  category: 'Call' | 'In-Person Meeting' | 'Preferences Update' | 'Client Feedback';
  created_at: string;
}

export type DispatchStatus =
  | 'Sent'
  | 'Awaiting Client Feedback'
  | 'Client Interested'
  | 'Intro Call Scheduled'
  | 'First Date Arranged'
  | 'Client Passed';

export interface DispatchedMatch {
  id: string;
  client_id: string;
  match_id: string;
  match_name: string;
  compatibility_score: number;
  email_subject: string;
  email_body: string;
  sent_at: string;
  status: DispatchStatus;
  feedback_notes?: string;
  updated_at?: string;
}

export interface ScoreBreakdown {
  pedigree_and_career: number;
  lifestyle_and_habits: number;
  cultural_and_family: number;
  relocation_and_geography: number;
  delta_optimum: number;
  total: number;
}

export interface AIFrictionPoint {
  category: 'Family' | 'Lifestyle' | 'Location' | 'Career' | 'Values';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  talking_point_for_matchmaker: string;
}

export interface MatchCandidateResult {
  candidate: Customer;
  passed_tier1: boolean;
  tier1_reasons: string[];
  tier2_breakdown: ScoreBreakdown;
  ai_score: number;
  ai_badge: string;
  synergy_highlights: string[];
  friction_points: AIFrictionPoint[];
  icebreakers: string[];
}

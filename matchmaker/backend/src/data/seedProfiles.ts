import fs from 'fs';
import path from 'path';
import { Customer, Matchmaker, MatchNote, DispatchedMatch, Gender, AnswerChoice, DietPreference, DrinkingHabit, SmokingHabit, ManglikStatus, FamilyType } from '../types/customer.js';

const MALE_FIRST_NAMES = [
  'Rohan', 'Arjun', 'Kabir', 'Aditya', 'Vikram', 'Siddharth', 'Varun', 'Karan', 'Aayush', 'Dhruv',
  'Dev', 'Nikhil', 'Tanmay', 'Rishabh', 'Aakash', 'Ishaan', 'Pranav', 'Harsh', 'Anand', 'Raghav',
  'Sameer', 'Gaurav', 'Manish', 'Kunal', 'Abhishek', 'Tarun', 'Aniket', 'Vivaan', 'Reyansh', 'Shaan',
  'Rudra', 'Aryan', 'Samarth', 'Kartik', 'Yash', 'Advait', 'Chirag', 'Tushar', 'Akshay', 'Neeraj',
  'Sumeet', 'Mayank', 'Bhavik', 'Tejas', 'Parth', 'Sanjay', 'Alok', 'Deepak', 'Hemant', 'Mohit',
  'Rahul', 'Vivek', 'Sachin', 'Amit', 'Naveen', 'Saurabh', 'Rajesh', 'Vikas', 'Pankaj', 'Sunil'
];

const FEMALE_FIRST_NAMES = [
  'Ananya', 'Sneha', 'Pooja', 'Rhea', 'Tara', 'Diya', 'Meera', 'Kavya', 'Isha', 'Tanvi',
  'Avani', 'Riddhi', 'Aditi', 'Shreya', 'Natasha', 'Simran', 'Kritika', 'Alia', 'Suhani', 'Mira',
  'Bhavna', 'Trisha', 'Sanya', 'Radhika', 'Nandini', 'Prisha', 'Khushi', 'Aarohi', 'Kiara', 'Navya',
  'Ahana', 'Myra', 'Siya', 'Shanaya', 'Anushka', 'Vaishnavi', 'Pallavi', 'Divya', 'Neha', 'Priyanka',
  'Swati', 'Ritu', 'Anjali', 'Deepika', 'Akanksha', 'Garima', 'Sonal', 'Richa', 'Payal', 'Mansi',
  'Jyoti', 'Shweta', 'Smriti', 'Nidhi', 'Komal', 'Sakshi', 'Poonam', 'Aarti', 'Preeti', 'Sunita'
];

const LAST_NAMES = [
  'Sharma', 'Mehta', 'Verma', 'Kapoor', 'Singhania', 'Patel', 'Deshmukh', 'Reddy', 'Nair', 'Banerjee',
  'Chatterjee', 'Gupta', 'Aggarwal', 'Chopra', 'Malhotra', 'Bhatia', 'Iyer', 'Menon', 'Joshi', 'Kulkarni',
  'Saxena', 'Bhatt', 'Rao', 'Shetty', 'Pillai', 'Chowdhury', 'Sen', 'Dutta', 'Pandey', 'Mishra',
  'Tripathi', 'Trivedi', 'Shah', 'Dalal', 'Parekh', 'Gokhale', 'Mahajan', 'Kaur', 'Singh', 'Gill'
];

const CITIES = [
  { city: 'Mumbai', country: 'India', areas: ['Bandra West', 'Powai', 'Lower Parel', 'Juhu', 'Colaba'] },
  { city: 'Bengaluru', country: 'India', areas: ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Lavelle Road'] },
  { city: 'Delhi NCR', country: 'India', areas: ['Gurgaon Golf Course Rd', 'South Delhi (GK)', 'Vasant Vihar', 'Noida Sec 44'] },
  { city: 'Pune', country: 'India', areas: ['Koregaon Park', 'Kalyani Nagar', 'Baner', 'Aundh'] },
  { city: 'Hyderabad', country: 'India', areas: ['Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Hitec City'] },
  { city: 'Chennai', country: 'India', areas: ['Adyar', 'Besant Nagar', 'Alwarpet', 'Nungambakkam'] },
  { city: 'Kolkata', country: 'India', areas: ['Ballygunge', 'Salt Lake', 'Alipore', 'New Town'] }
];

const MALE_COLLEGES = [
  { college: 'IIT Bombay', degree: 'B.Tech in Computer Science' },
  { college: 'IIT Delhi', degree: 'B.Tech in Electrical Engineering' },
  { college: 'BITS Pilani', degree: 'B.E. in Mechanical Engineering' },
  { college: 'IIT Madras', degree: 'B.Tech in Chemical Engineering' },
  { college: 'SRCC, Delhi University', degree: 'B.Com (Hons)' },
  { college: 'St. Stephen\'s College, Delhi', degree: 'B.A. (Hons) Economics' },
  { college: 'IIT Roorkee', degree: 'B.Tech in Civil Engineering' },
  { college: 'NIT Trichy', degree: 'B.Tech in Electronics & Communication' },
  { college: 'IIIT Hyderabad', degree: 'B.Tech in Computer Science' },
  { college: 'National Law School of India (NLSIU)', degree: 'B.A. LL.B (Hons)' }
];

const FEMALE_COLLEGES = [
  { college: 'Lady Shri Ram College (LSR), Delhi', degree: 'B.A. (Hons) Economics' },
  { college: 'St. Stephen\'s College, Delhi', degree: 'B.Sc (Hons) Mathematics' },
  { college: 'IIT Bombay', degree: 'B.Tech in Design & Engineering' },
  { college: 'BITS Pilani', degree: 'B.E. in Computer Science' },
  { college: 'SRCC, Delhi University', degree: 'B.Com (Hons)' },
  { college: 'Miranda House, Delhi University', degree: 'B.A. (Hons) English Literature' },
  { college: 'National Institute of Design (NID)', degree: 'B.Des in Product Design' },
  { college: 'IIT Delhi', degree: 'B.Tech in Information Technology' },
  { college: 'St. Xavier\'s College, Mumbai', degree: 'B.A. in Psychology & Mass Media' },
  { college: 'NIFT New Delhi', degree: 'B.Des in Fashion Communication' }
];

const COMPANIES_AND_ROLES_MALE = [
  { company: 'Google India', designation: 'Senior Software Engineer', minIncome: 45, maxIncome: 75 },
  { company: 'Microsoft', designation: 'Principal Product Manager', minIncome: 50, maxIncome: 85 },
  { company: 'McKinsey & Company', designation: 'Engagement Manager', minIncome: 55, maxIncome: 95 },
  { company: 'Boston Consulting Group (BCG)', designation: 'Project Leader', minIncome: 60, maxIncome: 100 },
  { company: 'Goldman Sachs', designation: 'Vice President, Quantitative Strategy', minIncome: 65, maxIncome: 120 },
  { company: 'Zerodha', designation: 'Engineering Lead', minIncome: 45, maxIncome: 80 },
  { company: 'Swiggy', designation: 'Director of Product', minIncome: 55, maxIncome: 90 },
  { company: 'Bain & Company', designation: 'Senior Consultant', minIncome: 45, maxIncome: 75 },
  { company: 'Razorpay', designation: 'Principal Software Architect', minIncome: 50, maxIncome: 85 },
  { company: 'Tata Motors', designation: 'Senior Strategy Manager', minIncome: 28, maxIncome: 45 },
  { company: 'HealthifyMe', designation: 'Founder & Tech Lead', minIncome: 40, maxIncome: 80 },
  { company: 'Apollo Hospitals', designation: 'Consultant Orthopedic Surgeon', minIncome: 45, maxIncome: 90 },
  { company: 'Khaitan & Co', designation: 'Senior Corporate Associate', minIncome: 35, maxIncome: 60 },
  { company: 'Amazon Web Services', designation: 'Senior Solutions Architect', minIncome: 42, maxIncome: 70 }
];

const COMPANIES_AND_ROLES_FEMALE = [
  { company: 'Google India', designation: 'Product Marketing Manager', minIncome: 30, maxIncome: 55 },
  { company: 'Microsoft', designation: 'Senior Software Engineer', minIncome: 35, maxIncome: 65 },
  { company: 'Bain & Company', designation: 'Management Consultant', minIncome: 38, maxIncome: 65 },
  { company: 'McKinsey & Company', designation: 'Senior Associate', minIncome: 40, maxIncome: 70 },
  { company: 'J.P. Morgan', designation: 'Investment Banking Associate', minIncome: 35, maxIncome: 60 },
  { company: 'Zomato', designation: 'Lead UX Product Designer', minIncome: 28, maxIncome: 48 },
  { company: 'Urban Company', designation: 'Senior Brand Manager', minIncome: 25, maxIncome: 42 },
  { company: 'Cred', designation: 'Lead Data Scientist', minIncome: 38, maxIncome: 68 },
  { company: 'Max Healthcare', designation: 'Consultant Dermatologist', minIncome: 30, maxIncome: 55 },
  { company: 'Shardul Amarchand Mangaldas', designation: 'Senior Legal Associate', minIncome: 32, maxIncome: 58 },
  { company: 'Nykaa', designation: 'Head of Category Management', minIncome: 30, maxIncome: 52 },
  { company: 'Architectural Digest', designation: 'Senior Interior Architect', minIncome: 20, maxIncome: 38 },
  { company: 'Adobe India', designation: 'Computer Scientist', minIncome: 36, maxIncome: 62 },
  { company: 'Swiggy', designation: 'Product Manager', minIncome: 28, maxIncome: 50 }
];

const COMMUNITIES = [
  { religion: 'Hindu', castes: ['Brahmin', 'Baniya', 'Kayastha', 'Rajput', 'Khatri', 'Maratha'] },
  { religion: 'Jain', castes: ['Shwetambar', 'Digambar', 'Oswal'] },
  { religion: 'Sikh', castes: ['Khatri', 'Arora', 'Jat'] },
  { religion: 'Christian', castes: ['Catholic', 'Protestant'] },
  { religion: 'Parsi', castes: ['Irani', 'Parsi'] }
];

const MOTHER_TONGUES = ['Hindi', 'Punjabi', 'Gujarati', 'Marathi', 'Bengali', 'Tamil', 'Telugu', 'Kannada', 'Malayalam'];

const MALE_PORTRAITS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80'
];

const FEMALE_PORTRAITS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&auto=format&fit=crop&q=80'
];

function getRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatHeight(cm: number): string {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}'${inches}"`;
}

export function generateProfiles(): {
  matchmakers: Matchmaker[];
  customers: Customer[];
  notes: MatchNote[];
  dispatchedMatches: DispatchedMatch[];
} {
  const matchmakers: Matchmaker[] = [
    {
      id: 'mm_priya',
      name: 'Priya Sharma',
      email: 'priya.sharma@thedatecrew.com',
      role: 'Senior Matchmaker',
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      assigned_client_count: 12
    },
    {
      id: 'mm_kabir',
      name: 'Kabir Varma',
      email: 'kabir.varma@thedatecrew.com',
      role: 'Executive Matchmaker',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      assigned_client_count: 8
    }
  ];

  const customers: Customer[] = [];
  const notes: MatchNote[] = [];
  const dispatchedMatches: DispatchedMatch[] = [];

  // 1. PRIMARY ASSIGNED CLIENTS FOR PRIYA SHARMA (12 clients with rich backstory & varied statuses)
  const primaryClientsData: Partial<Customer>[] = [
    {
      first_name: 'Rohan',
      last_name: 'Mehta',
      gender: 'Male',
      age: 29,
      height_cm: 180,
      city: 'Mumbai',
      hometown: 'Ahmedabad',
      ug_college: 'IIT Bombay',
      degree: 'B.Tech in Computer Science',
      current_company: 'Google India',
      designation: 'Senior Staff Software Engineer',
      income_lpa: 68,
      marital_status: 'Never Married',
      religion: 'Hindu',
      caste: 'Baniya',
      mother_tongue: 'Gujarati',
      languages_known: ['English', 'Hindi', 'Gujarati'],
      siblings: '1 elder sister (married, lives in UK)',
      family_type: 'Nuclear',
      want_kids: 'Yes',
      open_to_relocate: 'Maybe',
      open_to_pets: 'Yes',
      diet: 'Vegetarian',
      drinking: 'Socially',
      smoking: 'Non-Smoker',
      manglik_status: 'Non-Manglik',
      status_tag: 'Active Matching',
      bio_summary: 'Tech lead at Google with a passion for long-distance marathon running, specialty coffee, and indie films. Looking for a partner who values mutual ambition and warm family gatherings.',
      partner_preferences_summary: 'Looking for an ambitious, family-oriented woman who is strictly vegetarian, values fitness, and is open to settling down in Mumbai or Pune.'
    },
    {
      first_name: 'Ananya',
      last_name: 'Sen',
      gender: 'Female',
      age: 27,
      height_cm: 165,
      city: 'Bengaluru',
      hometown: 'Kolkata',
      ug_college: 'Lady Shri Ram College (LSR)',
      degree: 'B.A. (Hons) Economics',
      current_company: 'McKinsey & Company',
      designation: 'Engagement Manager',
      income_lpa: 58,
      marital_status: 'Never Married',
      religion: 'Hindu',
      caste: 'Brahmin',
      mother_tongue: 'Bengali',
      languages_known: ['English', 'Hindi', 'Bengali'],
      siblings: 'Single child',
      family_type: 'Nuclear',
      want_kids: 'Yes',
      open_to_relocate: 'Yes',
      open_to_pets: 'Yes',
      diet: 'Eggetarian',
      drinking: 'Socially',
      smoking: 'Non-Smoker',
      manglik_status: 'Non-Manglik',
      status_tag: 'Active Matching',
      bio_summary: 'Management consultant passionate about sustainable business, contemporary Indian art, and sourdough baking. Values intellectual conversations and exploring quaint cafes.',
      partner_preferences_summary: 'Seeking a progressive, educated partner with strong professional standing (similar or higher tier), progressive values, and an appreciation for culture and travel.'
    },
    {
      first_name: 'Kabir',
      last_name: 'Kapoor',
      gender: 'Male',
      age: 32,
      height_cm: 183,
      city: 'Delhi NCR',
      hometown: 'Chandigarh',
      ug_college: 'BITS Pilani',
      degree: 'B.E. in Electrical Engineering',
      current_company: 'Goldman Sachs',
      designation: 'Vice President, Quantitative Strategy',
      income_lpa: 92,
      marital_status: 'Never Married',
      religion: 'Hindu',
      caste: 'Khatri',
      mother_tongue: 'Punjabi',
      languages_known: ['English', 'Hindi', 'Punjabi'],
      siblings: '1 younger brother (Investment Banker in London)',
      family_type: 'Nuclear',
      want_kids: 'Yes',
      open_to_relocate: 'No',
      open_to_pets: 'Yes',
      diet: 'Non-Vegetarian',
      drinking: 'Socially',
      smoking: 'Non-Smoker',
      manglik_status: 'Anshik Manglik',
      status_tag: 'Matches Sent',
      bio_summary: 'Quant VP who loves squash, fine dining, and classic jazz. Pragmatic, driven, with deep respect for close-knit Punjabi family traditions.',
      partner_preferences_summary: 'Looking for a cultured, younger woman with aligned family values, comfortable with life in Gurgaon, and open to pets.'
    },
    {
      first_name: 'Sneha',
      last_name: 'Deshmukh',
      gender: 'Female',
      age: 28,
      height_cm: 162,
      city: 'Pune',
      hometown: 'Pune',
      ug_college: 'St. Xavier\'s College, Mumbai',
      degree: 'B.A. in Psychology & Mass Media',
      current_company: 'Zomato',
      designation: 'Lead UX Product Designer',
      income_lpa: 36,
      marital_status: 'Never Married',
      religion: 'Hindu',
      caste: 'Maratha',
      mother_tongue: 'Marathi',
      languages_known: ['English', 'Hindi', 'Marathi'],
      siblings: '1 elder brother (Architect)',
      family_type: 'Nuclear',
      want_kids: 'Maybe',
      open_to_relocate: 'Yes',
      open_to_pets: 'Yes',
      diet: 'Vegetarian',
      drinking: 'Non-Drinker',
      smoking: 'Non-Smoker',
      manglik_status: 'Non-Manglik',
      status_tag: 'Interviewing',
      bio_summary: 'Design thinker focused on intuitive consumer apps. Enjoys pottery, hiking the Western Ghats, and reading historical fiction.',
      partner_preferences_summary: 'Looking for a tech or product leader in Pune/Mumbai with a gentle temperament, vegetarian diet, and mutual respect for personal space.'
    },
    {
      first_name: 'Aditya',
      last_name: 'Singhania',
      gender: 'Male',
      age: 34,
      height_cm: 177,
      city: 'Mumbai',
      hometown: 'Jaipur',
      ug_college: 'SRCC, Delhi University',
      degree: 'B.Com (Hons)',
      current_company: 'Boston Consulting Group (BCG)',
      designation: 'Partner & Managing Director',
      income_lpa: 125,
      marital_status: 'Divorced',
      religion: 'Jain',
      caste: 'Shwetambar',
      mother_tongue: 'Hindi',
      languages_known: ['English', 'Hindi', 'Marwari'],
      siblings: '2 sisters (both married)',
      family_type: 'Joint',
      want_kids: 'Yes',
      open_to_relocate: 'No',
      open_to_pets: 'No',
      diet: 'Jain',
      drinking: 'Non-Drinker',
      smoking: 'Non-Smoker',
      manglik_status: 'Non-Manglik',
      status_tag: 'New',
      bio_summary: 'Senior consulting partner with an entrepreneurial family background. Highly grounded, values traditional Marwari-Jain principles, loves tennis and architecture.',
      partner_preferences_summary: 'Seeking an empathetic, Jain-compatible woman who respects joint family dynamics, is strictly vegetarian/Jain, and younger.'
    },
    {
      first_name: 'Pooja',
      last_name: 'Reddy',
      gender: 'Female',
      age: 26,
      height_cm: 168,
      city: 'Hyderabad',
      hometown: 'Hyderabad',
      ug_college: 'BITS Pilani',
      degree: 'B.E. in Computer Science',
      current_company: 'Microsoft',
      designation: 'Software Engineer II',
      income_lpa: 42,
      marital_status: 'Never Married',
      religion: 'Hindu',
      caste: 'Reddy',
      mother_tongue: 'Telugu',
      languages_known: ['English', 'Hindi', 'Telugu'],
      siblings: '1 younger sister (Medical Student)',
      family_type: 'Nuclear',
      want_kids: 'Yes',
      open_to_relocate: 'Maybe',
      open_to_pets: 'Yes',
      diet: 'Non-Vegetarian',
      drinking: 'Socially',
      smoking: 'Non-Smoker',
      manglik_status: 'Non-Manglik',
      status_tag: 'Active Matching',
      bio_summary: 'Tech enthusiast who writes backend services by day and paints abstract canvases by night. Loves weekend road trips and badminton.',
      partner_preferences_summary: 'Looking for a Telugu or South Indian tech/finance professional in Hyderabad or Bengaluru with equal or higher earning potential and warm humor.'
    },
    {
      first_name: 'Vikram',
      last_name: 'Nair',
      gender: 'Male',
      age: 30,
      height_cm: 179,
      city: 'Bengaluru',
      hometown: 'Kochi',
      ug_college: 'IIT Madras',
      degree: 'B.Tech in Mechanical Engineering',
      current_company: 'Zerodha',
      designation: 'Staff Infrastructure Architect',
      income_lpa: 58,
      marital_status: 'Never Married',
      religion: 'Hindu',
      caste: 'Nair',
      mother_tongue: 'Malayalam',
      languages_known: ['English', 'Hindi', 'Malayalam', 'Tamil'],
      siblings: 'Only child',
      family_type: 'Nuclear',
      want_kids: 'Yes',
      open_to_relocate: 'No',
      open_to_pets: 'Yes',
      diet: 'Non-Vegetarian',
      drinking: 'Socially',
      smoking: 'Non-Smoker',
      manglik_status: 'Non-Manglik',
      status_tag: 'Matched',
      bio_summary: 'Fintech systems engineer, avid cyclist, and amateur astrophotographer. Calm, reflective, and deeply passionate about open-source.',
      partner_preferences_summary: 'Seeking a thoughtful partner in Bengaluru who enjoys nature, intellectual curiosity, and simple, joyful living.'
    },
    {
      first_name: 'Tara',
      last_name: 'Chopra',
      gender: 'Female',
      age: 29,
      height_cm: 167,
      city: 'Mumbai',
      hometown: 'Delhi NCR',
      ug_college: 'NIFT New Delhi',
      degree: 'B.Des in Fashion Communication',
      current_company: 'Nykaa',
      designation: 'Associate Director, Creative Strategy',
      income_lpa: 46,
      marital_status: 'Never Married',
      religion: 'Hindu',
      caste: 'Punjabi Khatri',
      mother_tongue: 'Hindi',
      languages_known: ['English', 'Hindi', 'Punjabi'],
      siblings: '1 elder brother (Founder, D2C brand)',
      family_type: 'Nuclear',
      want_kids: 'Yes',
      open_to_relocate: 'Maybe',
      open_to_pets: 'Yes',
      diet: 'Eggetarian',
      drinking: 'Socially',
      smoking: 'Occasionally',
      manglik_status: 'Manglik',
      status_tag: 'Matches Sent',
      bio_summary: 'Creative director driving omnichannel campaigns. Enjoys contemporary theater, pilates, and curating travel guides across Europe.',
      partner_preferences_summary: 'Looking for a confident, well-settled partner (Tech/Finance/Founder) with progressive outlook, good aesthetic sense, and Manglik compatibility.'
    },
    {
      first_name: 'Siddharth',
      last_name: 'Iyer',
      gender: 'Male',
      age: 31,
      height_cm: 176,
      city: 'Chennai',
      hometown: 'Chennai',
      ug_college: 'IIT Roorkee',
      degree: 'B.Tech in Chemical Engineering',
      current_company: 'McKinsey & Company',
      designation: 'Associate Partner',
      income_lpa: 84,
      marital_status: 'Never Married',
      religion: 'Hindu',
      caste: 'Brahmin',
      mother_tongue: 'Tamil',
      languages_known: ['English', 'Hindi', 'Tamil'],
      siblings: '1 sister (Dentist)',
      family_type: 'Nuclear',
      want_kids: 'Yes',
      open_to_relocate: 'Yes',
      open_to_pets: 'No',
      diet: 'Vegetarian',
      drinking: 'Non-Drinker',
      smoking: 'Non-Smoker',
      manglik_status: 'Non-Manglik',
      status_tag: 'Active Matching',
      bio_summary: 'Consultant advising renewable energy conglomerates. Carnatic music connoisseur, chess player, and avid reader of non-fiction.',
      partner_preferences_summary: 'Seeking a vegetarian Tamil/South Indian partner who is younger, family-grounded, values classical culture, and has strong educational pedigree.'
    },
    {
      first_name: 'Diya',
      last_name: 'Banerjee',
      gender: 'Female',
      age: 26,
      height_cm: 160,
      city: 'Kolkata',
      hometown: 'Kolkata',
      ug_college: 'St. Xavier\'s College, Kolkata',
      degree: 'B.Sc in Economics & Statistics',
      current_company: 'PwC India',
      designation: 'Senior Risk Analyst',
      income_lpa: 24,
      marital_status: 'Never Married',
      religion: 'Hindu',
      caste: 'Brahmin',
      mother_tongue: 'Bengali',
      languages_known: ['English', 'Hindi', 'Bengali'],
      siblings: 'Only child',
      family_type: 'Nuclear',
      want_kids: 'Yes',
      open_to_relocate: 'Yes',
      open_to_pets: 'Yes',
      diet: 'Non-Vegetarian',
      drinking: 'Non-Drinker',
      smoking: 'Non-Smoker',
      manglik_status: 'Non-Manglik',
      status_tag: 'Interviewing',
      bio_summary: 'Data analyst with a love for Rabindra Sangeet, baking pastries, and weekend wildlife sanctuaries. Gentle, warm, and ambitious.',
      partner_preferences_summary: 'Seeking a partner in Kolkata, Bengaluru, or Delhi with a solid educational background, stable corporate career, and respect for cultural roots.'
    },
    {
      first_name: 'Varun',
      last_name: 'Bhatia',
      gender: 'Male',
      age: 28,
      height_cm: 182,
      city: 'Delhi NCR',
      hometown: 'Delhi NCR',
      ug_college: 'IIT Delhi',
      degree: 'B.Tech in Information Technology',
      current_company: 'Swiggy',
      designation: 'Engineering Manager',
      income_lpa: 62,
      marital_status: 'Never Married',
      religion: 'Hindu',
      caste: 'Punjabi Arora',
      mother_tongue: 'Hindi',
      languages_known: ['English', 'Hindi', 'Punjabi'],
      siblings: '1 elder sister (married)',
      family_type: 'Nuclear',
      want_kids: 'Yes',
      open_to_relocate: 'Maybe',
      open_to_pets: 'Yes',
      diet: 'Non-Vegetarian',
      drinking: 'Socially',
      smoking: 'Non-Smoker',
      manglik_status: 'Non-Manglik',
      status_tag: 'New',
      bio_summary: 'Tech leader building high-scale distributed backend systems. Enjoys formula 1 racing, cooking Mughlai dishes on weekends, and golden retrievers.',
      partner_preferences_summary: 'Looking for a fun, younger woman with aligned family values, who loves dogs and enjoys vibrant weekend city life.'
    },
    {
      first_name: 'Meera',
      last_name: 'Kulkarni',
      gender: 'Female',
      age: 30,
      height_cm: 164,
      city: 'Mumbai',
      hometown: 'Pune',
      ug_college: 'National Law School of India (NLSIU)',
      degree: 'B.A. LL.B (Hons)',
      current_company: 'Shardul Amarchand Mangaldas',
      designation: 'Senior Associate (M&A Law)',
      income_lpa: 48,
      marital_status: 'Never Married',
      religion: 'Hindu',
      caste: 'Brahmin',
      mother_tongue: 'Marathi',
      languages_known: ['English', 'Hindi', 'Marathi'],
      siblings: '1 younger brother (Software Engineer)',
      family_type: 'Nuclear',
      want_kids: 'Maybe',
      open_to_relocate: 'No',
      open_to_pets: 'No',
      diet: 'Vegetarian',
      drinking: 'Non-Drinker',
      smoking: 'Non-Smoker',
      manglik_status: 'Non-Manglik',
      status_tag: 'Active Matching',
      bio_summary: 'Corporate lawyer advising cross-border mergers. Classical Bharatnatyam dancer, history buff, and lover of Marathi theater.',
      partner_preferences_summary: 'Looking for an ambitious, professionally accomplished partner in Mumbai (Finance/Law/Tech) who values intellect, integrity, and cultural arts.'
    }
  ];

  primaryClientsData.forEach((client, index) => {
    const id = `client_${String(index + 1).padStart(3, '0')}`;
    const dobYear = 2026 - (client.age || 28);
    const dobMonth = String(getRandomInt(1, 12)).padStart(2, '0');
    const dobDay = String(getRandomInt(1, 28)).padStart(2, '0');
    const height_cm = client.height_cm || 170;

    const fullClient: Customer = {
      id,
      first_name: client.first_name || 'Client',
      last_name: client.last_name || 'User',
      gender: client.gender as Gender,
      dob: `${dobYear}-${dobMonth}-${dobDay}`,
      age: client.age || 28,
      height_cm,
      height_formatted: formatHeight(height_cm),
      photo_url: client.gender === 'Male' ? MALE_PORTRAITS[index % MALE_PORTRAITS.length] : FEMALE_PORTRAITS[index % FEMALE_PORTRAITS.length],
      email: `${client.first_name?.toLowerCase()}.${client.last_name?.toLowerCase()}@example.com`,
      phone: `+91 ${getRandomInt(98000, 98999)} ${getRandomInt(10000, 99999)}`,
      city: client.city || 'Mumbai',
      country: 'India',
      hometown: client.hometown || client.city || 'Mumbai',
      ug_college: client.ug_college || 'IIT Bombay',
      degree: client.degree || 'B.Tech',
      current_company: client.current_company || 'Google India',
      designation: client.designation || 'Software Engineer',
      income_lpa: client.income_lpa || 40,
      marital_status: client.marital_status || 'Never Married',
      religion: client.religion || 'Hindu',
      caste: client.caste || 'Brahmin',
      mother_tongue: client.mother_tongue || 'Hindi',
      languages_known: client.languages_known || ['English', 'Hindi'],
      siblings: client.siblings || '1 sibling',
      family_type: client.family_type || 'Nuclear',
      want_kids: client.want_kids || 'Yes',
      open_to_relocate: client.open_to_relocate || 'Maybe',
      open_to_pets: client.open_to_pets || 'Yes',
      diet: client.diet || 'Vegetarian',
      drinking: client.drinking || 'Socially',
      smoking: client.smoking || 'Non-Smoker',
      manglik_status: client.manglik_status || 'Non-Manglik',
      bio_summary: client.bio_summary || '',
      partner_preferences_summary: client.partner_preferences_summary || '',
      status_tag: client.status_tag || 'Active Matching',
      assigned_matchmaker_id: 'mm_priya',
      created_at: new Date(Date.now() - getRandomInt(2, 60) * 86400000).toISOString()
    };

    customers.push(fullClient);

    // Initial matchmaker notes
    notes.push({
      id: `note_${id}_1`,
      customer_id: id,
      matchmaker_id: 'mm_priya',
      matchmaker_name: 'Priya Sharma',
      note_text: `Initial onboarding intake call completed with ${fullClient.first_name}. Verified biodata, educational certificates, and employment with ${fullClient.current_company}. Clear priority on lifestyle compatibility.`,
      category: 'Call',
      created_at: new Date(Date.now() - getRandomInt(10, 30) * 86400000).toISOString()
    });

    if (fullClient.status_tag === 'Active Matching' || fullClient.status_tag === 'Matches Sent' || fullClient.status_tag === 'Matched') {
      notes.push({
        id: `note_${id}_2`,
        customer_id: id,
        matchmaker_id: 'mm_priya',
        matchmaker_name: 'Priya Sharma',
        note_text: `Client requested specific focus on ${fullClient.diet} dietary preference and candidates based in or willing to relocate to ${fullClient.city}. Ready for match recommendations.`,
        category: 'Preferences Update',
        created_at: new Date(Date.now() - getRandomInt(1, 9) * 86400000).toISOString()
      });
    }
  });

  // 2. GENERATE 105 FEMALE CANDIDATES (For male clients)
  for (let i = 1; i <= 105; i++) {
    const id = `candidate_f_${String(i).padStart(3, '0')}`;
    const firstName = getRandom(FEMALE_FIRST_NAMES);
    const lastName = getRandom(LAST_NAMES);
    const age = getRandomInt(23, 33);
    const dobYear = 2026 - age;
    const dobMonth = String(getRandomInt(1, 12)).padStart(2, '0');
    const dobDay = String(getRandomInt(1, 28)).padStart(2, '0');
    const height_cm = getRandomInt(152, 172); // Shorter female range
    const cityObj = getRandom(CITIES);
    const collegeObj = getRandom(FEMALE_COLLEGES);
    const jobObj = getRandom(COMPANIES_AND_ROLES_FEMALE);
    const commObj = getRandom(COMMUNITIES);
    const caste = getRandom(commObj.castes);
    const motherTongue = getRandom(MOTHER_TONGUES);
    const income_lpa = getRandomInt(jobObj.minIncome, jobObj.maxIncome);

    const wantsKids: AnswerChoice = i % 8 === 0 ? 'No' : i % 5 === 0 ? 'Maybe' : 'Yes';
    const diet: DietPreference = i % 9 === 0 ? 'Jain' : i % 3 === 0 ? 'Non-Vegetarian' : i % 4 === 0 ? 'Eggetarian' : 'Vegetarian';
    const familyType: FamilyType = i % 4 === 0 ? 'Joint' : 'Nuclear';
    const manglik: ManglikStatus = i % 7 === 0 ? 'Manglik' : i % 10 === 0 ? 'Anshik Manglik' : 'Non-Manglik';

    const candidate: Customer = {
      id,
      first_name: firstName,
      last_name: lastName,
      gender: 'Female',
      dob: `${dobYear}-${dobMonth}-${dobDay}`,
      age,
      height_cm,
      height_formatted: formatHeight(height_cm),
      photo_url: FEMALE_PORTRAITS[i % FEMALE_PORTRAITS.length],
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@matchpool.tdc`,
      phone: `+91 ${getRandomInt(97000, 97999)} ${getRandomInt(10000, 99999)}`,
      city: cityObj.city,
      country: 'India',
      hometown: cityObj.city,
      ug_college: collegeObj.college,
      degree: collegeObj.degree,
      current_company: jobObj.company,
      designation: jobObj.designation,
      income_lpa,
      marital_status: i % 15 === 0 ? 'Divorced' : 'Never Married',
      religion: commObj.religion,
      caste,
      mother_tongue: motherTongue,
      languages_known: Array.from(new Set(['English', 'Hindi', motherTongue])),
      siblings: i % 3 === 0 ? '1 elder brother' : i % 4 === 0 ? 'Single child' : '1 younger sister',
      family_type: familyType,
      want_kids: wantsKids,
      open_to_relocate: i % 3 === 0 ? 'Yes' : i % 2 === 0 ? 'Maybe' : 'No',
      open_to_pets: i % 4 === 0 ? 'No' : 'Yes',
      diet,
      drinking: i % 5 === 0 ? 'Socially' : 'Non-Drinker',
      smoking: i % 12 === 0 ? 'Occasionally' : 'Non-Smoker',
      manglik_status: manglik,
      bio_summary: `${jobObj.designation} at ${jobObj.company}. Alum of ${collegeObj.college}. Passionate about design, travel, cultural arts, and balanced holistic living.`,
      partner_preferences_summary: `Looking for an ambitious, emotionally intelligent partner with strong career foundation, shared cultural warmth, and mutual life vision.`,
      status_tag: 'Active Matching',
      assigned_matchmaker_id: 'pool',
      created_at: new Date(Date.now() - getRandomInt(10, 180) * 86400000).toISOString()
    };

    customers.push(candidate);
  }

  // 3. GENERATE 105 MALE CANDIDATES (For female clients)
  for (let i = 1; i <= 105; i++) {
    const id = `candidate_m_${String(i).padStart(3, '0')}`;
    const firstName = getRandom(MALE_FIRST_NAMES);
    const lastName = getRandom(LAST_NAMES);
    const age = getRandomInt(26, 38);
    const dobYear = 2026 - age;
    const dobMonth = String(getRandomInt(1, 12)).padStart(2, '0');
    const dobDay = String(getRandomInt(1, 28)).padStart(2, '0');
    const height_cm = getRandomInt(172, 188); // Taller male range
    const cityObj = getRandom(CITIES);
    const collegeObj = getRandom(MALE_COLLEGES);
    const jobObj = getRandom(COMPANIES_AND_ROLES_MALE);
    const commObj = getRandom(COMMUNITIES);
    const caste = getRandom(commObj.castes);
    const motherTongue = getRandom(MOTHER_TONGUES);
    const income_lpa = getRandomInt(jobObj.minIncome, jobObj.maxIncome);

    const wantsKids: AnswerChoice = i % 9 === 0 ? 'No' : i % 5 === 0 ? 'Maybe' : 'Yes';
    const diet: DietPreference = i % 10 === 0 ? 'Jain' : i % 2 === 0 ? 'Non-Vegetarian' : 'Vegetarian';
    const familyType: FamilyType = i % 3 === 0 ? 'Joint' : 'Nuclear';
    const manglik: ManglikStatus = i % 8 === 0 ? 'Manglik' : i % 11 === 0 ? 'Anshik Manglik' : 'Non-Manglik';

    const candidate: Customer = {
      id,
      first_name: firstName,
      last_name: lastName,
      gender: 'Male',
      dob: `${dobYear}-${dobMonth}-${dobDay}`,
      age,
      height_cm,
      height_formatted: formatHeight(height_cm),
      photo_url: MALE_PORTRAITS[i % MALE_PORTRAITS.length],
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@matchpool.tdc`,
      phone: `+91 ${getRandomInt(96000, 96999)} ${getRandomInt(10000, 99999)}`,
      city: cityObj.city,
      country: 'India',
      hometown: cityObj.city,
      ug_college: collegeObj.college,
      degree: collegeObj.degree,
      current_company: jobObj.company,
      designation: jobObj.designation,
      income_lpa,
      marital_status: i % 14 === 0 ? 'Divorced' : 'Never Married',
      religion: commObj.religion,
      caste,
      mother_tongue: motherTongue,
      languages_known: Array.from(new Set(['English', 'Hindi', motherTongue])),
      siblings: i % 3 === 0 ? '1 sister' : i % 4 === 0 ? 'Single child' : '1 brother',
      family_type: familyType,
      want_kids: wantsKids,
      open_to_relocate: i % 2 === 0 ? 'Yes' : i % 3 === 0 ? 'Maybe' : 'No',
      open_to_pets: i % 5 === 0 ? 'No' : 'Yes',
      diet,
      drinking: i % 3 === 0 ? 'Socially' : 'Non-Drinker',
      smoking: i % 10 === 0 ? 'Occasionally' : 'Non-Smoker',
      manglik_status: manglik,
      bio_summary: `${jobObj.designation} at ${jobObj.company}. Alum of ${collegeObj.college}. Passionate about technology, sports, weekend road trips, and modern family life.`,
      partner_preferences_summary: `Seeking an educated, warm, modern partner who shares mutual respect, ambition, and joie de vivre.`,
      status_tag: 'Active Matching',
      assigned_matchmaker_id: 'pool',
      created_at: new Date(Date.now() - getRandomInt(10, 180) * 86400000).toISOString()
    };

    customers.push(candidate);
  }

  // Pre-dispatch a couple of sample matches for clients in "Matches Sent" and "Matched"
  dispatchedMatches.push({
    id: 'disp_001',
    client_id: 'client_003', // Kabir Kapoor
    match_id: 'candidate_f_012',
    match_name: 'Tara Dalal',
    compatibility_score: 91,
    email_subject: 'Curated Introduction: Kabir Kapoor & Tara Dalal | The Date Crew',
    email_body: 'Dear Kabir,\n\nWe are delighted to introduce you to Tara Dalal. Tara is a Lead UX Designer at Zomato and an alumna of LSR Delhi. Based in Gurgaon, she shares your passion for live music, dogs, and close-knit family values.\n\nPlease review her profile and let us know your availability for a virtual coffee call.\n\nWarm regards,\nPriya Sharma | Senior Matchmaker, TDC',
    sent_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    status: 'Sent'
  });

  dispatchedMatches.push({
    id: 'disp_002',
    client_id: 'client_007', // Vikram Nair
    match_id: 'candidate_f_025',
    match_name: 'Kavya Pillai',
    compatibility_score: 95,
    email_subject: 'Curated Introduction: Vikram Nair & Kavya Pillai | The Date Crew',
    email_body: 'Dear Vikram,\n\nIt is our absolute pleasure to present Kavya Pillai. Kavya is a Senior Software Engineer at Microsoft in Bengaluru. Both of you share an IIT/BITS foundation, mutual love for Kerala cuisine, cycling, and quiet weekend getaways.\n\nWarm regards,\nPriya Sharma | Senior Matchmaker, TDC',
    sent_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    status: 'Client Interested'
  });

  return { matchmakers, customers, notes, dispatchedMatches };
}

// Standalone execution script
const dataDir = path.resolve(__dirname);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbData = generateProfiles();
const dbPath = path.join(dataDir, 'database.json');
fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf-8');

console.log(`\n======================================================`);
console.log(`  TDC MATCHMAKER DATABASE SEEDED SUCCESSFULLY!`);
console.log(`======================================================`);
console.log(`- Matchmakers: ${dbData.matchmakers.length}`);
console.log(`- Total Customers: ${dbData.customers.length}`);
const males = dbData.customers.filter(c => c.gender === 'Male');
const females = dbData.customers.filter(c => c.gender === 'Female');
console.log(`  • Males: ${males.length} (Assigned + Pool)`);
console.log(`  • Females: ${females.length} (Assigned + Pool)`);
console.log(`- Primary Assigned Clients for Priya Sharma: ${dbData.customers.filter(c => c.assigned_matchmaker_id === 'mm_priya').length}`);
console.log(`- Match Notes: ${dbData.notes.length}`);
console.log(`- Dispatched Matches: ${dbData.dispatchedMatches.length}`);
console.log(`- File written to: ${dbPath}`);
console.log(`======================================================\n`);

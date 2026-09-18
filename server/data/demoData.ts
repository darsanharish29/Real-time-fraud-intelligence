import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  name: string;
  accountNumber: string;
  aadhaarNumber: string;
  passwordHash: string;
  role: 'CITIZEN' | 'INVESTIGATOR' | 'SENIOR_INVESTIGATOR' | 'ADMIN';
  email: string;
  department?: string;
  phone?: string;
  createdAt: string;
}

export interface TransactionRecord {
  id: string;
  transactionRef: string;
  accountNumber: string;
  amount: number;
  currency: string;
  location: string;
  ipAddress: string;
  deviceId: string;
  timestamp: string;
  status: 'COMPLETED' | 'FLAGGED' | 'UNDER_REVIEW' | 'BLOCKED';
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
  channel: 'UPI' | 'NET_BANKING' | 'ATM' | 'POS';
  recipientAccount?: string;
}

export interface CaseRecord {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  category: 'MULE_ACCOUNT' | 'IDENTITY_THEFT' | 'UPI_PHISHING' | 'CARD_CLONING' | 'SYNDICATE_LAUNDERING' | 'SIM_SWAP';
  status: 'NEW' | 'ASSIGNED' | 'UNDER_INVESTIGATION' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskScore: number;
  targetAccount: string;
  aadhaarRef?: string;
  assignedToId?: string;
  assignedToName?: string;
  seniorReviewerId?: string;
  seniorReviewerName?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  complainantName?: string;
  complainantAccount?: string;
  complainantPhone?: string;
  disputedAmount?: number;
  disputedTxnRef?: string;
  suspectAccount?: string;
  incidentDate?: string;
  desiredOutcome?: string;
}

export interface AlertRecord {
  id: string;
  alertCode: string;
  title: string;
  type: 'VELOCITY_SPIKE' | 'GEO_ANOMALY' | 'UNUSUAL_AMOUNT' | 'REPEATED_ACCOUNT' | 'DEVICE_SPOOF' | 'FAILED_AUTH';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  relatedAccount: string;
  relatedTxnRef?: string;
  status: 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  triggerReason: string;
  occurrenceCount: number;
  assignedToId?: string;
  createdAt: string;
}

export interface EvidenceRecord {
  id: string;
  evidenceRef: string;
  caseId: string;
  type: 'TRANSACTION_RECORD' | 'DEVICE_INFO' | 'LOGIN_EVENT' | 'GEO_EVENT' | 'INVESTIGATION_NOTE' | 'SYSTEM_ALERT';
  description: string;
  fileHash: string;
  uploadedBy: string;
  timestamp: string;
  status: 'VERIFIED' | 'PENDING_REVIEW' | 'ARCHIVED';
}

export interface NoteRecord {
  id: string;
  caseId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  note: string;
  timestamp: string;
}

export interface AuditRecord {
  id: string;
  userId?: string;
  userName: string;
  userRole: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  timestamp: string;
}

export interface NetworkNode {
  id: string;
  label: string;
  type: 'ACCOUNT' | 'DEVICE' | 'IP' | 'TRANSACTION' | 'CASE';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  meta?: Record<string, any>;
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
}

// Generate secure salt and hashes for demo password: Demo@123
const DEFAULT_HASH = bcrypt.hashSync('Demo@123', 8);

export const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr-cit-1001',
    name: 'Aarav Patel (Demo Citizen)',
    accountNumber: 'DEMO100001',
    aadhaarNumber: 'XXXX-XXXX-1001',
    passwordHash: DEFAULT_HASH,
    role: 'CITIZEN',
    email: 'citizen.patel@fictional-demo.local',
    phone: '+91 98000 11001',
    createdAt: '2026-08-01T09:00:00.000Z'
  },
  {
    id: 'usr-inv-2001',
    name: 'Vikram Sengupta (Lead Investigator)',
    accountNumber: 'DEMO200001',
    aadhaarNumber: 'XXXX-XXXX-2001',
    passwordHash: DEFAULT_HASH,
    role: 'INVESTIGATOR',
    email: 'v.sengupta@fraud-intel.fictional.gov',
    department: 'Financial Cybercrime Investigation Wing',
    phone: '+91 98000 22001',
    createdAt: '2026-07-15T08:30:00.000Z'
  },
  {
    id: 'usr-sinv-3001',
    name: 'Dr. Priya Nambiar (Senior Investigator)',
    accountNumber: 'DEMO300001',
    aadhaarNumber: 'XXXX-XXXX-3001',
    passwordHash: DEFAULT_HASH,
    role: 'SENIOR_INVESTIGATOR',
    email: 'p.nambiar@fraud-intel.fictional.gov',
    department: 'Special Anti-Syndicate Directorate',
    phone: '+91 98000 33001',
    createdAt: '2026-06-10T10:00:00.000Z'
  },
  {
    id: 'usr-adm-9001',
    name: 'Rajeshwer Mehra (Platform Administrator)',
    accountNumber: 'DEMO900001',
    aadhaarNumber: 'XXXX-XXXX-9001',
    passwordHash: DEFAULT_HASH,
    role: 'ADMIN',
    email: 'admin.mehra@fraud-intel.fictional.gov',
    department: 'Security Operations & Governance',
    phone: '+91 98000 99001',
    createdAt: '2026-05-01T07:00:00.000Z'
  },
  {
    id: 'usr-inv-2002',
    name: 'Ananya Sharma (Forensic Analyst)',
    accountNumber: 'DEMO200002',
    aadhaarNumber: 'XXXX-XXXX-2002',
    passwordHash: DEFAULT_HASH,
    role: 'INVESTIGATOR',
    email: 'a.sharma@fraud-intel.fictional.gov',
    department: 'Digital Forensics & Evidence Unit',
    createdAt: '2026-08-10T11:00:00.000Z'
  },
  {
    id: 'usr-inv-2003',
    name: 'Farhan Zaidi (Risk Analyst)',
    accountNumber: 'DEMO200003',
    aadhaarNumber: 'XXXX-XXXX-2003',
    passwordHash: DEFAULT_HASH,
    role: 'INVESTIGATOR',
    email: 'f.zaidi@fraud-intel.fictional.gov',
    department: 'Real-Time Transaction Monitoring',
    createdAt: '2026-08-15T12:00:00.000Z'
  },
  {
    id: 'usr-cit-1002',
    name: 'Kavita Sundaram (Demo Citizen)',
    accountNumber: 'DEMO100002',
    aadhaarNumber: 'XXXX-XXXX-1002',
    passwordHash: DEFAULT_HASH,
    role: 'CITIZEN',
    email: 'k.sundaram@fictional-demo.local',
    createdAt: '2026-08-20T14:00:00.000Z'
  },
  {
    id: 'usr-cit-1003',
    name: 'Rohan Mehra (Demo Citizen)',
    accountNumber: 'DEMO100003',
    aadhaarNumber: 'XXXX-XXXX-1003',
    passwordHash: DEFAULT_HASH,
    role: 'CITIZEN',
    email: 'r.mehra@fictional-demo.local',
    createdAt: '2026-08-22T15:30:00.000Z'
  },
  {
    id: 'usr-sinv-3002',
    name: 'Sunil Nair (Compliance Officer)',
    accountNumber: 'DEMO300002',
    aadhaarNumber: 'XXXX-XXXX-3002',
    passwordHash: DEFAULT_HASH,
    role: 'SENIOR_INVESTIGATOR',
    email: 's.nair@fraud-intel.fictional.gov',
    department: 'Banking Regulatory Liaison',
    createdAt: '2026-07-01T09:00:00.000Z'
  },
  {
    id: 'usr-cit-1004',
    name: 'Suspicious Entity Watchlist',
    accountNumber: 'DEMO-ACC-2048',
    aadhaarNumber: 'XXXX-XXXX-9999',
    passwordHash: DEFAULT_HASH,
    role: 'CITIZEN',
    email: 'flagged.mule@fictional-demo.local',
    createdAt: '2026-06-15T12:00:00.000Z'
  }
];

export const INITIAL_CASES: CaseRecord[] = [
  {
    id: 'case-1044',
    caseNumber: 'CASE-1044',
    title: 'High-Frequency UPI Siphoning Ring',
    description: 'Coordinated UPI transactions routing through multiple mule accounts within seconds of credit, targeting vulnerable demographics in tier-2 cities.',
    category: 'MULE_ACCOUNT',
    status: 'UNDER_INVESTIGATION',
    riskLevel: 'CRITICAL',
    riskScore: 89,
    targetAccount: 'DEMO-ACC-2048',
    aadhaarRef: 'XXXX-XXXX-9999',
    assignedToId: 'usr-inv-2001',
    assignedToName: 'Vikram Sengupta (Lead Investigator)',
    createdAt: '2026-09-14T08:20:00.000Z',
    updatedAt: '2026-09-18T11:45:00.000Z',
    tags: ['Repeated Account', 'UPI Velocity', 'Mule Network', 'High Priority']
  },
  {
    id: 'case-1021',
    caseNumber: 'CASE-1021',
    title: 'Coordinated Layering via Synthetic Identifiers',
    description: 'Prior investigation involving illicit funds dispersion linked to repeated account DEMO-ACC-2048 and burner mobile devices.',
    category: 'SYNDICATE_LAUNDERING',
    status: 'ESCALATED',
    riskLevel: 'HIGH',
    riskScore: 78,
    targetAccount: 'DEMO-ACC-2048',
    aadhaarRef: 'XXXX-XXXX-9999',
    assignedToId: 'usr-sinv-3001',
    assignedToName: 'Dr. Priya Nambiar (Senior Investigator)',
    createdAt: '2026-09-02T10:15:00.000Z',
    updatedAt: '2026-09-16T14:30:00.000Z',
    tags: ['Syndicate', 'Repeated Account', 'Escalated Review']
  },
  {
    id: 'case-1087',
    caseNumber: 'CASE-1087',
    title: 'Automated Account Takeover & Rapid Dispersal',
    description: 'Compromised credential stuffing attack followed by immediate RTGS outflux to DEMO-ACC-2048.',
    category: 'IDENTITY_THEFT',
    status: 'UNDER_INVESTIGATION',
    riskLevel: 'CRITICAL',
    riskScore: 92,
    targetAccount: 'DEMO-ACC-2048',
    aadhaarRef: 'XXXX-XXXX-9999',
    assignedToId: 'usr-inv-2001',
    assignedToName: 'Vikram Sengupta (Lead Investigator)',
    createdAt: '2026-09-15T16:00:00.000Z',
    updatedAt: '2026-09-18T09:10:00.000Z',
    tags: ['Credential Stuffing', 'Account Takeover', 'Repeated Account']
  },
  {
    id: 'case-1092',
    caseNumber: 'CASE-1092',
    title: 'Anomalous Midnight ATM Cash-Out Burst',
    description: 'Physical ATM card-cloning sequence triggering 12 sequential cash withdrawals across 3 adjacent metro kiosks within 40 minutes.',
    category: 'CARD_CLONING',
    status: 'NEW',
    riskLevel: 'HIGH',
    riskScore: 76,
    targetAccount: 'DEMO-ACC-8812',
    assignedToId: 'usr-inv-2002',
    assignedToName: 'Ananya Sharma (Forensic Analyst)',
    createdAt: '2026-09-17T23:10:00.000Z',
    updatedAt: '2026-09-18T06:00:00.000Z',
    tags: ['ATM Burst', 'Geo Cluster', 'Card Clone']
  },
  {
    id: 'case-1101',
    caseNumber: 'CASE-1101',
    title: 'Telephony SIM-Swap OTP Hijack Pattern',
    description: 'Victim reports sudden carrier disconnection followed by unauthorized ₹2,50,000 net-banking beneficiary addition and transfer.',
    category: 'SIM_SWAP',
    status: 'ASSIGNED',
    riskLevel: 'CRITICAL',
    riskScore: 94,
    targetAccount: 'DEMO-ACC-5531',
    assignedToId: 'usr-inv-2003',
    assignedToName: 'Farhan Zaidi (Risk Analyst)',
    createdAt: '2026-09-18T03:40:00.000Z',
    updatedAt: '2026-09-18T08:15:00.000Z',
    tags: ['SIM Swap', 'Net Banking', 'Critical Risk']
  },
  {
    id: 'case-1105',
    caseNumber: 'CASE-1105',
    title: 'QR Code Reverse-Payment UPI Phishing Campaign',
    description: 'Sophisticated merchant spoofing using misleading refund QR codes to trick consumers into authorizing debit PIN approvals.',
    category: 'UPI_PHISHING',
    status: 'UNDER_INVESTIGATION',
    riskLevel: 'MEDIUM',
    riskScore: 54,
    targetAccount: 'DEMO-ACC-4190',
    assignedToId: 'usr-inv-2001',
    assignedToName: 'Vikram Sengupta (Lead Investigator)',
    createdAt: '2026-09-13T14:10:00.000Z',
    updatedAt: '2026-09-17T18:00:00.000Z',
    tags: ['UPI', 'Social Engineering', 'Active Campaign']
  },
  {
    id: 'case-1065',
    caseNumber: 'CASE-1065',
    title: 'Elderly Citizen Pension Diversion Scheme',
    description: 'Dispute filed regarding forged mandate debiting monthly retirement corpus to proxy savings account.',
    category: 'IDENTITY_THEFT',
    status: 'RESOLVED',
    riskLevel: 'MEDIUM',
    riskScore: 48,
    targetAccount: 'DEMO-ACC-3320',
    assignedToId: 'usr-sinv-3001',
    assignedToName: 'Dr. Priya Nambiar (Senior Investigator)',
    createdAt: '2026-08-25T11:00:00.000Z',
    updatedAt: '2026-09-10T16:00:00.000Z',
    tags: ['Restitution Complete', 'Closed', 'Resolved']
  },
  {
    id: 'case-1070',
    caseNumber: 'CASE-1070',
    title: 'Cross-Border Crypto Off-Ramping Network',
    description: 'Large domestic fund collections routed through P2P crypto exchanges to offshore destinations.',
    category: 'SYNDICATE_LAUNDERING',
    status: 'ESCALATED',
    riskLevel: 'CRITICAL',
    riskScore: 96,
    targetAccount: 'DEMO-ACC-9901',
    assignedToId: 'usr-sinv-3001',
    assignedToName: 'Dr. Priya Nambiar (Senior Investigator)',
    createdAt: '2026-09-08T13:20:00.000Z',
    updatedAt: '2026-09-18T10:00:00.000Z',
    tags: ['Crypto Laundering', 'International Vector', 'Escalated']
  },
  {
    id: 'case-1075',
    caseNumber: 'CASE-1075',
    title: 'Fake Job Placement Deposit Swindle',
    description: 'Victims coerced into depositing registration fees into revolving student accounts.',
    category: 'MULE_ACCOUNT',
    status: 'CLOSED',
    riskLevel: 'LOW',
    riskScore: 28,
    targetAccount: 'DEMO-ACC-1145',
    assignedToId: 'usr-inv-2002',
    assignedToName: 'Ananya Sharma (Forensic Analyst)',
    createdAt: '2026-08-18T09:00:00.000Z',
    updatedAt: '2026-09-01T17:00:00.000Z',
    tags: ['Recovered', 'Closed']
  },
  {
    id: 'case-1080',
    caseNumber: 'CASE-1080',
    title: 'Micro-Loan App Blackmail Extortion Pipeline',
    description: 'Illegal predatory lending app accessing victim contacts and forcing rapid repayment into fragmented accounts.',
    category: 'IDENTITY_THEFT',
    status: 'UNDER_INVESTIGATION',
    riskLevel: 'HIGH',
    riskScore: 72,
    targetAccount: 'DEMO-ACC-6672',
    assignedToId: 'usr-inv-2003',
    assignedToName: 'Farhan Zaidi (Risk Analyst)',
    createdAt: '2026-09-11T15:45:00.000Z',
    updatedAt: '2026-09-17T11:20:00.000Z',
    tags: ['Loan Fraud', 'Extortion Ring', 'Forensics']
  },
  {
    id: 'case-1110',
    caseNumber: 'CASE-1110',
    title: 'POS Terminal Skimming in Luxury Retail Corridor',
    description: 'Compromised merchant POS point-of-sale firmware leaking magnetic stripe payloads.',
    category: 'CARD_CLONING',
    status: 'NEW',
    riskLevel: 'HIGH',
    riskScore: 68,
    targetAccount: 'DEMO-ACC-7821',
    createdAt: '2026-09-18T12:15:00.000Z',
    updatedAt: '2026-09-18T12:15:00.000Z',
    tags: ['POS Skimming', 'Unassigned', 'Retail Alert']
  },
  {
    id: 'case-1112',
    caseNumber: 'CASE-1112',
    title: 'Telecom KYC Proxy Identity Forgery',
    description: 'Forged documents submitted to register 40+ bulk SIM cards used in phishing dialers.',
    category: 'IDENTITY_THEFT',
    status: 'ASSIGNED',
    riskLevel: 'HIGH',
    riskScore: 65,
    targetAccount: 'DEMO-ACC-5120',
    assignedToId: 'usr-inv-2002',
    assignedToName: 'Ananya Sharma (Forensic Analyst)',
    createdAt: '2026-09-16T10:00:00.000Z',
    updatedAt: '2026-09-18T09:30:00.000Z',
    tags: ['KYC Fraud', 'Telecom Link']
  },
  {
    id: 'case-1115',
    caseNumber: 'CASE-1115',
    title: 'Instant Loan Identity Impersonation',
    description: 'Unauthorized digital lending account sanctioned without primary citizen consent.',
    category: 'IDENTITY_THEFT',
    status: 'NEW',
    riskLevel: 'MEDIUM',
    riskScore: 42,
    targetAccount: 'DEMO-ACC-3940',
    createdAt: '2026-09-18T11:00:00.000Z',
    updatedAt: '2026-09-18T11:00:00.000Z',
    tags: ['Identity Impersonation', 'Dispute Pending']
  },
  {
    id: 'case-1120',
    caseNumber: 'CASE-1120',
    title: 'E-Commerce Merchant Refund Manipulation',
    description: 'Syndicate systematically exploiting return window policies to harvest illegitimate return credits.',
    category: 'UPI_PHISHING',
    status: 'UNDER_INVESTIGATION',
    riskLevel: 'MEDIUM',
    riskScore: 50,
    targetAccount: 'DEMO-ACC-2991',
    assignedToId: 'usr-inv-2001',
    assignedToName: 'Vikram Sengupta (Lead Investigator)',
    createdAt: '2026-09-12T16:30:00.000Z',
    updatedAt: '2026-09-17T14:10:00.000Z',
    tags: ['Merchant Fraud', 'Refund Exploit']
  },
  {
    id: 'case-1125',
    caseNumber: 'CASE-1125',
    title: 'Corporate Payroll Diversion via Whaling Spear-Phishing',
    description: 'Impersonation of CFO instructing HR to update salary dispatch coordinates for executive staff.',
    category: 'IDENTITY_THEFT',
    status: 'ESCALATED',
    riskLevel: 'CRITICAL',
    riskScore: 88,
    targetAccount: 'DEMO-ACC-9110',
    assignedToId: 'usr-sinv-3001',
    assignedToName: 'Dr. Priya Nambiar (Senior Investigator)',
    createdAt: '2026-09-10T14:00:00.000Z',
    updatedAt: '2026-09-18T07:45:00.000Z',
    tags: ['Corporate Whaling', 'Spear Phishing', 'High Value']
  },
  {
    id: 'case-1130',
    caseNumber: 'CASE-1130',
    title: 'Government Subsidy Direct Benefit Interception',
    description: 'Unauthorized redirection of agrarian relief payments away from rural beneficiaries.',
    category: 'MULE_ACCOUNT',
    status: 'UNDER_INVESTIGATION',
    riskLevel: 'HIGH',
    riskScore: 74,
    targetAccount: 'DEMO-ACC-8004',
    assignedToId: 'usr-inv-2003',
    assignedToName: 'Farhan Zaidi (Risk Analyst)',
    createdAt: '2026-09-14T11:20:00.000Z',
    updatedAt: '2026-09-18T10:15:00.000Z',
    tags: ['Direct Benefit Transfer', 'Social Audit']
  },
  {
    id: 'case-1135',
    caseNumber: 'CASE-1135',
    title: 'Lottery Prize Phishing SMS Blast',
    description: 'Bulk SMS directing victims to fraudulent banking clone portal asking for net banking OTP.',
    category: 'UPI_PHISHING',
    status: 'RESOLVED',
    riskLevel: 'LOW',
    riskScore: 22,
    targetAccount: 'DEMO-ACC-1082',
    assignedToId: 'usr-inv-2002',
    assignedToName: 'Ananya Sharma (Forensic Analyst)',
    createdAt: '2026-08-30T10:00:00.000Z',
    updatedAt: '2026-09-12T11:00:00.000Z',
    tags: ['SMS Phishing', 'Portal Takedown']
  },
  {
    id: 'case-1140',
    caseNumber: 'CASE-1140',
    title: 'Investment Advisory Ponzi Scheme Collection',
    description: 'Unlicensed Telegram advisory group funneling ₹80L into multiple linked savings accounts.',
    category: 'SYNDICATE_LAUNDERING',
    status: 'UNDER_INVESTIGATION',
    riskLevel: 'CRITICAL',
    riskScore: 91,
    targetAccount: 'DEMO-ACC-6009',
    assignedToId: 'usr-inv-2001',
    assignedToName: 'Vikram Sengupta (Lead Investigator)',
    createdAt: '2026-09-15T09:00:00.000Z',
    updatedAt: '2026-09-18T12:00:00.000Z',
    tags: ['Investment Scam', 'Telegram Syndicate']
  },
  {
    id: 'case-1145',
    caseNumber: 'CASE-1145',
    title: 'Unsolicited Credit Card Dispatch Skim',
    description: 'Courier delivery tampering where replacement cards were intercepted prior to customer receipt.',
    category: 'CARD_CLONING',
    status: 'ASSIGNED',
    riskLevel: 'MEDIUM',
    riskScore: 58,
    targetAccount: 'DEMO-ACC-4491',
    assignedToId: 'usr-inv-2002',
    assignedToName: 'Ananya Sharma (Forensic Analyst)',
    createdAt: '2026-09-17T15:30:00.000Z',
    updatedAt: '2026-09-18T08:00:00.000Z',
    tags: ['Courier Tamper', 'Card Intercept']
  },
  {
    id: 'case-1150',
    caseNumber: 'CASE-1150',
    title: 'Utility Bill Overdue Disconnection Phishing',
    description: 'Automated robocalls threatening electricity blackout and requesting instantaneous UPI transfers.',
    category: 'UPI_PHISHING',
    status: 'NEW',
    riskLevel: 'HIGH',
    riskScore: 69,
    targetAccount: 'DEMO-ACC-7182',
    createdAt: '2026-09-18T12:30:00.000Z',
    updatedAt: '2026-09-18T12:30:00.000Z',
    tags: ['Utility Scam', 'Robocall Threat']
  }
];

// 50+ realistic fictional transactions
export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'txn-89201',
    transactionRef: 'TXN-89201',
    accountNumber: 'DEMO-ACC-2048',
    amount: 148500,
    currency: 'INR',
    location: 'International-Proxy',
    ipAddress: '198.51.100.42',
    deviceId: 'DEV-ANOMALY-ROOTED-88',
    timestamp: '2026-09-18T12:45:00.000Z',
    status: 'FLAGGED',
    riskScore: 92,
    riskLevel: 'CRITICAL',
    riskFactors: [
      'High-value outlier transfer (₹1,48,500) exceeds baseline',
      'Geographic evasion: Routed through proxy/TOR relay',
      'Hardware anomaly: Rooted android kernel with mock location provider',
      'Repeated suspicious association: 3 linked prior fraud cases'
    ],
    channel: 'UPI',
    recipientAccount: 'DEMO-MULE-9901'
  },
  {
    id: 'txn-89202',
    transactionRef: 'TXN-89202',
    accountNumber: 'DEMO-ACC-2048',
    amount: 98000,
    currency: 'INR',
    location: 'International-Proxy',
    ipAddress: '198.51.100.42',
    deviceId: 'DEV-ANOMALY-ROOTED-88',
    timestamp: '2026-09-18T12:43:10.000Z',
    status: 'FLAGGED',
    riskScore: 88,
    riskLevel: 'CRITICAL',
    riskFactors: [
      'Velocity burst: 4 rapid fund transfers within 8 minutes',
      'Unrecognized client hardware footprint',
      'Prior open investigation CASE-1044 association'
    ],
    channel: 'UPI',
    recipientAccount: 'DEMO-MULE-9902'
  },
  {
    id: 'txn-89203',
    transactionRef: 'TXN-89203',
    accountNumber: 'DEMO100001',
    amount: 3200,
    currency: 'INR',
    location: 'Mumbai, MH',
    ipAddress: '49.36.128.11',
    deviceId: 'DEV-PATEL-PIXEL-7',
    timestamp: '2026-09-18T12:35:00.000Z',
    status: 'COMPLETED',
    riskScore: 12,
    riskLevel: 'LOW',
    riskFactors: ['Normal grocery retail transaction within usual spending radius'],
    channel: 'POS',
    recipientAccount: 'MERCHANT-GROCERY-01'
  },
  {
    id: 'txn-89204',
    transactionRef: 'TXN-89204',
    accountNumber: 'DEMO100001',
    amount: 1540,
    currency: 'INR',
    location: 'Mumbai, MH',
    ipAddress: '49.36.128.11',
    deviceId: 'DEV-PATEL-PIXEL-7',
    timestamp: '2026-09-18T11:20:00.000Z',
    status: 'COMPLETED',
    riskScore: 9,
    riskLevel: 'LOW',
    riskFactors: ['Standard utility bill settlement'],
    channel: 'NET_BANKING',
    recipientAccount: 'MSEB-ELECTRICITY'
  },
  {
    id: 'txn-89205',
    transactionRef: 'TXN-89205',
    accountNumber: 'DEMO-ACC-5531',
    amount: 250000,
    currency: 'INR',
    location: 'Noida, UP',
    ipAddress: '103.211.55.90',
    deviceId: 'DEV-NEW-CHROME-WIN11',
    timestamp: '2026-09-18T03:38:00.000Z',
    status: 'FLAGGED',
    riskScore: 94,
    riskLevel: 'CRITICAL',
    riskFactors: [
      'Anomalous transfer value: ₹2,50,000 maximum daily threshold reached',
      'Unusual time of day: 03:38 AM off-hours activity',
      'SIM-swap event reported 15 minutes prior to transaction'
    ],
    channel: 'NET_BANKING',
    recipientAccount: 'DEMO-ACC-8004'
  },
  {
    id: 'txn-89206',
    transactionRef: 'TXN-89206',
    accountNumber: 'DEMO-ACC-8812',
    amount: 20000,
    currency: 'INR',
    location: 'Kolkata, WB',
    ipAddress: '117.200.12.5',
    deviceId: 'ATM-KOL-METRO-04',
    timestamp: '2026-09-17T23:08:00.000Z',
    status: 'FLAGGED',
    riskScore: 78,
    riskLevel: 'HIGH',
    riskFactors: [
      'Rapid ATM withdrawal sequence: Consecutive maximum limit withdrawals',
      'Multiple PIN fallback attempts flagged prior to success'
    ],
    channel: 'ATM'
  },
  {
    id: 'txn-89207',
    transactionRef: 'TXN-89207',
    accountNumber: 'DEMO-ACC-8812',
    amount: 20000,
    currency: 'INR',
    location: 'Kolkata, WB',
    ipAddress: '117.200.12.6',
    deviceId: 'ATM-KOL-METRO-05',
    timestamp: '2026-09-17T23:14:00.000Z',
    status: 'FLAGGED',
    riskScore: 82,
    riskLevel: 'CRITICAL',
    riskFactors: [
      'Immediate subsequent ATM cash withdrawal at adjacent terminal',
      'Card cloning pattern matches active syndicated profile'
    ],
    channel: 'ATM'
  },
  {
    id: 'txn-89208',
    transactionRef: 'TXN-89208',
    accountNumber: 'DEMO100002',
    amount: 4500,
    currency: 'INR',
    location: 'Bengaluru, KA',
    ipAddress: '106.51.34.88',
    deviceId: 'DEV-SUNDARAM-IOS-17',
    timestamp: '2026-09-18T10:15:00.000Z',
    status: 'COMPLETED',
    riskScore: 14,
    riskLevel: 'LOW',
    riskFactors: ['Trusted merchant payment, biometric authenticated'],
    channel: 'UPI',
    recipientAccount: 'MERCHANT-COFFEE-BLR'
  },
  {
    id: 'txn-89209',
    transactionRef: 'TXN-89209',
    accountNumber: 'DEMO-ACC-4190',
    amount: 49999,
    currency: 'INR',
    location: 'Jaipur, RJ',
    ipAddress: '14.139.240.18',
    deviceId: 'DEV-ANOMALY-SPOOF-01',
    timestamp: '2026-09-18T09:40:00.000Z',
    status: 'UNDER_REVIEW',
    riskScore: 56,
    riskLevel: 'MEDIUM',
    riskFactors: [
      'Just below mandatory reporting threshold ₹50,000 structuring pattern',
      'Reverse QR code refund scam vector indicated'
    ],
    channel: 'UPI',
    recipientAccount: 'DEMO-ACC-2048'
  },
  {
    id: 'txn-89210',
    transactionRef: 'TXN-89210',
    accountNumber: 'DEMO-ACC-9901',
    amount: 350000,
    currency: 'INR',
    location: 'Border-Cluster',
    ipAddress: '185.220.101.5',
    deviceId: 'DEV-LINUX-P2P-NODE',
    timestamp: '2026-09-18T08:10:00.000Z',
    status: 'FLAGGED',
    riskScore: 95,
    riskLevel: 'CRITICAL',
    riskFactors: [
      'High-risk crypto gateway interaction detected',
      'Tor exit node origin IP address',
      'Escalated case CASE-1070 direct link'
    ],
    channel: 'NET_BANKING',
    recipientAccount: 'CRYPTO-ESCROW-V1'
  },
  {
    id: 'txn-89211',
    transactionRef: 'TXN-89211',
    accountNumber: 'DEMO100003',
    amount: 850,
    currency: 'INR',
    location: 'Delhi, DL',
    ipAddress: '122.161.45.10',
    deviceId: 'DEV-ROHAN-ONEPLUS',
    timestamp: '2026-09-18T07:50:00.000Z',
    status: 'COMPLETED',
    riskScore: 8,
    riskLevel: 'LOW',
    riskFactors: ['Metro rail recharge'],
    channel: 'UPI',
    recipientAccount: 'DMRC-SMARTCARD'
  },
  {
    id: 'txn-89212',
    transactionRef: 'TXN-89212',
    accountNumber: 'DEMO-ACC-6009',
    amount: 180000,
    currency: 'INR',
    location: 'Surat, GJ',
    ipAddress: '125.19.44.7',
    deviceId: 'DEV-SURAT-MACBOOK',
    timestamp: '2026-09-18T06:20:00.000Z',
    status: 'FLAGGED',
    riskScore: 84,
    riskLevel: 'CRITICAL',
    riskFactors: [
      'High transaction frequency in short bursts',
      'Linked to multi-tier investment Ponzi group',
      'Dispersal into 8 fragmented student accounts'
    ],
    channel: 'NET_BANKING',
    recipientAccount: 'DEMO-ACC-1145'
  },
  {
    id: 'txn-89213',
    transactionRef: 'TXN-89213',
    accountNumber: 'DEMO-ACC-7182',
    amount: 14200,
    currency: 'INR',
    location: 'Patna, BR',
    ipAddress: '27.57.189.2',
    deviceId: 'DEV-REDMI-UNVERIFIED',
    timestamp: '2026-09-18T05:15:00.000Z',
    status: 'UNDER_REVIEW',
    riskScore: 68,
    riskLevel: 'HIGH',
    riskFactors: [
      'Electricity overdue phishing trigger reported by customer',
      'Payee account marked under watch'
    ],
    channel: 'UPI',
    recipientAccount: 'DEMO-ACC-2048'
  },
  {
    id: 'txn-89214',
    transactionRef: 'TXN-89214',
    accountNumber: 'DEMO-ACC-7821',
    amount: 67000,
    currency: 'INR',
    location: 'Hyderabad, TS',
    ipAddress: '115.112.80.3',
    deviceId: 'POS-HYD-JEWEL-02',
    timestamp: '2026-09-18T04:40:00.000Z',
    status: 'UNDER_REVIEW',
    riskScore: 64,
    riskLevel: 'HIGH',
    riskFactors: [
      'High-value bullion purchase using magnetic stripe fallback',
      'Cardholder zip code mismatch'
    ],
    channel: 'POS'
  },
  {
    id: 'txn-89215',
    transactionRef: 'TXN-89215',
    accountNumber: 'DEMO-ACC-2048',
    amount: 65000,
    currency: 'INR',
    location: 'International-Proxy',
    ipAddress: '198.51.100.42',
    deviceId: 'DEV-ANOMALY-ROOTED-88',
    timestamp: '2026-09-18T03:10:00.000Z',
    status: 'FLAGGED',
    riskScore: 86,
    riskLevel: 'CRITICAL',
    riskFactors: [
      'Third transfer within 24-hour cycle from high-risk proxy',
      'Account flagged with 7 prior surveillance alerts'
    ],
    channel: 'UPI',
    recipientAccount: 'DEMO-MULE-9903'
  }
];

// Add 36 more realistic procedural transactions to reach 50+ transactions
const CITIES = ['Mumbai, MH', 'Delhi, DL', 'Bengaluru, KA', 'Hyderabad, TS', 'Chennai, TN', 'Kolkata, WB', 'Pune, MH', 'Ahmedabad, GJ', 'Jaipur, RJ', 'Lucknow, UP'];
const CHANNELS: Array<'UPI' | 'NET_BANKING' | 'ATM' | 'POS'> = ['UPI', 'NET_BANKING', 'ATM', 'POS'];

for (let i = 16; i <= 52; i++) {
  const isHighRisk = i % 5 === 0;
  const isMedRisk = i % 3 === 0;
  const score = isHighRisk ? 75 + (i % 20) : isMedRisk ? 38 + (i % 20) : 10 + (i % 15);
  const riskLevel = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 30 ? 'MEDIUM' : 'LOW';
  const amount = isHighRisk ? 60000 + i * 1800 : isMedRisk ? 12000 + i * 400 : 500 + i * 120;
  const city = CITIES[i % CITIES.length];
  const channel = CHANNELS[i % CHANNELS.length];
  const acc = isHighRisk ? (i % 2 === 0 ? 'DEMO-ACC-2048' : `DEMO-ACC-${6000 + i}`) : `DEMO10000${(i % 3) + 1}`;

  INITIAL_TRANSACTIONS.push({
    id: `txn-892${i < 10 ? '0' + i : i}`,
    transactionRef: `TXN-892${i < 10 ? '0' + i : i}`,
    accountNumber: acc,
    amount: Math.round(amount),
    currency: 'INR',
    location: city,
    ipAddress: `49.207.${10 + (i % 80)}.${(i * 7) % 250}`,
    deviceId: `DEV-CLIENT-SIM-${100 + i}`,
    timestamp: new Date(Date.now() - (53 - i) * 22 * 60 * 1000).toISOString(),
    status: riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'FLAGGED' : riskLevel === 'MEDIUM' ? 'UNDER_REVIEW' : 'COMPLETED',
    riskScore: score,
    riskLevel,
    riskFactors: isHighRisk ? [
      'Unusual transaction amount significantly higher than baseline',
      'Velocity burst detected across linked accounts',
      'Hardware signature unverified'
    ] : isMedRisk ? [
      'Moderate transaction spike during non-routine operating hours',
      'Secondary geo-hop flagged'
    ] : ['Standard transaction profile, verified biometric session'],
    channel,
    recipientAccount: `DEMO-BENEFICIARY-${200 + i}`
  });
}

export const INITIAL_ALERTS: AlertRecord[] = [
  {
    id: 'alt-5001',
    alertCode: 'ALT-5001',
    title: 'Repeated Suspicious Account Association',
    type: 'REPEATED_ACCOUNT',
    severity: 'CRITICAL',
    relatedAccount: 'DEMO-ACC-2048',
    relatedTxnRef: 'TXN-89201',
    status: 'INVESTIGATING',
    triggerReason: 'Account DEMO-ACC-2048 appears across 3 independent cases (CASE-1044, CASE-1021, CASE-1087) with 7 historical alerts.',
    occurrenceCount: 7,
    assignedToId: 'usr-inv-2001',
    createdAt: '2026-09-18T12:45:30.000Z'
  },
  {
    id: 'alt-5002',
    alertCode: 'ALT-5002',
    title: 'High Velocity Transfer Burst (4 txns / 8 min)',
    type: 'VELOCITY_SPIKE',
    severity: 'CRITICAL',
    relatedAccount: 'DEMO-ACC-2048',
    relatedTxnRef: 'TXN-89202',
    status: 'NEW',
    triggerReason: 'Sudden high-velocity fund routing through proxy gateway within tight latency window.',
    occurrenceCount: 4,
    assignedToId: 'usr-inv-2001',
    createdAt: '2026-09-18T12:44:00.000Z'
  },
  {
    id: 'alt-5003',
    alertCode: 'ALT-5003',
    title: 'Impossible Travel & Geographic Proxy Node',
    type: 'GEO_ANOMALY',
    severity: 'HIGH',
    relatedAccount: 'DEMO-ACC-5531',
    relatedTxnRef: 'TXN-89205',
    status: 'NEW',
    triggerReason: 'Physical login location shifted 1,400km within 12 minutes of SIM change confirmation.',
    occurrenceCount: 2,
    assignedToId: 'usr-inv-2003',
    createdAt: '2026-09-18T03:40:00.000Z'
  },
  {
    id: 'alt-5004',
    alertCode: 'ALT-5004',
    title: 'Sequential Midnight ATM Cash Out Spikes',
    type: 'UNUSUAL_AMOUNT',
    severity: 'HIGH',
    relatedAccount: 'DEMO-ACC-8812',
    relatedTxnRef: 'TXN-89207',
    status: 'ACKNOWLEDGED',
    triggerReason: 'Successive max-draw limits executed across physical kiosks in Kolkata metro zone.',
    occurrenceCount: 3,
    assignedToId: 'usr-inv-2002',
    createdAt: '2026-09-17T23:15:00.000Z'
  },
  {
    id: 'alt-5005',
    alertCode: 'ALT-5005',
    title: 'Dark Web / Tor Exit Relay Origin Interaction',
    type: 'DEVICE_SPOOF',
    severity: 'CRITICAL',
    relatedAccount: 'DEMO-ACC-9901',
    relatedTxnRef: 'TXN-89210',
    status: 'INVESTIGATING',
    triggerReason: 'Direct connection from confirmed Tor onion proxy to core Net-Banking gateway.',
    occurrenceCount: 5,
    assignedToId: 'usr-sinv-3001',
    createdAt: '2026-09-18T08:12:00.000Z'
  },
  {
    id: 'alt-5006',
    alertCode: 'ALT-5006',
    title: 'Repeated Failed Auth followed by Immediate Limit Draw',
    type: 'FAILED_AUTH',
    severity: 'MEDIUM',
    relatedAccount: 'DEMO-ACC-7182',
    relatedTxnRef: 'TXN-89213',
    status: 'NEW',
    triggerReason: '6 failed MPIN attempts prior to successful transaction via unfamiliar client device.',
    occurrenceCount: 6,
    createdAt: '2026-09-18T05:20:00.000Z'
  },
  {
    id: 'alt-5007',
    alertCode: 'ALT-5007',
    title: 'QR Code Phishing Signature Detected',
    type: 'DEVICE_SPOOF',
    severity: 'MEDIUM',
    relatedAccount: 'DEMO-ACC-4190',
    relatedTxnRef: 'TXN-89209',
    status: 'ACKNOWLEDGED',
    triggerReason: 'Incoming refund request pattern mirrors known phishing campaign payload.',
    occurrenceCount: 2,
    assignedToId: 'usr-inv-2001',
    createdAt: '2026-09-18T09:42:00.000Z'
  },
  {
    id: 'alt-5008',
    alertCode: 'ALT-5008',
    title: 'POS Fallback to Magnetic Stripe on High Value',
    type: 'UNUSUAL_AMOUNT',
    severity: 'HIGH',
    relatedAccount: 'DEMO-ACC-7821',
    relatedTxnRef: 'TXN-89214',
    status: 'NEW',
    triggerReason: 'Chip card downgraded to magnetic swipe at high-risk jewellery POS terminal.',
    occurrenceCount: 1,
    createdAt: '2026-09-18T04:45:00.000Z'
  }
];

export const INITIAL_EVIDENCE: EvidenceRecord[] = [
  {
    id: 'evd-3001',
    evidenceRef: 'EVD-3001',
    caseId: 'case-1044',
    type: 'TRANSACTION_RECORD',
    description: 'UPI transaction log dump demonstrating 4-part rapid dispersion to mule accounts within 480 seconds.',
    fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    uploadedBy: 'Vikram Sengupta (Lead Investigator)',
    timestamp: '2026-09-18T10:15:00.000Z',
    status: 'VERIFIED'
  },
  {
    id: 'evd-3002',
    evidenceRef: 'EVD-3002',
    caseId: 'case-1044',
    type: 'DEVICE_INFO',
    description: 'Hardware telemetry extracting rooted Android OS fingerprints and fake GPS daemon binaries.',
    fileHash: '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
    uploadedBy: 'Ananya Sharma (Forensic Analyst)',
    timestamp: '2026-09-18T11:00:00.000Z',
    status: 'VERIFIED'
  },
  {
    id: 'evd-3003',
    evidenceRef: 'EVD-3003',
    caseId: 'case-1021',
    type: 'LOGIN_EVENT',
    description: 'Cloudflare WAF telemetry matching recurring proxy IP 198.51.100.42 to account DEMO-ACC-2048.',
    fileHash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    uploadedBy: 'Dr. Priya Nambiar (Senior Investigator)',
    timestamp: '2026-09-16T14:40:00.000Z',
    status: 'VERIFIED'
  },
  {
    id: 'evd-3004',
    evidenceRef: 'EVD-3004',
    caseId: 'case-1087',
    type: 'SYSTEM_ALERT',
    description: 'Automated Fraud Engine snapshot showing Risk Score 92/100 and repeated account flags.',
    fileHash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
    uploadedBy: 'Vikram Sengupta (Lead Investigator)',
    timestamp: '2026-09-18T09:20:00.000Z',
    status: 'VERIFIED'
  },
  {
    id: 'evd-3005',
    evidenceRef: 'EVD-3005',
    caseId: 'case-1092',
    type: 'GEO_EVENT',
    description: 'CCTV timestamp alignment with physical ATM transactions at Kolkata Metro kiosks #4 and #5.',
    fileHash: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d',
    uploadedBy: 'Ananya Sharma (Forensic Analyst)',
    timestamp: '2026-09-18T07:15:00.000Z',
    status: 'PENDING_REVIEW'
  }
];

export const INITIAL_NOTES: NoteRecord[] = [
  {
    id: 'nte-4001',
    caseId: 'case-1044',
    authorId: 'usr-inv-2001',
    authorName: 'Vikram Sengupta',
    authorRole: 'Lead Investigator',
    note: 'Repeated association detected: Target account DEMO-ACC-2048 was previously flagged in CASE-1021 and CASE-1087. Recommending immediate review and freeze escalation pending supervisor sign-off.',
    timestamp: '2026-09-18T11:45:00.000Z'
  },
  {
    id: 'nte-4002',
    caseId: 'case-1044',
    authorId: 'usr-inv-2002',
    authorName: 'Ananya Sharma',
    authorRole: 'Forensic Analyst',
    note: 'Device telemetry confirmed spoofed Android IMEI with Magisk root hide scripts. Outbound connection matches proxy server in Netherlands.',
    timestamp: '2026-09-18T11:15:00.000Z'
  },
  {
    id: 'nte-4003',
    caseId: 'case-1021',
    authorId: 'usr-sinv-3001',
    authorName: 'Dr. Priya Nambiar',
    authorRole: 'Senior Investigator',
    note: 'Correlated with Financial Intelligence Unit watchlist bulletin #882. Holding for inter-agency coordination.',
    timestamp: '2026-09-16T14:35:00.000Z'
  },
  {
    id: 'nte-4004',
    caseId: 'case-1087',
    authorId: 'usr-inv-2001',
    authorName: 'Vikram Sengupta',
    authorRole: 'Lead Investigator',
    note: 'Victim confirmed never receiving SMS confirmation until SIM disconnected. Cellular provider requested for cell tower handover logs.',
    timestamp: '2026-09-18T09:15:00.000Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditRecord[] = [
  {
    id: 'aud-7001',
    userName: 'Vikram Sengupta',
    userRole: 'INVESTIGATOR',
    action: 'LOGIN',
    entityType: 'USER',
    entityId: 'usr-inv-2001',
    description: 'Investigator logged in via Account Number DEMO200001 (Two-Factor Biometric Session)',
    timestamp: '2026-09-18T08:30:10.000Z'
  },
  {
    id: 'aud-7002',
    userName: 'Vikram Sengupta',
    userRole: 'INVESTIGATOR',
    action: 'ACCOUNT_REVIEWED',
    entityType: 'ACCOUNT',
    entityId: 'DEMO-ACC-2048',
    description: 'Investigator accessed historical risk profile and repeated case associations for DEMO-ACC-2048',
    timestamp: '2026-09-18T10:10:00.000Z'
  },
  {
    id: 'aud-7003',
    userName: 'Vikram Sengupta',
    userRole: 'INVESTIGATOR',
    action: 'EVIDENCE_ADDED',
    entityType: 'EVIDENCE',
    entityId: 'EVD-3001',
    description: 'Attached verified transaction payload logs to CASE-1044',
    timestamp: '2026-09-18T10:15:20.000Z'
  },
  {
    id: 'aud-7004',
    userName: 'Ananya Sharma',
    userRole: 'INVESTIGATOR',
    action: 'EVIDENCE_ADDED',
    entityType: 'EVIDENCE',
    entityId: 'EVD-3002',
    description: 'Uploaded hardware fingerprint forensic extract to CASE-1044',
    timestamp: '2026-09-18T11:00:15.000Z'
  },
  {
    id: 'aud-7005',
    userName: 'Vikram Sengupta',
    userRole: 'INVESTIGATOR',
    action: 'NOTE_ADDED',
    entityType: 'CASE',
    entityId: 'CASE-1044',
    description: 'Added investigative note regarding repeated account association and recommendation for freeze',
    timestamp: '2026-09-18T11:45:05.000Z'
  },
  {
    id: 'aud-7006',
    userName: 'Rajeshwer Mehra',
    userRole: 'ADMIN',
    action: 'ROLE_CHANGED',
    entityType: 'USER',
    entityId: 'usr-sinv-3002',
    description: 'Updated Sunil Nair to Senior Investigator with approval authority',
    timestamp: '2026-09-18T07:15:00.000Z'
  },
  {
    id: 'aud-7007',
    userName: 'Dr. Priya Nambiar',
    userRole: 'SENIOR_INVESTIGATOR',
    action: 'CASE_ASSIGNED',
    entityType: 'CASE',
    entityId: 'CASE-1092',
    description: 'Assigned ATM burst investigation to Forensic Analyst Ananya Sharma',
    timestamp: '2026-09-18T06:05:00.000Z'
  },
  {
    id: 'aud-7008',
    userName: 'Aarav Patel',
    userRole: 'CITIZEN',
    action: 'LOGIN',
    entityType: 'USER',
    entityId: 'usr-cit-1001',
    description: 'Citizen logged in via Aadhaar Number XXXX-XXXX-1001',
    timestamp: '2026-09-18T06:00:00.000Z'
  }
];

export const INITIAL_NETWORK_NODES: NetworkNode[] = [
  { id: 'acc-2048', label: 'DEMO-ACC-2048 (Flagged)', type: 'ACCOUNT', riskLevel: 'CRITICAL', meta: { totalCases: 3, totalAlerts: 7 } },
  { id: 'acc-9901', label: 'DEMO-MULE-9901', type: 'ACCOUNT', riskLevel: 'HIGH', meta: { receivedAmt: 148500 } },
  { id: 'acc-9902', label: 'DEMO-MULE-9902', type: 'ACCOUNT', riskLevel: 'HIGH', meta: { receivedAmt: 98000 } },
  { id: 'acc-8004', label: 'DEMO-ACC-8004', type: 'ACCOUNT', riskLevel: 'HIGH', meta: { receivedAmt: 250000 } },
  { id: 'dev-root88', label: 'DEV-ANOMALY-ROOTED-88', type: 'DEVICE', riskLevel: 'CRITICAL', meta: { os: 'Android 14 Rooted' } },
  { id: 'ip-proxy42', label: '198.51.100.42 (Tor Relay)', type: 'IP', riskLevel: 'CRITICAL', meta: { isp: 'Host Europe Proxy' } },
  { id: 'txn-89201', label: 'TXN-89201 (₹1,48,500)', type: 'TRANSACTION', riskLevel: 'CRITICAL', meta: { channel: 'UPI' } },
  { id: 'txn-89202', label: 'TXN-89202 (₹98,000)', type: 'TRANSACTION', riskLevel: 'HIGH', meta: { channel: 'UPI' } },
  { id: 'case-1044', label: 'CASE-1044 (UPI Ring)', type: 'CASE', riskLevel: 'CRITICAL', meta: { status: 'UNDER_INVESTIGATION' } },
  { id: 'case-1021', label: 'CASE-1021 (Syndicate)', type: 'CASE', riskLevel: 'HIGH', meta: { status: 'ESCALATED' } },
  { id: 'case-1087', label: 'CASE-1087 (Takeover)', type: 'CASE', riskLevel: 'CRITICAL', meta: { status: 'UNDER_INVESTIGATION' } }
];

export const INITIAL_NETWORK_EDGES: NetworkEdge[] = [
  { id: 'e1', source: 'acc-2048', target: 'txn-89201', label: 'Initiated ₹1,48,500', type: 'INITIATED' },
  { id: 'e2', source: 'txn-89201', target: 'acc-9901', label: 'Transferred To', type: 'TRANSFERRED_TO' },
  { id: 'e3', source: 'acc-2048', target: 'txn-89202', label: 'Initiated ₹98,000', type: 'INITIATED' },
  { id: 'e4', source: 'txn-89202', target: 'acc-9902', label: 'Transferred To', type: 'TRANSFERRED_TO' },
  { id: 'e5', source: 'acc-2048', target: 'dev-root88', label: 'Authorized From Hardware', type: 'AUTHORIZED_ON' },
  { id: 'e6', source: 'dev-root88', target: 'ip-proxy42', label: 'Routed via Relay', type: 'ROUTED_THROUGH' },
  { id: 'e7', source: 'acc-2048', target: 'case-1044', label: 'Primary Target in Case', type: 'TARGET_ACCOUNT' },
  { id: 'e8', source: 'acc-2048', target: 'case-1021', label: 'Repeated Link in Case', type: 'TARGET_ACCOUNT' },
  { id: 'e9', source: 'acc-2048', target: 'case-1087', label: 'Repeated Link in Case', type: 'TARGET_ACCOUNT' },
  { id: 'e10', source: 'dev-root88', target: 'case-1044', label: 'Forensic Hardware Evidence', type: 'EVIDENCE_LINK' }
];

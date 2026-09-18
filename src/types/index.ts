export type Role = 'CITIZEN' | 'INVESTIGATOR' | 'SENIOR_INVESTIGATOR' | 'ADMIN';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CaseStatus = 'NEW' | 'ASSIGNED' | 'UNDER_INVESTIGATION' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';

export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  accountNumber: string;
  aadhaarNumber: string;
  role: Role;
  department?: string;
  phone?: string;
}

export interface Transaction {
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
  riskLevel: RiskLevel;
  riskFactors: string[];
  channel: 'UPI' | 'NET_BANKING' | 'ATM' | 'POS';
  recipientAccount?: string;
}

export interface FraudCase {
  id: string;
  caseNumber: string;
  title: string;
  description: string;
  category: 'MULE_ACCOUNT' | 'IDENTITY_THEFT' | 'UPI_PHISHING' | 'CARD_CLONING' | 'SYNDICATE_LAUNDERING' | 'SIM_SWAP';
  status: CaseStatus;
  riskLevel: RiskLevel;
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
  transactions?: Transaction[];
  notes?: CaseNote[];
  evidence?: CaseEvidence[];
  alerts?: AlertItem[];
  isRepeatedAccount?: boolean;
  repeatedCaseCount?: number;
  repeatedCases?: { id: string; caseNumber: string; title: string; status: string }[];
  isFreezeRecommended?: boolean;
}

export interface CaseNote {
  id: string;
  caseId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  note: string;
  timestamp: string;
}

export interface CaseEvidence {
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

export interface AlertItem {
  id: string;
  alertCode: string;
  title: string;
  type: 'VELOCITY_SPIKE' | 'GEO_ANOMALY' | 'UNUSUAL_AMOUNT' | 'REPEATED_ACCOUNT' | 'DEVICE_SPOOF' | 'FAILED_AUTH';
  severity: RiskLevel;
  relatedAccount: string;
  relatedTxnRef?: string;
  status: AlertStatus;
  triggerReason: string;
  occurrenceCount: number;
  assignedToId?: string;
  createdAt: string;
  timestamp?: string;
}

export type SystemAlert = AlertItem;

export interface AuditLogItem {
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

export interface DashboardStats {
  totalCases: number;
  newCases: number;
  underInvestigation: number;
  highRisk: number;
  critical: number;
  escalated: number;
  resolved: number;
  unassigned: number;
  totalTransactions: number;
  flaggedTransactions: number;
  activeAlerts: number;
}

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {
  INITIAL_USERS,
  INITIAL_CASES,
  INITIAL_TRANSACTIONS,
  INITIAL_ALERTS,
  INITIAL_EVIDENCE,
  INITIAL_NOTES,
  INITIAL_AUDIT_LOGS,
  INITIAL_NETWORK_NODES,
  INITIAL_NETWORK_EDGES,
  UserRecord,
  CaseRecord,
  TransactionRecord,
  AlertRecord,
  EvidenceRecord,
  NoteRecord,
  AuditRecord,
  NetworkNode,
  NetworkEdge
} from '../data/demoData';
import { evaluateFraudRisk, FraudEvaluationInput } from './fraudEngine';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-fraud-jwt-secret-key-32-chars-long';

class PlatformStore {
  private users: UserRecord[] = [...INITIAL_USERS];
  private cases: CaseRecord[] = [...INITIAL_CASES];
  private transactions: TransactionRecord[] = [...INITIAL_TRANSACTIONS];
  private alerts: AlertRecord[] = [...INITIAL_ALERTS];
  private evidence: EvidenceRecord[] = [...INITIAL_EVIDENCE];
  private notes: NoteRecord[] = [...INITIAL_NOTES];
  private auditLogs: AuditRecord[] = [...INITIAL_AUDIT_LOGS];
  private networkNodes: NetworkNode[] = [...INITIAL_NETWORK_NODES];
  private networkEdges: NetworkEdge[] = [...INITIAL_NETWORK_EDGES];

  // Frozen accounts record
  private recommendedFreezeAccounts: Set<string> = new Set(['DEMO-ACC-2048']);

  constructor() {
    console.log('[Store] Initialized with demo records: 10 users, 20 cases, 50+ transactions, 8 alerts, 5 evidence, 4 notes, 8 audits');
  }

  // Auth: find user by Account Number OR Aadhaar Number
  public findUserByIdentity(identity: string): UserRecord | undefined {
    const clean = identity.trim().toUpperCase();
    return this.users.find(u => {
      const accMatch = u.accountNumber.toUpperCase() === clean;
      const aadhaarRawMatch = u.aadhaarNumber.toUpperCase() === clean;
      // Also allow clean without hyphens e.g. "XXXXXXXX1001" or "XXXX-XXXX-1001"
      const cleanNoDash = clean.replace(/[-\s]/g, '');
      const userAadhaarNoDash = u.aadhaarNumber.replace(/[-\s]/g, '').toUpperCase();
      const aadhaarNormalizedMatch = cleanNoDash.length >= 8 && cleanNoDash === userAadhaarNoDash;

      return accMatch || aadhaarRawMatch || aadhaarNormalizedMatch;
    });
  }

  public authenticate(identity: string, passwordAttempt: string) {
    const user = this.findUserByIdentity(identity);
    if (!user) {
      return null;
    }

    const isValid = bcrypt.compareSync(passwordAttempt, user.passwordHash);
    if (!isValid) {
      return null;
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,
        accountNumber: user.accountNumber,
        aadhaarNumber: user.aadhaarNumber
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    this.recordAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: user.id,
      description: `Authenticated successfully via ${identity.includes('-') || identity.length === 12 ? 'Aadhaar' : 'Account Number'}`
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountNumber: user.accountNumber,
        aadhaarNumber: user.aadhaarNumber,
        role: user.role,
        department: user.department,
        phone: user.phone
      }
    };
  }

  public verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET) as any;
    } catch {
      return null;
    }
  }

  public registerCitizen(data: { name: string; accountNumber: string; aadhaarNumber: string; password: string; email?: string }) {
    const exists = this.findUserByIdentity(data.accountNumber) || this.findUserByIdentity(data.aadhaarNumber);
    if (exists) {
      throw new Error('Account number or Aadhaar number already registered');
    }

    const newUser: UserRecord = {
      id: `usr-cit-${Date.now()}`,
      name: data.name,
      accountNumber: data.accountNumber.trim().toUpperCase(),
      aadhaarNumber: data.aadhaarNumber.trim().toUpperCase(),
      passwordHash: bcrypt.hashSync(data.password, 8),
      role: 'CITIZEN',
      email: data.email || `${data.accountNumber.toLowerCase()}@fictional-demo.local`,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);

    // Seed realistic initial transactions for the newly registered citizen
    const initialSamples = [
      {
        channel: 'UPI' as const,
        location: 'Bengaluru, KA',
        amount: 3250,
        status: 'COMPLETED' as const,
        riskScore: 14,
        riskLevel: 'LOW' as const,
        factors: ['Known device', 'Domestic merchant retail payment']
      },
      {
        channel: 'UPI' as const,
        location: 'Mumbai, MH',
        amount: 67500,
        status: 'FLAGGED' as const,
        riskScore: 79,
        riskLevel: 'HIGH' as const,
        factors: ['High amount transaction', 'Unusual night time velocity', 'New counterparty VPA']
      },
      {
        channel: 'NET_BANKING' as const,
        location: 'Delhi, DL',
        amount: 14200,
        status: 'COMPLETED' as const,
        riskScore: 18,
        riskLevel: 'LOW' as const,
        factors: ['Scheduled utility bill debit']
      },
      {
        channel: 'ATM' as const,
        location: 'Bengaluru, KA',
        amount: 5000,
        status: 'COMPLETED' as const,
        riskScore: 9,
        riskLevel: 'LOW' as const,
        factors: ['Bio-metric / Chip verified ATM cash withdrawal']
      }
    ];

    initialSamples.forEach((sample, idx) => {
      this.transactions.unshift({
        id: `txn-init-${newUser.id}-${idx}`,
        transactionRef: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
        accountNumber: newUser.accountNumber,
        amount: sample.amount,
        currency: 'INR',
        location: sample.location,
        ipAddress: '49.36.128.88',
        deviceId: 'DEV-ANDROID-CLIENT',
        timestamp: new Date(Date.now() - (idx + 1) * 3600 * 1000 * 3).toISOString(),
        status: sample.status,
        riskScore: sample.riskScore,
        riskLevel: sample.riskLevel,
        riskFactors: sample.factors,
        channel: sample.channel
      });
    });

    this.recordAudit({
      userId: newUser.id,
      userName: newUser.name,
      userRole: newUser.role,
      action: 'LOGIN',
      entityType: 'USER',
      entityId: newUser.id,
      description: `Registered new citizen demo account: ${newUser.accountNumber}`
    });

    return this.authenticate(newUser.accountNumber, data.password);
  }

  // Dashboard KPI metrics
  public getDashboardStats() {
    const totalCases = this.cases.length;
    const newCases = this.cases.filter(c => c.status === 'NEW').length;
    const underInvestigation = this.cases.filter(c => c.status === 'UNDER_INVESTIGATION').length;
    const highRisk = this.cases.filter(c => c.riskLevel === 'HIGH').length;
    const critical = this.cases.filter(c => c.riskLevel === 'CRITICAL').length;
    const escalated = this.cases.filter(c => c.status === 'ESCALATED').length;
    const resolved = this.cases.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const unassigned = this.cases.filter(c => !c.assignedToId).length;

    return {
      totalCases,
      newCases,
      underInvestigation,
      highRisk,
      critical,
      escalated,
      resolved,
      unassigned,
      totalTransactions: this.transactions.length,
      flaggedTransactions: this.transactions.filter(t => t.status === 'FLAGGED').length,
      activeAlerts: this.alerts.filter(a => a.status === 'NEW' || a.status === 'INVESTIGATING').length
    };
  }

  // Cases Management
  public getCases(filters?: { status?: string; riskLevel?: string; category?: string; query?: string; account?: string; assignedTo?: string; citizenOnly?: boolean }) {
    let result = [...this.cases];
    if (filters?.account) {
      const cleanAcc = filters.account.trim().toUpperCase();
      result = result.filter(c =>
        c.targetAccount.toUpperCase() === cleanAcc ||
        (c.complainantAccount && c.complainantAccount.toUpperCase() === cleanAcc) ||
        (c.aadhaarRef && c.aadhaarRef.toUpperCase() === cleanAcc)
      );
    }
    if (filters?.citizenOnly) {
      result = result.filter(c => !!c.complainantName);
    }
    if (filters?.assignedTo && filters.assignedTo !== 'ALL') {
      const assignedId = filters.assignedTo;
      result = result.filter(c => c.assignedToId === assignedId || c.seniorReviewerId === assignedId);
    }
    if (filters?.status && filters.status !== 'ALL') {
      result = result.filter(c => c.status === filters.status);
    }
    if (filters?.riskLevel && filters.riskLevel !== 'ALL') {
      result = result.filter(c => c.riskLevel === filters.riskLevel);
    }
    if (filters?.category && filters.category !== 'ALL') {
      result = result.filter(c => c.category === filters.category);
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      result = result.filter(c =>
        c.caseNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.targetAccount.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        (c.complainantName && c.complainantName.toLowerCase().includes(q))
      );
    }
    return result;
  }

  // Citizen Complaint Filing & Case Creation
  public createComplaint(data: {
    title?: string;
    description: string;
    category?: CaseRecord['category'];
    disputedTxnRef?: string;
    disputedAmount?: number;
    suspectAccount?: string;
    targetAccount?: string;
    incidentDate?: string;
    desiredOutcome?: string;
    user: { id: string; name: string; role: string; accountNumber: string; aadhaarNumber?: string; phone?: string };
  }): CaseRecord {
    const amount = Number(data.disputedAmount) || 0;
    let baseScore = 68;
    if (amount > 100000) baseScore += 18;
    else if (amount > 25000) baseScore += 10;
    if (data.suspectAccount && this.recommendedFreezeAccounts.has(data.suspectAccount.trim().toUpperCase())) {
      baseScore += 20;
    }
    const riskScore = Math.min(96, Math.max(45, baseScore));
    const riskLevel = riskScore >= 80 ? 'CRITICAL' : riskScore >= 60 ? 'HIGH' : 'MEDIUM';

    const caseNum = `CASE-${Math.floor(2000 + Math.random() * 7999)}`;
    const category = data.category || (data.disputedTxnRef ? 'UPI_PHISHING' : 'MULE_ACCOUNT');

    const targetAccount = data.suspectAccount
      ? data.suspectAccount.trim().toUpperCase()
      : (data.targetAccount ? data.targetAccount.trim().toUpperCase() : data.user.accountNumber);

    const newCase: CaseRecord = {
      id: `case-${Date.now()}`,
      caseNumber: caseNum,
      title: data.title || `Citizen Fraud Grievance: ${category.replace('_', ' ')} (${data.disputedTxnRef || data.user.accountNumber})`,
      description: data.description,
      category: category as any,
      status: 'ASSIGNED',
      riskLevel,
      riskScore,
      targetAccount,
      aadhaarRef: data.user.aadhaarNumber,
      complainantName: data.user.name,
      complainantAccount: data.user.accountNumber,
      complainantPhone: data.user.phone,
      disputedTxnRef: data.disputedTxnRef,
      disputedAmount: amount > 0 ? amount : undefined,
      suspectAccount: data.suspectAccount ? data.suspectAccount.trim().toUpperCase() : undefined,
      incidentDate: data.incidentDate || new Date().toISOString(),
      desiredOutcome: data.desiredOutcome || 'Investigation & Fund Reversal Request',
      assignedToId: 'usr-inv-2001',
      assignedToName: 'Vikram Sengupta (Lead Investigator)',
      seniorReviewerId: 'usr-sinv-3001',
      seniorReviewerName: 'Dr. Priya Nambiar (Senior Investigator)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: ['Citizen-Dispute', category, riskLevel, 'Consumer-Protection-Cell', 'Supervisory-Oversight']
    };

    // Prepend to cases so investigators immediately see it at the top of their dashboard!
    this.cases.unshift(newCase);

    // Add initial citizen log note
    this.notes.unshift({
      id: `nte-${Date.now()}-1`,
      caseId: newCase.id,
      authorId: data.user.id,
      authorName: data.user.name,
      authorRole: 'CITIZEN',
      note: `Formal consumer fraud complaint lodged by ${data.user.name} (Account: ${data.user.accountNumber}). Statement: ${data.description}${data.disputedTxnRef ? ` | Ref: ${data.disputedTxnRef}` : ''}${amount ? ` | Disputed: ₹${amount.toLocaleString()}` : ''}`,
      timestamp: new Date().toISOString()
    });

    // Add system routing & assignment note for forensic record
    this.notes.unshift({
      id: `nte-${Date.now()}-2`,
      caseId: newCase.id,
      authorId: 'usr-sys',
      authorName: 'Cybercrime Central Dispatch Engine',
      authorRole: 'SYSTEM',
      note: `Automatic Incident Triage: Complaint routed to Vikram Sengupta (Lead Investigator, Financial Cybercrime Unit) for transaction tracing, and Dr. Priya Nambiar (Senior Investigator, Directorate of Anti-Syndicate Oversight) for supervisory review and account freeze approval.`,
      timestamp: new Date().toISOString()
    });

    // Auto-generate urgent security alert for the Lead Investigator
    const newAlert: AlertRecord = {
      id: `alt-${Date.now()}`,
      alertCode: `ALT-${Math.floor(5000 + Math.random() * 4999)}`,
      title: `Citizen Fraud Incident Lodged: ${caseNum}`,
      type: 'REPEATED_ACCOUNT',
      severity: riskLevel,
      relatedAccount: targetAccount,
      relatedTxnRef: data.disputedTxnRef,
      status: 'NEW',
      triggerReason: `Citizen ${data.user.name} reported unauthorized activity (${caseNum}): ${data.description.slice(0, 120)}`,
      occurrenceCount: 1,
      assignedToId: 'usr-inv-2001',
      createdAt: new Date().toISOString()
    };
    this.alerts.unshift(newAlert);

    // Auto-generate supervisory alert for Senior Investigator
    const seniorAlert: AlertRecord = {
      id: `alt-sinv-${Date.now()}`,
      alertCode: `ALT-${Math.floor(5000 + Math.random() * 4999)}`,
      title: `Supervisory Oversight: Citizen Dispute ${caseNum}`,
      type: 'VELOCITY_SPIKE',
      severity: riskLevel,
      relatedAccount: targetAccount,
      relatedTxnRef: data.disputedTxnRef,
      status: 'NEW',
      triggerReason: `Citizen ${data.user.name} filed dispute ${caseNum} totaling ₹${amount.toLocaleString()}. Assigned to Lead Investigator Vikram Sengupta under your supervisory sign-off.`,
      occurrenceCount: 1,
      assignedToId: 'usr-sinv-3001',
      createdAt: new Date().toISOString()
    };
    this.alerts.unshift(seniorAlert);

    // Record Immutable Audit Log
    this.recordAudit({
      userId: data.user.id,
      userName: data.user.name,
      userRole: data.user.role,
      action: 'CITIZEN_COMPLAINT_FILED',
      entityType: 'CASE',
      entityId: newCase.id,
      description: `Citizen ${data.user.name} filed dispute ${caseNum} against account ${targetAccount}. Severity: ${riskLevel} (${riskScore}/100). Auto-assigned to Lead Investigator Vikram Sengupta & Senior Investigator Dr. Priya Nambiar.`
    });

    return newCase;
  }

  // Get all cases filed by or related to a citizen
  public getCitizenComplaints(accountNumberOrAadhaar: string) {
    const clean = accountNumberOrAadhaar.trim().toUpperCase();
    return this.cases.filter(c =>
      (c.complainantAccount && c.complainantAccount.toUpperCase() === clean) ||
      c.targetAccount.toUpperCase() === clean ||
      (c.aadhaarRef && c.aadhaarRef.toUpperCase() === clean)
    );
  }

  public getCaseById(idOrNumber: string) {
    const foundCase = this.cases.find(c => c.id === idOrNumber || c.caseNumber === idOrNumber);
    if (!foundCase) return null;

    const caseTransactions = this.transactions.filter(t =>
      t.accountNumber === foundCase.targetAccount ||
      (foundCase.complainantAccount && t.accountNumber === foundCase.complainantAccount) ||
      (foundCase.disputedTxnRef && t.transactionRef === foundCase.disputedTxnRef)
    );
    const caseNotes = this.notes.filter(n => n.caseId === foundCase.id);
    const caseEvidence = this.evidence.filter(e => e.caseId === foundCase.id);
    const caseAlerts = this.alerts.filter(a =>
      a.relatedAccount === foundCase.targetAccount ||
      (foundCase.complainantAccount && a.relatedAccount === foundCase.complainantAccount) ||
      (foundCase.disputedTxnRef && a.relatedTxnRef === foundCase.disputedTxnRef)
    );

    // Repeated account check
    const repeatedCases = this.cases.filter(c => c.targetAccount === foundCase.targetAccount);
    const isRepeatedAccount = repeatedCases.length > 1;

    return {
      ...foundCase,
      transactions: caseTransactions,
      notes: caseNotes,
      evidence: caseEvidence,
      alerts: caseAlerts,
      isRepeatedAccount,
      repeatedCaseCount: repeatedCases.length,
      repeatedCases: repeatedCases.map(c => ({ id: c.id, caseNumber: c.caseNumber, title: c.title, status: c.status })),
      isFreezeRecommended: this.recommendedFreezeAccounts.has(foundCase.targetAccount)
    };
  }

  public updateCaseStatus(caseId: string, status: CaseRecord['status'], updatedBy: { name: string; role: string; id: string }) {
    const c = this.cases.find(item => item.id === caseId || item.caseNumber === caseId);
    if (!c) return null;

    const oldStatus = c.status;
    c.status = status;
    c.updatedAt = new Date().toISOString();

    this.recordAudit({
      userId: updatedBy.id,
      userName: updatedBy.name,
      userRole: updatedBy.role,
      action: 'CASE_UPDATED',
      entityType: 'CASE',
      entityId: c.caseNumber,
      description: `Updated status of ${c.caseNumber} from ${oldStatus} to ${status}`
    });

    return c;
  }

  public assignCase(caseId: string, investigatorId: string, assignedBy: { name: string; role: string; id: string }) {
    const c = this.cases.find(item => item.id === caseId || item.caseNumber === caseId);
    const investigator = this.users.find(u => u.id === investigatorId);
    if (!c || !investigator) return null;

    c.assignedToId = investigator.id;
    c.assignedToName = investigator.name;
    c.updatedAt = new Date().toISOString();
    if (c.status === 'NEW') c.status = 'ASSIGNED';

    this.recordAudit({
      userId: assignedBy.id,
      userName: assignedBy.name,
      userRole: assignedBy.role,
      action: 'CASE_ASSIGNED',
      entityType: 'CASE',
      entityId: c.caseNumber,
      description: `Assigned case ${c.caseNumber} to ${investigator.name}`
    });

    return c;
  }

  public addNote(caseId: string, noteText: string, author: { id: string; name: string; role: string }) {
    const targetCase = this.cases.find(c => c.id === caseId || c.caseNumber === caseId);
    if (!targetCase) throw new Error('Case not found');

    const newNote: NoteRecord = {
      id: `nte-${Date.now()}`,
      caseId: targetCase.id,
      authorId: author.id,
      authorName: author.name,
      authorRole: author.role,
      note: noteText,
      timestamp: new Date().toISOString()
    };

    this.notes.unshift(newNote);

    this.recordAudit({
      userId: author.id,
      userName: author.name,
      userRole: author.role,
      action: 'NOTE_ADDED',
      entityType: 'CASE',
      entityId: targetCase.caseNumber,
      description: `Added investigation note to ${targetCase.caseNumber}`
    });

    return newNote;
  }

  public addEvidence(caseId: string, data: { type: EvidenceRecord['type']; description: string; fileHash?: string }, uploader: { id: string; name: string; role: string }) {
    const targetCase = this.cases.find(c => c.id === caseId || c.caseNumber === caseId);
    if (!targetCase) throw new Error('Case not found');

    const newEvidence: EvidenceRecord = {
      id: `evd-${Date.now()}`,
      evidenceRef: `EVD-${Math.floor(1000 + Math.random() * 9000)}`,
      caseId: targetCase.id,
      type: data.type,
      description: data.description,
      fileHash: data.fileHash || Math.random().toString(36).substring(2) + Date.now().toString(16),
      uploadedBy: uploader.name,
      timestamp: new Date().toISOString(),
      status: 'VERIFIED'
    };

    this.evidence.unshift(newEvidence);

    this.recordAudit({
      userId: uploader.id,
      userName: uploader.name,
      userRole: uploader.role,
      action: 'EVIDENCE_ADDED',
      entityType: 'EVIDENCE',
      entityId: newEvidence.evidenceRef,
      description: `Uploaded evidence record ${newEvidence.evidenceRef} to ${targetCase.caseNumber}`
    });

    return newEvidence;
  }

  // Transactions Management & Real-time simulation
  public getTransactions(limit = 100, filterAccount?: string) {
    let list = [...this.transactions];
    if (filterAccount) {
      list = list.filter(t => t.accountNumber === filterAccount);
    }
    return list.slice(0, limit);
  }

  public addTransaction(input: FraudEvaluationInput) {
    // Check prior stats for this account
    const priorCases = this.cases.filter(c => c.targetAccount === input.accountNumber).length;
    const priorAlerts = this.alerts.filter(a => a.relatedAccount === input.accountNumber).length;
    const recentTxns = this.transactions.filter(t => t.accountNumber === input.accountNumber);

    const evaluation = evaluateFraudRisk({
      ...input,
      priorCaseCount: priorCases,
      priorAlertCount: priorAlerts,
      recentTxnCount: recentTxns.slice(0, 5).length
    });

    const newTxn: TransactionRecord = {
      id: `txn-${Date.now()}`,
      transactionRef: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      accountNumber: input.accountNumber,
      amount: input.amount,
      currency: 'INR',
      location: input.location,
      ipAddress: input.ipAddress || '49.36.128.44',
      deviceId: input.deviceId,
      timestamp: new Date().toISOString(),
      status: evaluation.status,
      riskScore: evaluation.riskScore,
      riskLevel: evaluation.riskLevel,
      riskFactors: evaluation.reasons,
      channel: input.channel as any
    };

    this.transactions.unshift(newTxn);

    // If critical/high risk, auto-generate alert (with deduplication)
    if (evaluation.riskLevel === 'CRITICAL' || evaluation.riskLevel === 'HIGH') {
      const existingAlert = this.alerts.find(a => a.relatedAccount === input.accountNumber && a.status === 'NEW');
      if (existingAlert) {
        existingAlert.occurrenceCount += 1;
        existingAlert.triggerReason = `${existingAlert.occurrenceCount} repeated anomalies detected for account: ${evaluation.reasons[0] || 'High Risk Trigger'}`;
      } else {
        const newAlert: AlertRecord = {
          id: `alt-${Date.now()}`,
          alertCode: `ALT-${Math.floor(5000 + Math.random() * 4999)}`,
          title: `${evaluation.riskLevel} Risk Anomaly Detected`,
          type: evaluation.riskScore >= 85 ? 'VELOCITY_SPIKE' : 'UNUSUAL_AMOUNT',
          severity: evaluation.riskLevel,
          relatedAccount: input.accountNumber,
          relatedTxnRef: newTxn.transactionRef,
          status: 'NEW',
          triggerReason: evaluation.reasons.join(' | '),
          occurrenceCount: 1,
          createdAt: new Date().toISOString()
        };
        this.alerts.unshift(newAlert);
      }
    }

    return { transaction: newTxn, evaluation };
  }

  // Alerts Management
  public getAlerts() {
    return this.alerts;
  }

  public updateAlertStatus(alertId: string, status: AlertRecord['status']) {
    const alert = this.alerts.find(a => a.id === alertId || a.alertCode === alertId);
    if (alert) {
      alert.status = status;
    }
    return alert;
  }

  // Evidence
  public getEvidence(caseId?: string) {
    if (caseId) {
      return this.evidence.filter(e => e.caseId === caseId);
    }
    return this.evidence;
  }

  // Repeated Account Association Detection
  public getRepeatedAccountIntelligence(accountNumber: string) {
    const clean = accountNumber.trim().toUpperCase();
    const associatedCases = this.cases.filter(c => c.targetAccount.toUpperCase() === clean);
    const associatedAlerts = this.alerts.filter(a => a.relatedAccount.toUpperCase() === clean);
    const associatedTxns = this.transactions.filter(t => t.accountNumber.toUpperCase() === clean);
    const isRecommendedFrozen = this.recommendedFreezeAccounts.has(clean);

    const totalVolume = associatedTxns.reduce((sum, t) => sum + t.amount, 0);
    const highestRiskTxn = associatedTxns.reduce((max, t) => t.riskScore > max ? t.riskScore : max, 0);

    return {
      accountNumber: clean,
      isRepeated: associatedCases.length > 1 || associatedAlerts.length >= 3,
      caseCount: associatedCases.length,
      cases: associatedCases.map(c => ({
        id: c.id,
        caseNumber: c.caseNumber,
        title: c.title,
        status: c.status,
        riskLevel: c.riskLevel,
        createdAt: c.createdAt
      })),
      alertCount: associatedAlerts.reduce((sum, a) => sum + a.occurrenceCount, 0),
      alerts: associatedAlerts,
      totalTransactionVolume: totalVolume,
      highestRiskScore: highestRiskTxn,
      currentRiskLevel: highestRiskTxn >= 80 ? 'CRITICAL' : highestRiskTxn >= 60 ? 'HIGH' : 'MEDIUM',
      isFreezeRecommended: isRecommendedFrozen,
      actionsAvailable: ['REVIEW_ACCOUNT', 'RECOMMEND_FREEZE', 'ESCALATE_FOR_REVIEW']
    };
  }

  public recommendAccountFreeze(accountNumber: string, reason: string, investigator: { id: string; name: string; role: string }) {
    const clean = accountNumber.trim().toUpperCase();
    this.recommendedFreezeAccounts.add(clean);

    this.recordAudit({
      userId: investigator.id,
      userName: investigator.name,
      userRole: investigator.role,
      action: 'ACCOUNT_FREEZE_RECOMMENDED',
      entityType: 'ACCOUNT',
      entityId: clean,
      description: `Investigator recommended account ${clean} for freeze review. Reason: ${reason}`
    });

    return {
      success: true,
      accountNumber: clean,
      status: 'FREEZE_RECOMMENDED',
      message: `Account ${clean} has been successfully flagged for supervisor freeze authorization.`
    };
  }

  // Network Graph
  public getNetworkGraph() {
    return {
      nodes: this.networkNodes,
      edges: this.networkEdges
    };
  }

  // Audit Logs
  public getAuditLogs(limit = 100) {
    return this.auditLogs.slice(0, limit);
  }

  public recordAudit(record: Omit<AuditRecord, 'id' | 'timestamp'>) {
    const log: AuditRecord = {
      ...record,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
    return log;
  }

  // Analytics & Risk Intelligence
  public getAnalytics() {
    // Risk score distribution
    const riskDist = [
      { name: 'Low (0-29)', count: this.transactions.filter(t => t.riskScore < 30).length, fill: '#22c55e' },
      { name: 'Medium (30-59)', count: this.transactions.filter(t => t.riskScore >= 30 && t.riskScore < 60).length, fill: '#eab308' },
      { name: 'High (60-79)', count: this.transactions.filter(t => t.riskScore >= 60 && t.riskScore < 80).length, fill: '#f97316' },
      { name: 'Critical (80-100)', count: this.transactions.filter(t => t.riskScore >= 80).length, fill: '#ef4444' }
    ];

    // Fraud Category Distribution
    const categoryCount: Record<string, number> = {};
    for (const c of this.cases) {
      categoryCount[c.category] = (categoryCount[c.category] || 0) + 1;
    }
    const categoryDist = Object.entries(categoryCount).map(([cat, count]) => ({
      name: cat.replace('_', ' '),
      category: cat,
      count,
      pct: Math.round((count / Math.max(1, this.cases.length)) * 100)
    }));

    // Status Distribution
    const statusCount: Record<string, number> = {};
    for (const c of this.cases) {
      statusCount[c.status] = (statusCount[c.status] || 0) + 1;
    }
    const statusDist = Object.entries(statusCount).map(([status, count]) => ({
      name: status.replace('_', ' '),
      status,
      count
    }));

    // Channel Distribution
    const channelCount: Record<string, { count: number; volume: number; flagged: number }> = {};
    for (const t of this.transactions) {
      if (!channelCount[t.channel]) {
        channelCount[t.channel] = { count: 0, volume: 0, flagged: 0 };
      }
      channelCount[t.channel].count += 1;
      channelCount[t.channel].volume += t.amount;
      if (t.status === 'FLAGGED' || t.status === 'BLOCKED') {
        channelCount[t.channel].flagged += 1;
      }
    }
    const channelDist = Object.entries(channelCount).map(([channel, val]) => ({
      channel,
      count: val.count,
      volume: val.volume,
      flagged: val.flagged,
      flagRate: Math.round((val.flagged / Math.max(1, val.count)) * 100)
    }));

    // Cases over time (weekly fictional trend)
    const casesOverTime = [
      { month: 'Jun W1', cases: 8, resolved: 6 },
      { month: 'Jun W3', cases: 12, resolved: 9 },
      { month: 'Jul W1', cases: 15, resolved: 11 },
      { month: 'Jul W3', cases: 22, resolved: 14 },
      { month: 'Aug W1', cases: 19, resolved: 16 },
      { month: 'Aug W3', cases: 26, resolved: 19 },
      { month: 'Sep W1', cases: 31, resolved: 22 },
      { month: 'Sep W3', cases: Math.max(38, this.cases.length), resolved: this.cases.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length }
    ];

    // High Risk Accounts Under Surveillance
    const highRiskAccountsMap: Record<string, { account: string; holder: string; score: number; cases: number; flag: string }> = {};
    for (const c of this.cases) {
      if (c.riskScore >= 60 || c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL') {
        const acc = c.targetAccount;
        if (!highRiskAccountsMap[acc]) {
          highRiskAccountsMap[acc] = {
            account: acc,
            holder: c.complainantName ? `Reported Target (${acc})` : 'Suspect Syndicate Account',
            score: c.riskScore,
            cases: 1,
            flag: c.category.replace('_', ' ')
          };
        } else {
          highRiskAccountsMap[acc].cases += 1;
          highRiskAccountsMap[acc].score = Math.max(highRiskAccountsMap[acc].score, c.riskScore);
        }
      }
    }
    // ensure DEMO-ACC-2048 is included if present
    if (!highRiskAccountsMap['DEMO-ACC-2048']) {
      highRiskAccountsMap['DEMO-ACC-2048'] = {
        account: 'DEMO-ACC-2048',
        holder: 'Kavita Verma (Compromised)',
        score: 92,
        cases: 4,
        flag: 'High-Velocity Mule Burst'
      };
    }
    const highRiskAccounts = Object.values(highRiskAccountsMap)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    // Geographic Risk Corridors
    const geoCount: Record<string, { region: string; activeAnomalies: number; riskLevel: string; maxScore: number }> = {};
    for (const t of this.transactions) {
      const loc = t.location || 'Unknown';
      if (!geoCount[loc]) {
        geoCount[loc] = { region: loc, activeAnomalies: 0, riskLevel: 'LOW', maxScore: 0 };
      }
      if (t.riskScore > 50) {
        geoCount[loc].activeAnomalies += 1;
      }
      if (t.riskScore > geoCount[loc].maxScore) {
        geoCount[loc].maxScore = t.riskScore;
      }
      geoCount[loc].riskLevel = geoCount[loc].maxScore >= 80 ? 'CRITICAL' : geoCount[loc].maxScore >= 60 ? 'HIGH' : 'MEDIUM';
    }
    const geoRisk = Object.values(geoCount)
      .sort((a, b) => b.activeAnomalies - a.activeAnomalies)
      .slice(0, 5);

    // Flagged Device Fingerprints
    const deviceMap: Record<string, { deviceId: string; flagReason: string; associatedAccounts: Set<string> }> = {};
    for (const t of this.transactions) {
      if (t.riskScore >= 60) {
        const d = t.deviceId || 'DEV-GENERIC-WEB';
        if (!deviceMap[d]) {
          deviceMap[d] = {
            deviceId: d,
            flagReason: t.riskFactors[0] || 'Anomalous biometric / headless agent signature',
            associatedAccounts: new Set<string>()
          };
        }
        deviceMap[d].associatedAccounts.add(t.accountNumber);
      }
    }
    const deviceRisk = Object.values(deviceMap).map(d => ({
      deviceId: d.deviceId,
      flagReason: d.flagReason,
      associatedAccounts: d.associatedAccounts.size
    })).slice(0, 5);

    // Summary calculations
    const totalVolume = this.transactions.reduce((acc, t) => acc + t.amount, 0);
    const flaggedVolume = this.transactions.filter(t => t.status === 'FLAGGED' || t.status === 'BLOCKED').reduce((acc, t) => acc + t.amount, 0);
    const resolvedCases = this.cases.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const resolutionRate = Math.round((resolvedCases / Math.max(1, this.cases.length)) * 100);

    const citizenCases = this.cases.filter(c => !!c.complainantName || c.tags?.includes('Citizen-Dispute'));
    const citizenDisputedAmount = citizenCases.reduce((sum, c) => sum + (c.disputedAmount || 0), 0);
    const citizenResolved = citizenCases.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
    const citizenSuspectAccounts = Array.from(new Set(citizenCases.map(c => c.suspectAccount || c.targetAccount)));

    return {
      riskDist,
      categoryDist,
      statusDist,
      channelDist,
      casesOverTime,
      highRiskAccounts,
      geoRisk,
      deviceRisk,
      citizenAnalytics: {
        totalGrievances: citizenCases.length,
        totalDisputedAmount: citizenDisputedAmount,
        resolvedGrievances: citizenResolved,
        pendingGrievances: citizenCases.length - citizenResolved,
        suspectAccounts: citizenSuspectAccounts,
        recentGrievances: citizenCases.slice(0, 10)
      },
      summary: {
        totalCases: this.cases.length,
        newCases: this.cases.filter(c => c.status === 'NEW').length,
        criticalCases: this.cases.filter(c => c.riskLevel === 'CRITICAL').length,
        highRiskCases: this.cases.filter(c => c.riskLevel === 'HIGH').length,
        resolvedCases,
        resolutionRate,
        citizenDisputesCount: citizenCases.length,
        citizenDisputedAmount,
        totalMonitoredVolume: totalVolume,
        flaggedVolume,
        activeAlerts: this.alerts.filter(a => a.status === 'NEW' || a.status === 'INVESTIGATING').length,
        frozenAccounts: this.recommendedFreezeAccounts.size
      }
    };
  }

  // Users List (Admin)
  public getUsers() {
    return this.users.map(({ passwordHash, ...rest }) => rest);
  }
}

export const platformStore = new PlatformStore();

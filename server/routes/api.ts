import { Router, Request, Response } from 'express';
import { platformStore } from '../services/store';
import { evaluateFraudRisk } from '../services/fraudEngine';
import { authenticateToken } from './auth';

const router = Router();

/**
 * Health check endpoint
 * GET /api/health
 */
router.get('/health', (req: Request, res: Response) => {
  return res.json({
    success: true,
    message: 'Backend is running',
    database: 'connected',
    mode: 'PostgreSQL-Ready & In-Memory Demo Store Active',
    timestamp: new Date().toISOString()
  });
});

/**
 * Dashboard stats
 * GET /api/dashboard/stats
 */
router.get('/dashboard/stats', (req: Request, res: Response) => {
  const stats = platformStore.getDashboardStats();
  return res.json({ success: true, data: stats });
});

/**
 * Optional token authentication middleware
 */
const optionalAuthToken = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    const payload = platformStore.verifyToken(token);
    if (payload) {
      (req as any).user = payload;
    }
  }
  next();
};

/**
 * Cases listing & filters
 * GET /api/cases
 */
router.get('/cases', (req: Request, res: Response) => {
  const { status, riskLevel, category, query, account, assignedTo, citizenOnly } = req.query;
  const cases = platformStore.getCases({
    status: status as string,
    riskLevel: riskLevel as string,
    category: category as string,
    query: query as string,
    account: account as string,
    assignedTo: assignedTo as string,
    citizenOnly: citizenOnly === 'true' || citizenOnly === '1'
  });
  return res.json({ success: true, count: cases.length, data: cases });
});

/**
 * Citizen complaints list
 * GET /api/citizen/complaints
 */
router.get('/citizen/complaints', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  const accountOrAadhaar = user.accountNumber || user.aadhaarNumber;
  const complaints = platformStore.getCitizenComplaints(accountOrAadhaar);
  return res.json({ success: true, count: complaints.length, data: complaints });
});

/**
 * File a Citizen Complaint / Lodge Fraud Case
 * POST /api/complaints or POST /api/cases
 */
const handleCreateComplaint = (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user;
    const {
      title,
      description,
      category,
      disputedTxnRef,
      disputedAmount,
      suspectAccount,
      targetAccount,
      incidentDate,
      desiredOutcome,
      citizenName,
      citizenAccount,
      citizenAadhaar,
      citizenPhone
    } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a detailed description of the fraudulent or suspicious event.'
      });
    }

    // Determine user details from auth session, database lookup, or request payload
    const accountLookup = citizenAccount || authUser?.accountNumber;
    const registeredUser = accountLookup ? platformStore.findUserByIdentity(accountLookup) : undefined;

    const user = {
      id: authUser?.id || registeredUser?.id || `usr-cit-${Date.now()}`,
      name: registeredUser?.name || authUser?.name || citizenName || 'Verified Account Holder',
      role: registeredUser?.role || authUser?.role || 'CITIZEN',
      accountNumber: registeredUser?.accountNumber || authUser?.accountNumber || citizenAccount || 'DEMO100001',
      aadhaarNumber: registeredUser?.aadhaarNumber || authUser?.aadhaarNumber || citizenAadhaar || 'XXXX-XXXX-1001',
      phone: citizenPhone || registeredUser?.phone || authUser?.phone || '+91 98765 43210'
    };

    const newCase = platformStore.createComplaint({
      title,
      description: description.trim(),
      category,
      disputedTxnRef,
      disputedAmount: Number(disputedAmount) || undefined,
      suspectAccount: suspectAccount ? suspectAccount.trim() : undefined,
      targetAccount: targetAccount ? targetAccount.trim() : undefined,
      incidentDate,
      desiredOutcome,
      user
    });

    return res.status(201).json({
      success: true,
      message: `Fraud complaint registered successfully under official Case Number ${newCase.caseNumber}.`,
      data: newCase
    });
  } catch (error: any) {
    console.error('Error creating complaint:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to file grievance report.'
    });
  }
};

router.post('/complaints', optionalAuthToken, handleCreateComplaint);
router.post('/cases', optionalAuthToken, handleCreateComplaint);

/**
 * Case details
 * GET /api/cases/:id
 */
router.get('/cases/:id', (req: Request, res: Response) => {
  const caseData = platformStore.getCaseById(req.params.id);
  if (!caseData) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }
  return res.json({ success: true, data: caseData });
});

/**
 * Update case status
 * PATCH /api/cases/:id/status
 */
router.patch('/cases/:id/status', authenticateToken, (req: Request, res: Response) => {
  const { status } = req.body;
  const user = (req as any).user;
  const updated = platformStore.updateCaseStatus(req.params.id, status, user);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Case not found' });
  }
  return res.json({ success: true, data: updated });
});

/**
 * Assign investigator
 * POST /api/cases/:id/assign
 */
router.post('/cases/:id/assign', authenticateToken, (req: Request, res: Response) => {
  const { investigatorId } = req.body;
  const user = (req as any).user;
  const updated = platformStore.assignCase(req.params.id, investigatorId, user);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Case or Investigator not found' });
  }
  return res.json({ success: true, data: updated });
});

/**
 * Add case note
 * POST /api/cases/:id/notes
 */
router.post('/cases/:id/notes', authenticateToken, (req: Request, res: Response) => {
  const { note } = req.body;
  const user = (req as any).user;
  if (!note || !note.trim()) {
    return res.status(400).json({ success: false, message: 'Note text cannot be empty' });
  }
  try {
    const newNote = platformStore.addNote(req.params.id, note, user);
    return res.status(201).json({ success: true, data: newNote });
  } catch (err: any) {
    return res.status(404).json({ success: false, message: err.message });
  }
});

/**
 * Add evidence
 * POST /api/cases/:id/evidence
 */
router.post('/cases/:id/evidence', authenticateToken, (req: Request, res: Response) => {
  const { type, description, fileHash } = req.body;
  const user = (req as any).user;
  if (!type || !description) {
    return res.status(400).json({ success: false, message: 'Evidence type and description are required' });
  }
  try {
    const newEvd = platformStore.addEvidence(req.params.id, { type, description, fileHash }, user);
    return res.status(201).json({ success: true, data: newEvd });
  } catch (err: any) {
    return res.status(404).json({ success: false, message: err.message });
  }
});

/**
 * Transactions list
 * GET /api/transactions
 */
router.get('/transactions', (req: Request, res: Response) => {
  const { account, limit } = req.query;
  const txns = platformStore.getTransactions(Number(limit) || 100, account as string);
  return res.json({ success: true, count: txns.length, data: txns });
});

/**
 * Simulate / Add Transaction (Real-time trigger)
 * POST /api/transactions/simulate
 */
router.post('/transactions/simulate', (req: Request, res: Response) => {
  const {
    accountNumber,
    amount,
    location,
    deviceId,
    channel,
    ipAddress,
    hasFailedLogins,
    isKnownDevice
  } = req.body;

  if (!accountNumber || !amount) {
    return res.status(400).json({ success: false, message: 'Account Number and Amount are required' });
  }

  const result = platformStore.addTransaction({
    accountNumber: accountNumber.trim().toUpperCase(),
    amount: Number(amount),
    location: location || 'Mumbai, MH',
    deviceId: deviceId || 'DEV-SIMULATED-CLIENT',
    channel: channel || 'UPI',
    ipAddress: ipAddress || '49.36.128.88',
    hasFailedLogins: Boolean(hasFailedLogins),
    isKnownDevice: isKnownDevice !== undefined ? Boolean(isKnownDevice) : true
  });

  return res.status(201).json({
    success: true,
    message: 'Transaction evaluated and ingested into intelligence stream',
    data: result
  });
});

/**
 * Alerts list & updates
 * GET /api/alerts
 */
router.get('/alerts', (req: Request, res: Response) => {
  const alerts = platformStore.getAlerts();
  return res.json({ success: true, data: alerts });
});

router.patch('/alerts/:id/status', authenticateToken, (req: Request, res: Response) => {
  const { status } = req.body;
  const updated = platformStore.updateAlertStatus(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ success: false, message: 'Alert not found' });
  }
  return res.json({ success: true, data: updated });
});

/**
 * Evidence list
 * GET /api/evidence
 */
router.get('/evidence', (req: Request, res: Response) => {
  const { caseId } = req.query;
  const list = platformStore.getEvidence(caseId as string);
  return res.json({ success: true, count: list.length, data: list });
});

/**
 * Repeated Account Intelligence
 * GET /api/accounts/repeated/:accountNumber
 */
router.get('/accounts/repeated/:accountNumber', (req: Request, res: Response) => {
  const intel = platformStore.getRepeatedAccountIntelligence(req.params.accountNumber);
  return res.json({ success: true, data: intel });
});

/**
 * Recommend Account Freeze (Investigator action with safety)
 * POST /api/accounts/freeze-recommendation
 */
router.post('/accounts/freeze-recommendation', authenticateToken, (req: Request, res: Response) => {
  const { accountNumber, reason } = req.body;
  const user = (req as any).user;

  if (!accountNumber || !reason) {
    return res.status(400).json({ success: false, message: 'Account Number and freeze justification reason are required' });
  }

  const result = platformStore.recommendAccountFreeze(accountNumber, reason, user);
  return res.json({ success: true, data: result });
});

/**
 * Risk Simulator Endpoint
 * POST /api/risk/simulate
 */
router.post('/risk/simulate', (req: Request, res: Response) => {
  const {
    accountNumber,
    amount,
    location,
    deviceId,
    channel,
    recentTxnCount,
    hasFailedLogins,
    isKnownDevice,
    priorCaseCount,
    priorAlertCount
  } = req.body;

  const evaluation = evaluateFraudRisk({
    accountNumber: accountNumber || 'DEMO-SIM-ACC',
    amount: Number(amount) || 10000,
    location: location || 'Mumbai, MH',
    deviceId: deviceId || 'DEV-SIMULATED-01',
    channel: channel || 'UPI',
    recentTxnCount: Number(recentTxnCount) || 0,
    hasFailedLogins: Boolean(hasFailedLogins),
    isKnownDevice: isKnownDevice !== undefined ? Boolean(isKnownDevice) : true,
    priorCaseCount: Number(priorCaseCount) || 0,
    priorAlertCount: Number(priorAlertCount) || 0
  });

  return res.json({ success: true, data: evaluation });
});

/**
 * Network Graph
 * GET /api/network
 */
router.get('/network', (req: Request, res: Response) => {
  const graph = platformStore.getNetworkGraph();
  return res.json({ success: true, data: graph });
});

/**
 * Analytics
 * GET /api/analytics
 */
router.get('/analytics', (req: Request, res: Response) => {
  const data = platformStore.getAnalytics();
  return res.json({ success: true, data });
});

/**
 * Audit Logs
 * GET /api/audit
 */
router.get('/audit', authenticateToken, (req: Request, res: Response) => {
  const logs = platformStore.getAuditLogs();
  return res.json({ success: true, count: logs.length, data: logs });
});

/**
 * Users listing (for case assignments and admin)
 * GET /api/users
 */
router.get('/users', authenticateToken, (req: Request, res: Response) => {
  const users = platformStore.getUsers();
  return res.json({ success: true, data: users });
});

export default router;

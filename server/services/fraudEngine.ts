/**
 * Rule-Based Fraud Detection Engine
 * Evaluates transactions against behavioral, geographic, device, and historical risk rules.
 * Generates an explainable risk score (0-100) with detailed contributing factors.
 */

export interface FraudEvaluationInput {
  accountNumber: string;
  amount: number;
  location: string;
  deviceId: string;
  channel: string;
  ipAddress?: string;
  recentTxnCount?: number; // count in last 10 minutes
  hasFailedLogins?: boolean;
  priorAlertCount?: number;
  priorCaseCount?: number;
  isKnownDevice?: boolean;
  usualLocation?: string;
}

export interface RiskFactor {
  rule: string;
  impactScore: number;
  description: string;
}

export interface FraudEvaluationResult {
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'COMPLETED' | 'FLAGGED' | 'UNDER_REVIEW' | 'BLOCKED';
  reasons: string[];
  factors: RiskFactor[];
  recommendedAction: 'ALLOW' | 'MONITOR' | 'INVESTIGATE' | 'RECOMMEND_FREEZE';
}

export function evaluateFraudRisk(input: FraudEvaluationInput): FraudEvaluationResult {
  const factors: RiskFactor[] = [];
  let baseScore = 8; // Baseline baseline score

  // Rule 1 — Unusual Amount
  if (input.amount > 200000) {
    factors.push({
      rule: 'RULE_UNUSUAL_AMOUNT_CRITICAL',
      impactScore: 35,
      description: `High-value outlier transfer (₹${input.amount.toLocaleString()}) significantly exceeds normal account threshold`
    });
  } else if (input.amount > 75000) {
    factors.push({
      rule: 'RULE_UNUSUAL_AMOUNT_HIGH',
      impactScore: 22,
      description: `Elevated transaction volume (₹${input.amount.toLocaleString()}) outside standard baseline`
    });
  } else if (input.amount > 30000) {
    factors.push({
      rule: 'RULE_UNUSUAL_AMOUNT_MEDIUM',
      impactScore: 12,
      description: `Moderate transaction spike (₹${input.amount.toLocaleString()})`
    });
  }

  // Rule 2 & 6 — Velocity & Rapid Transactions
  const count = input.recentTxnCount || 0;
  if (count >= 5) {
    factors.push({
      rule: 'RULE_VELOCITY_CRITICAL',
      impactScore: 30,
      description: `Rapid transaction sequence detected: ${count} transactions attempted within 10-minute window`
    });
  } else if (count >= 3) {
    factors.push({
      rule: 'RULE_VELOCITY_HIGH',
      impactScore: 18,
      description: `Velocity burst anomaly: ${count} rapid successive fund transfers`
    });
  }

  // Rule 3 — Geographic Anomaly
  if (input.usualLocation && input.location && input.usualLocation !== input.location) {
    const isHighRiskCity = ['International-Proxy', 'TOR-Exit-Node', 'Border-Cluster', 'Unknown-Relay'].includes(input.location);
    if (isHighRiskCity) {
      factors.push({
        rule: 'RULE_GEO_ANOMALY_CRITICAL',
        impactScore: 28,
        description: `Geographic evasion vector: Request routed through high-risk origin (${input.location})`
      });
    } else {
      factors.push({
        rule: 'RULE_GEO_ANOMALY_MEDIUM',
        impactScore: 16,
        description: `Sudden geographical shift from primary region (${input.usualLocation}) to ${input.location}`
      });
    }
  }

  // Rule 4 — Device Anomaly
  if (input.isKnownDevice === false || input.deviceId.startsWith('DEV-ANOMALY-') || input.deviceId.includes('ROOTED')) {
    factors.push({
      rule: 'RULE_DEVICE_ANOMALY',
      impactScore: 20,
      description: `Unrecognized or compromised client hardware fingerprint (${input.deviceId})`
    });
  }

  // Rule 5 — Failed Authentication Pattern
  if (input.hasFailedLogins) {
    factors.push({
      rule: 'RULE_AUTH_ANOMALY',
      impactScore: 15,
      description: `Transaction preceded by repeated failed credential challenges`
    });
  }

  // Rule 7 — Account Reuse & Repeated Suspicious Activity
  const priorCases = input.priorCaseCount || 0;
  const priorAlerts = input.priorAlertCount || 0;
  if (priorCases > 0) {
    factors.push({
      rule: 'RULE_REPEATED_ACCOUNT_CASE_LINK',
      impactScore: Math.min(30, priorCases * 12),
      description: `Repeated suspicious association: Account linked to ${priorCases} open or prior fraud investigations`
    });
  }
  if (priorAlerts >= 4) {
    factors.push({
      rule: 'RULE_HISTORICAL_ALERT_FREQUENCY',
      impactScore: 15,
      description: `Persistent surveillance flag: ${priorAlerts} automated security alerts generated previously`
    });
  }

  // Calculate composite score
  const totalScore = Math.min(100, Math.max(5, baseScore + factors.reduce((sum, f) => sum + f.impactScore, 0)));

  // Determine Risk Level:
  // 0–29   → Low
  // 30–59  → Medium
  // 60–79  → High
  // 80–100 → Critical
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  let status: 'COMPLETED' | 'FLAGGED' | 'UNDER_REVIEW' | 'BLOCKED';
  let recommendedAction: 'ALLOW' | 'MONITOR' | 'INVESTIGATE' | 'RECOMMEND_FREEZE';

  if (totalScore >= 80) {
    riskLevel = 'CRITICAL';
    status = 'FLAGGED';
    recommendedAction = priorCases > 0 ? 'RECOMMEND_FREEZE' : 'INVESTIGATE';
  } else if (totalScore >= 60) {
    riskLevel = 'HIGH';
    status = 'FLAGGED';
    recommendedAction = 'INVESTIGATE';
  } else if (totalScore >= 30) {
    riskLevel = 'MEDIUM';
    status = 'UNDER_REVIEW';
    recommendedAction = 'MONITOR';
  } else {
    riskLevel = 'LOW';
    status = 'COMPLETED';
    recommendedAction = 'ALLOW';
  }

  return {
    riskScore: totalScore,
    riskLevel,
    status,
    reasons: factors.map(f => f.description),
    factors,
    recommendedAction
  };
}

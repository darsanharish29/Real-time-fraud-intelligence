import { Router, Request, Response } from 'express';
import { platformStore } from '../services/store';

const router = Router();

// Middleware to parse auth token
export function authenticateToken(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token required' });
  }

  const payload = platformStore.verifyToken(token);
  if (!payload) {
    return res.status(403).json({ success: false, message: 'Invalid or expired authentication session' });
  }

  (req as any).user = payload;
  next();
}

/**
 * POST /api/auth/login
 * Supports Login using either Account Number OR Aadhaar Number
 */
router.post('/login', (req: Request, res: Response) => {
  try {
    const { identity, password } = req.body;

    if (!identity || !identity.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your account number or Aadhaar number.'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your password.'
      });
    }

    const trimmedIdentity = identity.trim();

    // Authenticate via store using either Account or Aadhaar
    const authResult = platformStore.authenticate(trimmedIdentity, password);

    if (!authResult) {
      // Secure generic error - does not reveal existence of identifier
      return res.status(401).json({
        success: false,
        message: 'Invalid account/Aadhaar number or password.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token: authResult.token,
      user: authResult.user
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication service encountered an unexpected error.'
    });
  }
});

/**
 * POST /api/auth/register
 * Citizen sign up with fictional demo credentials
 */
router.post('/register', (req: Request, res: Response) => {
  try {
    const { name, accountNumber, aadhaarNumber, password, confirmPassword } = req.body;

    if (!name || !accountNumber || !aadhaarNumber || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required to register a demo account.'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.'
      });
    }

    const authResult = platformStore.registerCitizen({
      name,
      accountNumber,
      aadhaarNumber,
      password
    });

    return res.status(201).json({
      success: true,
      message: 'Citizen demo account created successfully.',
      token: authResult?.token,
      user: authResult?.user
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || 'Unable to complete registration.'
    });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  if (user) {
    platformStore.recordAudit({
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: 'LOGOUT',
      entityType: 'USER',
      entityId: user.id,
      description: `User session logged out safely.`
    });
  }

  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, (req: Request, res: Response) => {
  const user = (req as any).user;
  return res.json({
    success: true,
    user
  });
});

/**
 * POST /api/auth/forgot-password
 * Safe demo password reset flow
 */
router.post('/forgot-password', (req: Request, res: Response) => {
  const { identity } = req.body;
  if (!identity) {
    return res.status(400).json({ success: false, message: 'Please provide your account number or Aadhaar number.' });
  }

  return res.json({
    success: true,
    message: 'Demo reset link generated. In demo mode, you can log in using default password Demo@123.'
  });
});

export default router;

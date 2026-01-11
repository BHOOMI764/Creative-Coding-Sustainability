import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import { logSecurityEvent } from '../utils/logger';

// Rate limiting
export const createRateLimit = (windowMs: number, max: number, message?: string) => {
  return rateLimit({
    windowMs,
    max,
    message: message || 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        method: req.method,
      });
      res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later.',
      });
    },
  });
};

// General rate limiting
export const generalLimiter = createRateLimit(15 * 60 * 1000, 100); // 15 minutes, 100 requests

// Strict rate limiting for auth endpoints
export const authLimiter = createRateLimit(15 * 60 * 1000, 5); // 15 minutes, 5 requests

// API rate limiting
export const apiLimiter = createRateLimit(15 * 60 * 1000, 200); // 15 minutes, 200 requests

// Speed limiting
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes, then...
  delayMs: 500, // begin adding 500ms of delay per request above 50
  maxDelayMs: 20000, // max delay of 20 seconds
});

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      manifestSrc: ["'self'"],
      workerSrc: ["'self'"],
      childSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
});

// Data sanitization
export const sanitizeData = [
  mongoSanitize(), // Prevent NoSQL injection
  xss(), // Prevent XSS attacks
  hpp(), // Prevent parameter pollution
];

// IP whitelist middleware
export const ipWhitelist = (allowedIPs: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (process.env.NODE_ENV === 'production' && !allowedIPs.includes(clientIP)) {
      logSecurityEvent('IP_BLOCKED', {
        ip: clientIP,
        userAgent: req.get('User-Agent'),
        url: req.url,
      });
      return res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not authorized.',
      });
    }
    
    next();
  };
};

// Request size limiting
export const requestSizeLimiter = (maxSize: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('content-length') || '0');
    const maxBytes = parseInt(maxSize.replace(/\D/g, ''));
    
    if (contentLength > maxBytes) {
      logSecurityEvent('REQUEST_TOO_LARGE', {
        ip: req.ip,
        contentLength,
        maxSize,
        url: req.url,
      });
      return res.status(413).json({
        error: 'Request too large',
        message: `Request size exceeds ${maxSize}`,
      });
    }
    
    next();
  };
};

// Suspicious activity detection
export const suspiciousActivityDetector = (req: Request, res: Response, next: NextFunction) => {
  const suspiciousPatterns = [
    /\.\./, // Directory traversal
    /<script/i, // XSS attempts
    /union\s+select/i, // SQL injection
    /javascript:/i, // JavaScript injection
    /eval\(/i, // Code injection
    /exec\(/i, // Command injection
  ];
  
  const checkString = `${req.url} ${JSON.stringify(req.body)} ${req.get('User-Agent')}`;
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(checkString)) {
      logSecurityEvent('SUSPICIOUS_ACTIVITY', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.url,
        body: req.body,
        pattern: pattern.toString(),
      });
      
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Request contains suspicious content.',
      });
    }
  }
  
  next();
};

// Authentication attempt monitoring
export const authAttemptMonitor = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (req.path.includes('/auth/') && res.statusCode === 401) {
      logSecurityEvent('AUTH_FAILED', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        email: req.body?.email,
        timestamp: new Date().toISOString(),
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Session security
export const sessionSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Check for session fixation
  if (req.session && req.sessionID) {
    const sessionAge = Date.now() - (req.session.cookie.originalMaxAge || 0);
    if (sessionAge > 24 * 60 * 60 * 1000) { // 24 hours
      logSecurityEvent('SESSION_EXPIRED', {
        sessionId: req.sessionID,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
      });
    }
  }
  
  next();
};

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logSecurityEvent('CORS_VIOLATION', {
        origin,
        ip: req.ip,
      });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// Security middleware stack
export const securityMiddleware = [
  securityHeaders,
  generalLimiter,
  speedLimiter,
  sanitizeData,
  suspiciousActivityDetector,
  authAttemptMonitor,
  sessionSecurity,
  requestSizeLimiter('10mb'),
];

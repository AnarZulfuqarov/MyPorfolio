import jwt from 'jsonwebtoken';

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token is missing' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'super_secret_portfolio_key_2026';
    const decoded = jwt.verify(token, jwtSecret);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token is invalid or has expired' });
  }
}

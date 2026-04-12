const jwt = require('jsonwebtoken');

const JWT_SECRET = (process.env.JWT_SECRET || 'dev-jwt-secret').trim();

const authenticateTeam = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.team = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

module.exports = authenticateTeam;

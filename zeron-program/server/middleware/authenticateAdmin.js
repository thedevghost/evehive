const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  const normalizedToken = token.trim();
  const adminSecret = (process.env.ADMIN_SECRET || '').trim();

  if (!normalizedToken) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  if (normalizedToken === adminSecret) {
    req.isAdmin = true;
    next();
  } else {
    return res.status(401).json({ error: 'Unauthorized: Invalid admin token' });
  }
};

module.exports = authenticateAdmin;

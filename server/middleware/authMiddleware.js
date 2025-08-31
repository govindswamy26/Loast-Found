const jwt = require("jsonwebtoken");

// Middleware to check if user is authenticated
const protect = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ msg: "No token, access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // payload should have { id, role, ... }
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

// Middleware to check role (e.g., admin only routes)
const authorize = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ msg: "Forbidden" });
    }
    next();
  };
};

module.exports = { protect, authorize };

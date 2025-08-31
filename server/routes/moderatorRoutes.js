const express = require("express");
const { approveItem, rejectItem, getPendingItems } = require("../controllers/moderatorController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

// Get all pending items
router.get("/pending", protect, authorize('moderator'), getPendingItems);

// Approve an item
router.put("/approve/:id", protect, authorize('moderator'), approveItem);

// Reject an item
router.put("/reject/:id", protect, authorize('moderator'), rejectItem);

module.exports = router;

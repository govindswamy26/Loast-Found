const express = require("express");
const router = express.Router();
const {
  reportItem,
  getAllItems,
  getApprovedItems,
  getItemById,
  updateItem,
  deleteItem,
  claimItem
} = require("../controllers/itemController");
const { protect } = require("../middleware/authMiddleware");

// Report a new item
router.post("/", protect, reportItem);

// Get all items (admin/debug)
router.get("/", protect, getAllItems);

// Get approved items (public)
router.get("/approved", getApprovedItems);

// Get item by ID
router.get("/:id", getItemById);

// Update item (approve/reject)
router.put("/:id", protect, updateItem);

// Delete item
router.delete("/:id", protect, deleteItem);

// Claim item
router.post("/:id/claim", protect, claimItem);

module.exports = router;

const Item = require("../models/Item");

// Get pending items
const getPendingItems = async (req, res) => {
  try {
    const items = await Item.find({ status: "Pending" }).populate("reportedBy", "name");
    res.json(items);
  } catch (err) {
    console.error('Error in getPendingItems:', err);
    res.status(500).json({ msg: 'Failed to fetch pending items. Please try again.' });
  }
};

// Approve item
const approveItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Item not found" });
    if (item.status !== "Pending") {
      return res.status(400).json({ msg: "Only pending items can be approved" });
    }

    item.status = "Approved";
    item.approvedBy = req.user.id; // requires `protect` middleware to set `req.user`
    await item.save();

    // Return populated item
    const populatedItem = await Item.findById(item._id).populate("reportedBy", "name");
    res.json({ msg: "Item approved successfully", item: populatedItem });
  } catch (err) {
    console.error('Error in approveItem:', err);
    res.status(500).json({ msg: 'Failed to approve item. Please try again.' });
  }
};


// Reject item
const rejectItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Item not found" });
    if (item.status !== "Pending") {
      return res.status(400).json({ msg: "Only pending items can be rejected" });
    }
    item.status = "Rejected";
    await item.save();

    // Return populated item
    const populatedItem = await Item.findById(item._id).populate("reportedBy", "name");
    res.json({ msg: "Item rejected successfully", item: populatedItem });
  } catch (err) {
    console.error('Error in rejectItem:', err);
    res.status(500).json({ msg: 'Failed to reject item. Please try again.' });
  }
};

module.exports = { getPendingItems, approveItem, rejectItem };

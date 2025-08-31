const Item = require("../models/Item");

// Report (create) new item
const reportItem = async (req, res) => {
  try {
    const { title, description, location, category, dateReported } = req.body;
    
    // Validate required fields
    if (!title || !description || !location || !category) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Validate category
    if (!['lost', 'found'].includes(category)) {
      return res.status(400).json({ msg: 'Category must be either "lost" or "found"' });
    }
    
    const item = new Item({
      title,
      description,
      location,
      category,
      ...(dateReported ? { dateReported } : {}),
      reportedBy: req.user.id, // from JWT middleware
      status: "Pending"
    });

    await item.save();
    res.status(201).json(item);
  } catch (err) {
    console.error('Error in reportItem:', err);
    res.status(500).json({ msg: 'Failed to report item. Please try again.' });
  }
};

// Get all items (admin/debug purpose)
const getAllItems = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("reportedBy", "name")
      .populate("claimantId", "name");
    res.json(items);
  } catch (err) {
    console.error('Error in getAllItems:', err);
    res.status(500).json({ msg: 'Failed to fetch items. Please try again.' });
  }
};

// Get only approved items
const getApprovedItems = async (req, res) => {
  try {
    const items = await Item.find({ status: "Approved" }).populate("reportedBy", "name");
    res.json(items);
  } catch (err) {
    console.error('Error in getApprovedItems:', err);
    res.status(500).json({ msg: 'Failed to fetch approved items. Please try again.' });
  }
};

// Get single item by ID
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("reportedBy", "name");
    if (!item) return res.status(404).json({ msg: "Item not found" });
    res.json(item);
  } catch (err) {
    console.error('Error in getItemById:', err);
    res.status(500).json({ msg: 'Failed to fetch item. Please try again.' });
  }
};

// Update item (e.g., admin approving/rejecting)
const updateItem = async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate status if provided
    if (status && !['Pending', 'Approved', 'Claimed', 'Rejected'].includes(status)) {
      return res.status(400).json({ msg: 'Invalid status value' });
    }
    
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate("reportedBy", "name");
    if (!item) return res.status(404).json({ msg: "Item not found" });
    res.json(item);
  } catch (err) {
    console.error('Error in updateItem:', err);
    res.status(500).json({ msg: 'Failed to update item. Please try again.' });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ msg: "Item not found" });
    res.json({ msg: "Item deleted successfully" });
  } catch (err) {
    console.error('Error in deleteItem:', err);
    res.status(500).json({ msg: 'Failed to delete item. Please try again.' });
  }
};

// Claim an item
const claimItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ msg: "Item not found" });
    if (item.status === "Claimed")
      return res.status(400).json({ msg: "Item already claimed" });
    if (item.status !== "Approved")
      return res.status(400).json({ msg: "Only approved items can be claimed" });

    item.status = "Claimed";
    item.claimantId = req.user.id;
    item.claimDate = new Date();
    await item.save();

    // Return populated item
    const populatedItem = await Item.findById(item._id)
      .populate("reportedBy", "name")
      .populate("claimantId", "name");
    res.json({ msg: "Item claimed successfully", item: populatedItem });
  } catch (err) {
    console.error('Error in claimItem:', err);
    res.status(500).json({ msg: 'Failed to claim item. Please try again.' });
  }
};

module.exports = {
  reportItem,
  getAllItems,
  getApprovedItems,
  getItemById,
  updateItem,
  deleteItem,
  claimItem
};

const mongoose = require('mongoose');

// Item Schema (MongoDB + Mongoose Example)
const ItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  location: String,
  dateReported: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ["Pending", "Approved", "Claimed", "Rejected"], 
    default: "Pending" 
  },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // NEW FIELDS FOR CLAIM
  claimantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  claimDate: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});
module.exports = mongoose.model("Item", ItemSchema);

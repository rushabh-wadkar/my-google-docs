const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    doc: String,
    body: String,
  },
  { timestamps: { createdAt: "created_at" } }
);

const DocumentModel = mongoose.model("Document", documentSchema);

module.exports = DocumentModel;

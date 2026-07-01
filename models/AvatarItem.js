const mongoose = require('mongoose');

const AvatarItemSchema = new mongoose.Schema({
  category: { type: String, required: true, index: true },
  name: { type: String, required: true },
  value: { type: String, required: true },
  previewImageUrl: { type: String },
}, { timestamps: true });

// avoid model overwrite in dev
module.exports = mongoose.models?.AvatarItem || mongoose.model('AvatarItem', AvatarItemSchema);

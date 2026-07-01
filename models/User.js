const mongoose = require('mongoose');

const UserAvatarSubSchema = new mongoose.Schema({
  avatarStyle: { type: String, enum: ['Circle', 'Transparent'], default: 'Circle' },
  topType: String,
  accessoriesType: String,
  hairColor: String,
  facialHairType: String,
  clotheType: String,
  clotheColor: String,
  eyeType: String,
  eyebrowType: String,
  mouthType: String,
  skinColor: String,
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String },
  avatarConfig: { type: UserAvatarSubSchema, default: {} },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.models?.User || mongoose.model('User', UserSchema);

const mongoose = require('../../config/database');

const Schema = mongoose.Schema;

let userSchema = new Schema(
  {
    firstname: {
      type: String,
      trim: true,
    },
    lastname: {
      type: String,
      trim: true,
    },
    phone_number: {
      type: String,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    password: String,
    role: {
      type: String,
      enum: ['super_admin', 'admin', 'manager', 'user'],
      default: 'admin',
    },
    status: {
      type: Boolean,
      default: false,
    },
    uuid: {
      type: String,
      unique: true,
    },
    blocked: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  }
);

userSchema.virtual('fullname').get(function (value, virtual, doc) {
  return `${this.lastname} ${this.firstname}`;
});

module.exports = mongoose.model('user', userSchema);

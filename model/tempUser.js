const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
/*********************************************************************/
const tempUserSchema = new mongoose.Schema({
  name: { type: String, required: ["name is required"] },
  email: {
    type: String,
    required: ["emial is required"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "please provide a valid email"],
  },
  password: {
    type: String,
    required: ["password is required"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: ["please confirm your password"],
    minlength: 8,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "mismatched password",
    },
  },
  role: {
    type: String,
    default: "user",
  },
  confirmMailToken: String,
  confirmMailTokenExpire: Date,
});
/*********************************************************************/
tempUserSchema.pre("save", function (next) {
  if (this.isNew || !this.isModified("password")) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
/*********************************************************************/
tempUserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = this.password;

  next();
});
/*********************************************************************/
tempUserSchema.methods.createConfirmationToken = function () {
  const token = crypto.randomBytes(4).toString("hex");
  this.confirmMailToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  this.confirmMailTokenExpire = Date.now() + 10 * 60 * 1000;

  return token;
};

const TempUser = mongoose.model("TempUser", tempUserSchema);

module.exports = TempUser;

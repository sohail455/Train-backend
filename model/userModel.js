const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
/*********************************************************************/
const userSchema = new mongoose.Schema({
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
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenExpiresIn: Date,
});
/*********************************************************************/
userSchema.pre("save", function (next) {
  if (this.isNew || !this.isModified("password")) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
/*********************************************************************/
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);
  this.passwordConfirm = undefined;
  next();
});
/*********************************************************************/
userSchema.methods.correctPassword = async function (
  enteredPass,
  userPassword
) {
  return await bcrypt.compare(enteredPass, userPassword);
};
/*********************************************************************/
userSchema.methods.passwordChangedAfter = function (tokenDate) {
  if (!this.passwordChangedAt) return false;
  const passLastChangeTime = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10
  );

  return tokenDate < passLastChangeTime;
};
/*********************************************************************/
userSchema.methods.createPasswordResetToken = function () {
  const token = crypto.randomBytes(4).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.passwordResetTokenExpiresIn = Date.now() + 10 * 60 * 1000;

  return token;
};
/*********************************************************************/
const User = mongoose.model("User", userSchema);

module.exports = User;

const User = require("../model/userModel");
const TempUser = require("../model/tempUser");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jsonWebToken = require("jsonwebtoken");
const { promisify } = require("util");
const Mail = require("../utils/mail");
const crypto = require("crypto");

exports.SignUp = catchAsync(async (req, res, next) => {
  const user = await TempUser.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  const token = jsonWebToken.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 1000,
  });
  const confToken = user.createConfirmationToken();
  await user.save({ validateBeforeSave: false });
  new Mail(user, confToken).sendGreatings();

  res.status(201).json({
    message: "sucess",
    token,
    data: {
      data: user,
    },
  });
});

exports.confirmEmail = async (req, res, next) => {
  const token = req.params.token;
  const emailConfirmToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const tempUser = await TempUser.findOne({
    confirmMailToken: emailConfirmToken,
    confirmMailTokenExpire: { $gte: Date.now() },
  }).select("+password +passwordConfirm");
  try {
    if (!tempUser) {
      return next(new AppError("Confermation Token is Expired or Invalid"));
    }

    const user = await User.create({
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      passwordConfirm: tempUser.passwordConfirm,
    });

    await user.save({ validateBeforeSave: false });
    await TempUser.deleteOne({ email: tempUser.email });
    res.status(201).json({
      message: "Registered Sucessfully!",
      data: {
        data: tempUser,
      },
    });
  } catch (err) {
    await TempUser.deleteOne({ email: tempUser.email });
    return next(new AppError(err.message), 400);
  }
};

exports.LogIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Enter your E-mail and Password"));
  }
  const currerntUser = await User.findOne({ email }).select("+password");

  if (
    !currerntUser ||
    !(await currerntUser.correctPassword(password, currerntUser.password))
  ) {
    return next(
      new AppError("Email or Password is Not Correct, Please Try Again")
    );
  }

  const token = jsonWebToken.sign(
    { id: currerntUser._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 1000,
  });

  res.status(200).json({
    message: "sucess",
    token,
    data: {
      user: currerntUser,
    },
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "", {
    expires: new Date(Date.now() + 1000 * 10),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ status: "success" });
});

exports.resrectTo =
  ([...roles]) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("Your Not Allowed To Performe This Action"));
    }
  };

exports.protect = catchAsync(async (req, res, next) => {
  /*problems cookies should be enabled before any routes declerations
   */
  //1)Get Token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError("Please Login First", 401));
  }
  //2)Verify Token
  const decode = await promisify(jsonWebToken.verify)(
    token,
    process.env.JWT_SECRET
  );
  const user = await User.findOne({ _id: decode.id });
  if (!user) {
    return next(new AppError("The User is Unavailabe", 401));
  }
  if (user.passwordChangedAfter(decode.iat)) {
    return next(new AppError("Session Expired!", 401));
  }
  req.user = user;
  console.log(user);
  next();
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.user.email }).select(
    "+password"
  );
  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(new AppError("Password is Not Correect", 400));
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();
  user.password = undefined;
  res.status(200).json({
    message: "sucess",
    data: {
      data: user,
    },
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("User is unAvailable", 401));
  }
  const token = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const url = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${token}`;

    await new Mail(user, token).sendToken();
    res.status(200).json({
      status: "success",
      token,
      message: `Token sent to ${user.email}!`,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("problem with Sending Mail"), 500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  const passoerdResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  console.log(passoerdResetToken);
  const user = await User.findOne({
    passwordResetToken: passoerdResetToken,
    passwordResetTokenExpiresIn: { $gte: Date.now() },
  });
  if (!user) {
    return next(new AppError("Token is Invalid or Expired!"));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresIn = undefined;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    message: "password updated Successfully ✔",
    data: {
      data: user,
    },
  });
});

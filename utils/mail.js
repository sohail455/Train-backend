const nodemailer = require("nodemailer");

module.exports = class Mail {
  constructor(user, token) {
    this.email = user.email;
    this.firstName = user.name.split(" ")[0];
    this.token = token;
  }
  createTransport() {
    const transport = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,

      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    return transport;
  }
  async send(subject, content) {
    const mailOptions = {
      from: `From Sohail Talaat<${process.env.FROM_EMAIL}>`,
      to: this.email,
      subject: subject,
      text: `Hi ${this.firstName},\n\n${content} using this Token: ${this.token}\n\nThanks!`,
    };
    const transport = this.createTransport();
    await transport.sendMail(mailOptions);
  }
  async sendToken() {
    await this.send("Your Reset Password Token", "Please reset your password");
  }
  async sendGreatings() {
    await this.send(
      "Welcome, Your Confermation Token",
      "Please confirm your email"
    );
  }
};

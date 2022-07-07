import nodemailer from "nodemailer";

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: "vishva.py@gmail.com", // generated ethereal user
        pass: "python@2020", // generated ethereal password
    },
})

export default async function sendMail(email: string, token: string) {
  console.log(email, token);
  let mailTo = await transporter.sendMail({
    from: "Angular Demo<vishva.py@gmail.com>",
    to: email,
    subject: "Reset Password",
    html: `Hello Your password reset token is ${token}`,
  });
  return mailTo
}

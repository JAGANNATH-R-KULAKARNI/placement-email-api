const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());
require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLEINT_SECRET = process.env.CLEINT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLEINT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(details) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.USER,
        clientId: CLIENT_ID,
        clientSecret: CLEINT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: process.env.USER,
      to: details.to,
      subject: details.subject,
      text: details.text,
      html: details.htm,
      attachments: details.attachments,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

app.post("/sendmail", async (req, res) => {
  console.log(req.body);
  await sendMail(req.body)
    .then((result) => {
      console.log("Email sent...", result);
      return res.send({
        msg: "Message sent",
        success: true,
      });
    })
    .catch((error) => {
      console.log(error.message);
      return res.send({
        msg: "Message not sent",
        success: false,
      });
    });
});

app.get("/jagannath", async (req, res) => {
  return res.send({
    msg: "The endpoint is working",
    success: true,
  });
});

app.listen(process.env.PORT || 3001, () => {
  console.log("server running on port 3001");
});

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "petsmas2024@gmail.com",
    pass: "aigoods2024!"
  }
});

const mailOptions = {
  from : "petsmas2024@gmail.com",
  to: 'dongw0507gmail.com',
  subject: 'Nodemailer Test',
  text: '노드 패키지 nodemailer를 이용해 보낸 이메일임'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error(error);
  } else {
    console.log('Email Sent : ', info);
  }
}
)
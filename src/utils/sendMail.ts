
import nodemailer from 'nodemailer'
require('dotenv').config();

async function sendMail(to:string, subject:string, text:string) {

    // 이메일 전송을 위한 메일 서버 연결
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', 
        port: 587, 
        auth: { 
            user: process.env.GMAIL_ID, 
            pass: process.env.GMAIL_PASS, 
        },
    });

    // 메일 옵션 설정
    const mailOptions = {
        from: process.env.GMAIL_ID,
        to: to,
        subject: subject,
        text: text,
    };

    // 이메일 전송
    await transporter.sendMail(mailOptions);
}

export {sendMail}
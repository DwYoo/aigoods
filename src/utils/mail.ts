
import nodemailer from 'nodemailer'
require('dotenv').config();

const IMAGE = "http://res.cloudinary.com/dalbxamib/image/upload/v1703144710/snqgr0hwtzpcvl8ffaag.png"



async function sendMailText(to:string, subject:string, text:string) {

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', 
        port: 587, 
        auth: { 
            user: process.env.GMAIL_ID, 
            pass: process.env.GMAIL_PASS, 
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_ID,
        to: to,
        subject: subject,
        text: text,
    };

    await transporter.sendMail(mailOptions);
}

async function sendMail(to:string, subject:string, url:string ='') {
    const htmlContent = `
    <div style="text-align: center; width: 100%; max-width: 600px; height: auto;">
        <a href=${url} target="_blank">
            <img src="${IMAGE}" alt="메인 이미지" style="width: 100%; height: auto;">
    </div>
    `

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', 
        port: 587, 
        auth: { 
            user: process.env.GMAIL_ID, 
            pass: process.env.GMAIL_PASS, 
        },
    });

    const mailOptions = {
        from: process.env.GMAIL_ID,
        to: to,
        subject: subject,
        html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
}



export {sendMailText, sendMail}
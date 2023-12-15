
import nodemailer from 'nodemailer'
require('dotenv').config();

async function sendMail(to:string, subject:string, text:string) {

    // 이메일 전송을 위한 메일 서버 연결
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // 사용할 이메일 서비스의 호스트 주소 (gamil)
        port: 587, // 이메일 서비스의 포트 번호 (일반적으로 25, 587, 465, 2525 중 하나 사용)
        auth: { // 이메일 서버 인증을 위한 사용자의 이메일 주소와 비밀번호
            user: process.env.GMAIL_ID, // 이메일 주소
            pass: 'wnwv lgfn ulpw ixsi', // 이메일 비밀번호 (그대로 노출되기 때문에 구글의 app 패스워드를 사용할 것을 추천한다.)
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
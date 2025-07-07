import nodemailer from 'nodemailer';
import { PASSWORD_RESET_REQUEST_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from './emailTemplate';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


export const sendVerificationEmail = async(email: string, username: string, code: string) => {
    const mailOption = {
        to: email,
        subject: "Account Verification",
        html: `${VERIFICATION_EMAIL_TEMPLATE.replace('{username}', username).replace('{verificationCode}', code).replace('{clientUrl}', process.env.CLIENT_URL || '')}`,
    };
    transporter.sendMail(mailOption, (error, info) => {
        if(error) {
            console.log('Error sending email', error);
        };
        console.log("Email sent:", info.response);
    });
};

export const sendWelcomeEmail = async(email: string, username: string) => {
    const mailOption = {
        to: email,
        subject: "Welcome to Our Service",
        html: `${WELCOME_EMAIL_TEMPLATE.replace('{name}', username)}`,
    }
    transporter.sendMail(mailOption, (error, info) => {
        if(error) {
            console.log('Error sending email', error);
        };
        console.log("Email sent:", info.response);
    });
};
export const sendResetPasswordEmail = async (email: string, resetLink: string) => {
    const mailOption = { 
        to: email,
        subject: "Password Reset Request",
        html: `${PASSWORD_RESET_REQUEST_TEMPLATE.replace('{resetURL}', resetLink)}`,
    }
    transporter.sendMail(mailOption, (error, info) => {
        if(error) {
            console.log('Error sending email', error);
        };
        console.log("Email sent:", info.response);
    });
}
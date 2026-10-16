import nodemailer from 'nodemailer';
import env from '../config/env.js';
import { AppError } from './app-error.js';


export const sendUserInvitationEmail = async({to, token}) => {
    const {host, port, secure, user, password, from} = env.smtp;

    if (!host || !port || !user || !password || !from) {
        throw new AppError(
            'Email service is not configured', 503, 'EMAIL_NOT_CONFIGURED'
        );
    }

    const transporter = nodemailer.createTransport({
        host, 
        port,
        secure,
        auth: {user, pass: password}
    });

    const activationUrl = new URL('/activate-account', env.clientUrl);
    activationUrl.searchParams.set('token', token);
    await transporter.sendMail({
        from,
        to,
        subject: 'Activate your ManageBook account',
        text: [
        'An account was created for you in ManageBook.',
        `Set your password using this link: ${activationUrl.toString()}`,
        'This invitation link expires in one hour and can only be used once.'
        ].join('\n'),
        html: `
            <p>An account was created for you in ManageBook.</p>
            <p><a href="${activationUrl.toString()}">Set your password and activate your account</a></p>
            <p>This link expires in one hour and can only be used once.</p>
            <p>If you did not expect this invitation, you can ignore this email.</p>
        `
    });

}
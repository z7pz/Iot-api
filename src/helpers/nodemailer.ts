import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.COMPANY_EMAIL,
        pass: process.env.COMPANY_EMAIL_PASSWORD
    }
});
export const sendMail = (to: string, subject: string, html: string) => {
    const mailOptions = {
        from: process.env.COMPANY_EMAIL,
        to,
        subject,
        html
    };
    transporter.sendMail(mailOptions, function (err, info) {
        if (err) throw err;
        return info;
    });
};

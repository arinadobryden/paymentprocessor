const nodemailer = require('nodemailer');
const config = require('./config');

const transporter = nodemailer.createTransport({
    service: config.email.service,
    auth: {
        user: config.email.auth.user,
        pass: config.email.auth.pass
    }
});

async function sendOrderConfirmation(email, orderDetails) {
    const mailOptions = {
        from: config.email.auth.user,
        to: email,
        subject: 'Order Confirmation',
        text: `Your order has been placed successfully. Order details: ${orderDetails}`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent');
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
    }
}

module.exports = { sendOrderConfirmation };

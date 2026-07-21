import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendEmail({ to, subject, text, html }) {
  try {
    console.log('Attempting to send email to:', to);
    const response = await sgMail.send({
      from: 'nazarrahil0000@gmail.com',
      to,
      subject,
      text,
      html,
    });
    console.log('Email sent successfully, status:', response[0].statusCode);
  } catch (err) {
    console.error('Error while sending mail:', JSON.stringify(err.response?.body || err));
    throw err;
  }
}
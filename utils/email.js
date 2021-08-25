const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const nodemailerSendgrid = require('nodemailer-sendgrid');
//const sendgridTransport = require('nodemailer-sendgrid-transport');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.from = 'Ritika Goyal <ritikag.cs.18@nitj.ac.in>';
    this.url = url;
    this.name = user.name.split(',')[0];
  }

  newTransport() {
    //console.log(process.env.NODE_ENV);
    if (process.env.NODE_ENV !== 'development') {
      //sendgrid;
      //console.log('helo');
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }
    //console.log('helloooo');
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async send(template, subject) {
    //1.) render html based on pug template
    const html = pug.renderFile(
      `${__dirname}/../views/emails/${template}.pug`,
      {
        firstName: this.name,
        url: this.url,
        subject: this.subject,
      }
    );
    //2.) create mail options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText(html),
      //html
    };
    //3.) create transport and send mail
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to natours family!');
  }

  async sendPasswordReset() {
    await this.send('passwordReset', 'Valid for only 10 minutes!');
  }
};

// const sendEmail = async (options) => {
//   //1.) create transporter
//   // const transporter = nodemailer.createTransport({
//   //   host: process.env.EMAIL_HOST,
//   //   port: process.env.EAIL_PORT,
//   //   auth: {
//   //     user: process.env.EMAIL_USERNAME,
//   //     pass: process.env.EMAIL_PASSWORD,
//   //   },
//   // });

//   //2.)define email options
//   const mailOptions = {
//     from: 'Ritika Goyal <ritika@gmail.com>',
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     //html
//   };

//   //3.) activate send the email
//   await transporter.sendMail(mailOptions);
// };

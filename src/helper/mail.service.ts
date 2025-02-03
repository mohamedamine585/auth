import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { stat } from 'fs';
import * as nodemailer from 'nodemailer';
import { emailTemplate } from 'src/utils/verif-email';

@Injectable()
export class MailService {
  
  private transporter: nodemailer.Transporter;

  constructor(
        @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,  // Use Inject with the service name
     
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // You can use other services like SMTP, Mailgun, etc.
      auth: {
        user: process.env.EMAIL_USER,  // Your email
        pass: process.env.EMAIL_PASS,  // Your email password
      },
    });
  }

  async sendActivationEmail(email: string, activationToken: string) {
    const activationLink = `http://localhost:3000/auth/activate/${activationToken}`;

    const mailOptions = {
      from: `${process.env.EMAIL_USER}`,
      to: email,
      subject: 'Activate Your Account',
      html: emailTemplate(activationLink),
    };

    try {
      await this.transporter.sendMail(mailOptions);
        this.kafkaClient.emit('EMAIL-SENT', {
            email: email,
            status: 'success',
            message: 'Activation email sent',
        });
      
    } catch (error) {
        this.kafkaClient.emit('EMAIL-ERROR', {
            email: email,
            status: 'error',
            error: error
        });        
    }
  }
}

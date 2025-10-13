import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { stat } from 'fs';
import * as nodemailer from 'nodemailer';
import { EventType, KafkaProducerService, Topic } from 'src/helper/kafka/kafka.producer';
import { emailTemplate } from 'src/utils/verif-email';

@Injectable()
export class MailService {
  
  private transporter: nodemailer.Transporter;

  constructor(
        private readonly kafkaProducerService : KafkaProducerService  // Use Inject with the service name
     
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
    const activationLink = `http://localhost:4200/validate-account/${activationToken}`;

    const mailOptions = {
      from: `${process.env.EMAIL_USER}`,
      to: email,
      subject: 'Activate Your Account',
      html: emailTemplate(activationLink),
    };

    try {
      await this.transporter.sendMail(mailOptions);

            const message = new Map<string, any>([
              ['email', email],
              ['status', 'success'],
            ]);
            // Kafka event for user creation
            await this.kafkaProducerService.sendMessage(Topic.mailing,message,EventType.activationSent);
      
    } catch (error) {
        console.error('Error sending activation email:', error);
      const message = new Map<string, any>([
        ['email', email],
        ['status', 'error'],
      ]);
      // Kafka event for user creation
      await this.kafkaProducerService.sendMessage(Topic.mailing,message,EventType.activationError);
    }
  }
}

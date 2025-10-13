import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { logger } from 'src/config/logger.config';

export enum Topic {
    user = 'user',
    status = 'status',
    mailing = 'mailing',
}
export enum EventType {
    created = 'created',
    updated = 'updated',
    deleted = 'deleted',
    activated = 'activated',
    activationSent = 'activationSent',
    activationError = 'activationError',
    
}

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;


  constructor() {
    this.kafka = new Kafka({
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'], // Broker from environment or default
      
    });

    this.producer = this.kafka.producer();
  }

  // Initialize the producer connection on app startup
  async onModuleInit() {
    await this.connectProducer();
  }

  // Connect producer
  private async connectProducer(): Promise<void> {
    try {
      await this.producer.connect();
      logger.info('Kafka Producer connected');
    } catch (error) {
      logger.error('Error connecting Kafka Producer:', error);
      process.exit(1); // Ensure to stop app if producer cannot connect
    }
  }

  // Send a message to Kafka
  public async sendMessage(topic: Topic, message: Map<string,any>,eventType : EventType): Promise<void> {
    try {
      console.log('Sending message to Kafka:', topic, message, eventType);
      const plainMessage = Object.fromEntries(message); 
      await this.producer.send({
        topic: `auth.${topic}`,
        messages: [
         
          {
            key: eventType,
            value: JSON.stringify(plainMessage),
      
          }  
       ],
      });
    } catch (error) {
      logger.error('Error sending message to Kafka:', error);
    }
  }

  // Disconnect producer on app shutdown
  async onModuleDestroy() {
    await this.disconnectProducer();
  }

  // Gracefully disconnect producer
  private async disconnectProducer(): Promise<void> {
    try {
      await this.producer.disconnect();
      logger.info('Kafka Producer disconnected');
    } catch (error) {
      logger.error('Error disconnecting Kafka Producer:', error);
    }
  }
}

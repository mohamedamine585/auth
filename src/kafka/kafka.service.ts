import { Injectable, OnModuleInit } from '@nestjs/common';
import { Inject, OnApplicationBootstrap } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';

@Injectable()
export class KafkaService implements OnModuleInit, OnApplicationBootstrap {
  constructor(
    @Inject('KAFKA_SERVICE') private readonly client: ClientKafka,
  ) {}

  onModuleInit() {
    this.client.subscribeToResponseOf('pulse-auth'); 
  }

  onApplicationBootstrap() {
    this.client.connect();
  }

  async sendMessage(message: string) {
    return this.client.send('pulse-auth', message); 
  }
}

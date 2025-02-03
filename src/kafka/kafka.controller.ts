import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class KafkaConsumerController {
  @MessagePattern('pulse-auth')
  async consumeMessage(@Payload() message: any) {
    console.log('Received Kafka message:', message);
  }
}

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['localhost:9092'],  // Replace with your Kafka broker URL
          },
          consumer: {
            groupId: 'auth-group',  // Define the group ID
          },
        },
      },
    ]),
  ],
  providers: [],  // Kafka service should not be added here, ClientsModule will handle it
  exports: [ClientsModule],  // Export the ClientsModule so KAFKA_SERVICE is available outside
})
export class KafkaModule {}

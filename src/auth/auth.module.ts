import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entities/user.entity';
import { Pass } from '../entities/pass.entity';
import { JwtModule } from '@nestjs/jwt';

import { MailService } from 'src/helper/mail.service';
import { KafkaProducerService } from 'src/kafka/kafka.producer';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Pass]), // ✅ Register User & Pass
    JwtModule.register({ secret: 'your_secret_key' }),
  ],
  providers: [AuthService,KafkaProducerService,MailService],
  controllers: [AuthController],
  exports: [AuthService, TypeOrmModule],
})
export class AuthModule {}

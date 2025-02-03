import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entities/user.entity';
import { Pass } from '../entities/pass.entity';
import { JwtModule } from '@nestjs/jwt';
import { KafkaModule } from 'src/kafka/kafka.module';
import { KafkaService } from 'src/kafka/kafka.service';
import { MailService } from 'src/helper/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Pass]), // ✅ Register User & Pass
    JwtModule.register({ secret: 'your_secret_key' }),
    KafkaModule
  ],
  providers: [AuthService,KafkaService,MailService],
  controllers: [AuthController],
  exports: [AuthService, TypeOrmModule],
})
export class AuthModule {}

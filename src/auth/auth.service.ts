import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { Pass } from '../entities/pass.entity';
import { randomBytes } from 'crypto';
import { ClientKafka } from '@nestjs/microservices'; // Import ClientKafka
import { Inject } from '@nestjs/common'; // Import Inject decorator
import { logger } from '../config/logger.config';
import { MailService } from 'src/helper/mail.service';
import { EventType, KafkaProducerService, Topic } from 'src/kafka/kafka.producer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Pass)
    private passRepository: Repository<Pass>,
    private jwtService: JwtService,
    private kafkaProducerService : KafkaProducerService,  // Use Inject with the service name
    private mailService : MailService,
  ) {}
 
  async register(username: string, email: string, password: string) {
    const existingUser = await this.userRepository.findOne({ where: [{ username }, { email }] });
    if (existingUser) throw new BadRequestException('Username or Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const pass = this.passRepository.create({ password: hashedPassword });
    await this.passRepository.save(pass);

    const activationToken = randomBytes(32).toString('hex');
    const user = this.userRepository.create({ username, email, pass, activationToken });
    await this.userRepository.save(user);

    // Log the creation
    logger.info(`User created: ${user.username}`);

    await this.mailService.sendActivationEmail(email, activationToken);

     
    const message = new Map<string, any>([
      ['id', user.id],
      ['username',user.username],
      ['email', user.email],
    ]);
    // Kafka event for user creation
    await this.kafkaProducerService.sendMessage(Topic.user,message,EventType.created);

    return { message: 'Registration successful, please check your email to activate your account' };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.pass.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if(!user.activated){
      throw new UnauthorizedException('Account not activated');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return { username: user.username, email: user.email };
  }

  async updateUser(userId: number, updateData: Partial<User>) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, updateData);
    await this.userRepository.save(user);

    // Log the update
    logger.info(`User updated: ${user.username}`);

    const message = new Map<string, any>([
      ['id', user.id],
      ['username',user.username],
      ['email', user.email],
    ]);
    // Kafka event for user creation
    await this.kafkaProducerService.sendMessage(Topic.user,message,EventType.updated);

    return { message: 'User updated successfully' };
  }

  async deleteUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.remove(user);

    // Log the deletion
    logger.info(`User deleted: ${user.username}`);

    const message = new Map<string, any>([
      ['id', user.id],
      ['username',user.username],
    ]);
    // Kafka event for user creation
    await this.kafkaProducerService.sendMessage(Topic.user,message,EventType.deleted);

    return { message: 'User deleted successfully' };
  }
  async activateAccount(activationToken: string) {
    // Find the user by activation token
    const user = await this.userRepository.findOne({ where: { activationToken } });
  
    if (!user) {
      throw new NotFoundException('Invalid or expired activation token');
    }
  
    // Remove activation token to mark account as activated
    user.activated = true;
    await this.userRepository.save(user);
  
    return { message: 'Account activated successfully!' };
  }
}

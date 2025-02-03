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
import { KafkaService } from 'src/kafka/kafka.service';
import { MailService } from 'src/helper/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Pass)
    private passRepository: Repository<Pass>,
    private jwtService: JwtService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,  // Use Inject with the service name
    private kafkaService: KafkaService,
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

     
    // Kafka event for user creation
    await this.kafkaClient.emit('USER-CREATED', {
      id: user.id,
      username: user.username,
      email: user.email,
    });

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

    // Kafka event for user update
    await this.kafkaClient.emit('USER-UPDATED', {
      id: user.id,
      username: user.username,
      email: user.email,
    });

    return { message: 'User updated successfully' };
  }

  async deleteUser(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.userRepository.remove(user);

    // Log the deletion
    logger.info(`User deleted: ${user.username}`);

    // Kafka event for user deletion
    await this.kafkaClient.emit('USER-DELETED', {
      id: user.id,
      username: user.username,
    });

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

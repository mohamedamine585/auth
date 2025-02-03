import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { logger } from '../config/logger.config';
import { ClientKafka } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,  // Inject Kafka client
  ) {}

  // Get User Profile by User ID
  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return { username: user.username, email: user.email };
  }

  // Update User Data
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

  // Delete User by User ID
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

  // Find a User by their ID
  async findUserById(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

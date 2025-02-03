import { Controller, Post, Body, Get, Param, Put, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: { username: string; email: string; password: string }) {
    return this.authService.register(body.username, body.email, body.password);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }


  @Get('profile/:userId')
  getProfile(@Param('userId') userId: number) {
    return this.authService.getProfile(userId);
  }

  @Put('update/:userId')
  updateUser(@Param('userId') userId: number, @Body() updateData: Partial<User>) {
    return this.authService.updateUser(userId, updateData);
  }

  @Delete('delete/:userId')
  deleteUser(@Param('userId') userId: number) {
    return this.authService.deleteUser(userId);
  }

  @Get('activate/:token')
  activateAccount(@Param('token') token: string) {
    return this.authService.activateAccount(token);
  }
}

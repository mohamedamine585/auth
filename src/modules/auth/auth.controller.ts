import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Req, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../../entities/user.entity';
import { AuthUserGuard } from 'src/guards/AuthUserGuard';

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


  @UseGuards(AuthUserGuard) // Ensure the user is authenticated
  @Get('profile')
  getProfile(@Request() req: any) {
    try {
      return this.authService.getProfile(req.user.sub);

    }catch(e){
      console.log(e);
    }
  }

  @Put('update/:userId')
  updateUser(@Param('userId') userId: number, @Body() updateData: Partial<User>) {
    return this.authService.updateUser(userId, updateData);
  }

  @Delete('delete/:userId')
  deleteUser(@Param('userId') userId: number) {
    return this.authService.deleteUser(userId);
  }

  @Post('resend-confirmation')
  resendConfirmation(@Body() body: { email: string }) {
    return this.authService.resendConfirmation(body.email);
  }

  @Get('activate/:token')
  activateAccount(@Param('token') token: string) {
    return this.authService.activateAccount(token);
  }
}

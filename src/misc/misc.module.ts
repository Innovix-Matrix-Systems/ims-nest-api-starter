import { Module } from '@nestjs/common';
import { PasswordService } from './password.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PasswordService],
})
export class MiscModule {}

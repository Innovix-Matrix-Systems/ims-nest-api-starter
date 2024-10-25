import { Global, Module } from '@nestjs/common';
import { FilterService } from './filter.service';
import { PaginationService } from './pagination.service';
import { PasswordService } from './password.service';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [PasswordService, PaginationService, FilterService],
  exports: [PasswordService, PaginationService, FilterService],
})
export class MiscModule {}

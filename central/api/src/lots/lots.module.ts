import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LotsService } from './lots.service';
import { LotsController } from './lots.controller';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.COUNTRY_API_URL || 'http://localhost:3000',
      timeout: 5000,
    }),
  ],
  controllers: [LotsController],
  providers: [LotsService],
})
export class LotsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lot } from './lot.entity';
import { LotsService } from './lots.service';
import { LotsController } from './lots.controller';
import { AlertNotificationService } from '../alerts/alert-notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lot])],
  controllers: [LotsController],
  providers: [LotsService, AlertNotificationService],
})
export class LotsModule {}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mesure } from './mesure.entity';
import { MesuresService } from './mesures.service';
import { MesuresController } from './mesures.controller';
import { AlertNotificationService } from '../alerts/alert-notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mesure])],
  controllers: [MesuresController],
  providers: [MesuresService, AlertNotificationService],
})
export class MesuresModule {}

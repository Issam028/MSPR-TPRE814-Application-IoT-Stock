import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lot } from '../lots/lot.entity';
import { Mesure } from '../mesures/mesure.entity';
import { ErpExportController } from './erp-export.controller';
import { ErpExportService } from './erp-export.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lot, Mesure])],
  controllers: [ErpExportController],
  providers: [ErpExportService],
})
export class ErpExportModule {}

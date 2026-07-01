import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lot } from '../lots/lot.entity';
import { Mesure } from '../mesures/mesure.entity';
import { ErpExportController } from './erp-export.controller';
import { ErpExportService } from './erp-export.service';
import { ApiKeyRoleGuard } from '../security/api-key-role.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Lot, Mesure])],
  controllers: [ErpExportController],
  providers: [ErpExportService, ApiKeyRoleGuard],
})
export class ErpExportModule {}

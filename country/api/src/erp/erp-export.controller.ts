import { Controller, Get, UseGuards } from '@nestjs/common';
import { ErpExportService } from './erp-export.service';
import { ApiKeyRoleGuard } from '../security/api-key-role.guard';
import { Roles } from '../security/roles.decorator';

@Controller('erp')
export class ErpExportController {
  constructor(private readonly erpExportService: ErpExportService) {}

  @Get('health')
  health() {
    return this.erpExportService.getHealth();
  }

  @Get('stock-movements')
  @UseGuards(ApiKeyRoleGuard)
  @Roles('admin', 'stock')
  getStockMovements() {
    return this.erpExportService.getStockMovements();
  }

  @Get('quality-alerts')
  @UseGuards(ApiKeyRoleGuard)
  @Roles('admin', 'quality')
  getQualityAlerts() {
    return this.erpExportService.getQualityAlerts();
  }
}

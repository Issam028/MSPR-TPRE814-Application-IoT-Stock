import { Controller, Get } from '@nestjs/common';
import { ErpExportService } from './erp-export.service';

@Controller('erp')
export class ErpExportController {
  constructor(private readonly erpExportService: ErpExportService) {}

  @Get('health')
  health() {
    return this.erpExportService.getHealth();
  }

  @Get('stock-movements')
  getStockMovements() {
    return this.erpExportService.getStockMovements();
  }

  @Get('quality-alerts')
  getQualityAlerts() {
    return this.erpExportService.getQualityAlerts();
  }
}

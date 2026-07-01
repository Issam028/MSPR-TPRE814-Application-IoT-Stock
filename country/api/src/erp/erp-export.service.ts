import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lot } from '../lots/lot.entity';
import { Mesure } from '../mesures/mesure.entity';
import { mapLotToErpStockMovement, mapMesureToErpQualityAlert } from './erp-export.mapper';

@Injectable()
export class ErpExportService {
  constructor(
    @InjectRepository(Lot)
    private readonly lotsRepository: Repository<Lot>,
    @InjectRepository(Mesure)
    private readonly mesuresRepository: Repository<Mesure>,
  ) {}

  async getStockMovements() {
    const lots = await this.lotsRepository.find({ order: { date_stockage: 'DESC' } });
    return lots.map((lot) => mapLotToErpStockMovement(lot, process.env.COUNTRY_CODE || 'BR'));
  }

  async getQualityAlerts() {
    const mesures = await this.mesuresRepository.find({
      where: { statut: 'en alerte' },
      order: { timestamp: 'DESC' },
    });
    return mesures.map((mesure) => mapMesureToErpQualityAlert(mesure, process.env.COUNTRY_CODE || 'BR'));
  }

  getHealth() {
    return {
      adapter: 'FutureKawa-ERP-Adapter',
      modules: ['STOCK', 'QUALITY'],
      status: 'ready',
    };
  }
}

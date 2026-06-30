import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lot } from './lot.entity';
import { CreateLotDto } from './dto/create-lot.dto';
import { UpdateLotDto } from './dto/update-lot.dto';
import { AlertNotificationService } from '../alerts/alert-notification.service';

const EXPIRED_AFTER_DAYS = 365;
const ALERT_FROM_DAYS = 330;

@Injectable()
export class LotsService {
  constructor(
    @InjectRepository(Lot)
    private readonly lotsRepository: Repository<Lot>,
    private readonly alertNotificationService: AlertNotificationService,
  ) {}

  private evaluateStatus(dateStockage?: Date | string): string {
    if (!dateStockage) {
      return 'conforme';
    }

    const stockDate = new Date(dateStockage);
    if (Number.isNaN(stockDate.getTime())) {
      return 'conforme';
    }

    const ageInDays = Math.floor((Date.now() - stockDate.getTime()) / 86400000);

    if (ageInDays > EXPIRED_AFTER_DAYS) {
      return 'périmé';
    }

    if (ageInDays >= ALERT_FROM_DAYS) {
      return 'en alerte';
    }

    return 'conforme';
  }

  private async syncStatus(lot: Lot): Promise<Lot> {
    const statut = this.evaluateStatus(lot.date_stockage);

    if (lot.statut !== statut) {
      lot.statut = statut;
      await this.lotsRepository.save(lot);

      if (statut !== 'conforme') {
        await this.alertNotificationService.notifyLotAlert({
          idLot: lot.id_lot,
          idEntrepot: lot.id_entrepot,
          statut,
          dateStockage: lot.date_stockage,
        });
      }
    }

    return lot;
  }

  async findAll(): Promise<Lot[]> {
    const lots = await this.lotsRepository.find();
    return Promise.all(lots.map((lot) => this.syncStatus(lot)));
  }

  async findByEntrepot(id_entrepot: number): Promise<Lot[]> {
    const lots = await this.lotsRepository.findBy({ id_entrepot });
    return Promise.all(lots.map((lot) => this.syncStatus(lot)));
  }

  async findOne(id: number): Promise<Lot> {
    const lot = await this.lotsRepository.findOneBy({ id_lot: id });
    if (!lot) throw new NotFoundException('Lot non trouvé');
    return this.syncStatus(lot);
  }

  async findExpired(): Promise<Lot[]> {
    const lots = await this.findAll();
    return lots.filter((lot) => lot.statut === 'périmé');
  }

  async create(dto: CreateLotDto): Promise<Lot> {
    const lot = this.lotsRepository.create({
      ...dto,
      statut: this.evaluateStatus(dto.date_stockage),
    });
    const savedLot = await this.lotsRepository.save(lot);

    if (savedLot.statut !== 'conforme') {
      await this.alertNotificationService.notifyLotAlert({
        idLot: savedLot.id_lot,
        idEntrepot: savedLot.id_entrepot,
        statut: savedLot.statut,
        dateStockage: savedLot.date_stockage,
      });
    }

    return savedLot;
  }

  async update(id: number, dto: UpdateLotDto): Promise<Lot> {
    const existingLot = await this.findOne(id);
    const previousStatus = existingLot.statut;
    const updatedLot = this.lotsRepository.create({
      ...existingLot,
      ...dto,
      statut: this.evaluateStatus(dto.date_stockage ?? existingLot.date_stockage),
    });

    await this.lotsRepository.save(updatedLot);

    if (updatedLot.statut !== 'conforme' && updatedLot.statut !== previousStatus) {
      await this.alertNotificationService.notifyLotAlert({
        idLot: updatedLot.id_lot,
        idEntrepot: updatedLot.id_entrepot,
        statut: updatedLot.statut,
        dateStockage: updatedLot.date_stockage,
      });
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.lotsRepository.delete({ id_lot: id });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mesure } from './mesure.entity';
import { CreateMesureDto } from './dto/create-mesure.dto';
import { AlertNotificationService } from '../alerts/alert-notification.service';

const toFloat = (value: string | undefined, fallback: number): number => {
  const parsed = Number.parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getThresholds = () => {
  const temperatureTarget = toFloat(process.env.ALERT_TEMPERATURE_TARGET, 27);
  const temperatureTolerance = toFloat(process.env.ALERT_TEMPERATURE_TOLERANCE, 3);
  const humiditeTarget = toFloat(process.env.ALERT_HUMIDITE_TARGET, 55);
  const humiditeTolerance = toFloat(process.env.ALERT_HUMIDITE_TOLERANCE, 5);

  return {
    temperatureMin: temperatureTarget - temperatureTolerance,
    temperatureMax: temperatureTarget + temperatureTolerance,
    humiditeMin: humiditeTarget - humiditeTolerance,
    humiditeMax: humiditeTarget + humiditeTolerance,
  };
};

@Injectable()
export class MesuresService {
  constructor(
    @InjectRepository(Mesure)
    private readonly mesuresRepository: Repository<Mesure>,
    private readonly alertNotificationService: AlertNotificationService,
  ) {}

  findAll(): Promise<Mesure[]> {
    return this.mesuresRepository.find({ order: { timestamp: 'DESC' } });
  }

  async findOne(id: number): Promise<Mesure> {
    const mesure = await this.mesuresRepository.findOneBy({ id_mesure: id });
    if (!mesure) throw new NotFoundException('Mesure non trouvée');
    return mesure;
  }

  findByEntrepot(idEntrepot: number): Promise<Mesure[]> {
    return this.mesuresRepository.find({
      where: { id_entrepot: idEntrepot },
      order: { timestamp: 'DESC' },
    });
  }

  async findLatestByEntrepot(idEntrepot: number): Promise<Mesure> {
    const mesure = await this.mesuresRepository.findOne({
      where: { id_entrepot: idEntrepot },
      order: { timestamp: 'DESC' },
    });
    if (!mesure) throw new NotFoundException('Aucune mesure trouvée pour cet entrepôt');
    return mesure;
  }

  findAlerts(): Promise<Mesure[]> {
    return this.mesuresRepository.find({
      where: { statut: 'en alerte' },
      order: { timestamp: 'DESC' },
    });
  }

  private evaluateStatus(dto: CreateMesureDto): string {
    const thresholds = getThresholds();
    const temperatureOk =
      dto.temperature !== null &&
      dto.temperature !== undefined &&
      dto.temperature >= thresholds.temperatureMin &&
      dto.temperature <= thresholds.temperatureMax;
    const humiditeOk =
      dto.humidite !== null &&
      dto.humidite !== undefined &&
      dto.humidite >= thresholds.humiditeMin &&
      dto.humidite <= thresholds.humiditeMax;

    return temperatureOk && humiditeOk ? 'conforme' : 'en alerte';
  }

  async create(dto: CreateMesureDto): Promise<Mesure> {
    const mesure = this.mesuresRepository.create({
      ...dto,
      statut: this.evaluateStatus(dto),
    });
    const savedMesure = await this.mesuresRepository.save(mesure);

    if (savedMesure.statut === 'en alerte') {
      const thresholds = getThresholds();
      await this.alertNotificationService.notifyMeasureAlert({
        idMesure: savedMesure.id_mesure,
        idEntrepot: savedMesure.id_entrepot,
        temperature: savedMesure.temperature,
        humidite: savedMesure.humidite,
        statut: savedMesure.statut,
        temperatureMin: thresholds.temperatureMin,
        temperatureMax: thresholds.temperatureMax,
        humiditeMin: thresholds.humiditeMin,
        humiditeMax: thresholds.humiditeMax,
      });
    }

    return savedMesure;
  }
}

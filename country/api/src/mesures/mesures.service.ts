import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mesure } from './mesure.entity';
import { CreateMesureDto } from './dto/create-mesure.dto';

const TEMPERATURE_MIN = 24;
const TEMPERATURE_MAX = 30;
const HUMIDITE_MIN = 50;
const HUMIDITE_MAX = 60;

@Injectable()
export class MesuresService {
  constructor(
    @InjectRepository(Mesure)
    private readonly mesuresRepository: Repository<Mesure>,
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
    const temperatureOk =
      dto.temperature !== null &&
      dto.temperature !== undefined &&
      dto.temperature >= TEMPERATURE_MIN &&
      dto.temperature <= TEMPERATURE_MAX;
    const humiditeOk =
      dto.humidite !== null &&
      dto.humidite !== undefined &&
      dto.humidite >= HUMIDITE_MIN &&
      dto.humidite <= HUMIDITE_MAX;

    return temperatureOk && humiditeOk ? 'conforme' : 'en alerte';
  }

  create(dto: CreateMesureDto): Promise<Mesure> {
    const mesure = this.mesuresRepository.create({
      ...dto,
      statut: this.evaluateStatus(dto),
    });
    return this.mesuresRepository.save(mesure);
  }
}

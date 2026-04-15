import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mesure } from './mesure.entity';
import { CreateMesureDto } from './dto/create-mesure.dto';

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

  findByEntrepot(idEntrepot: string): Promise<Mesure[]> {
    return this.mesuresRepository.find({
      where: { id_entrepot: idEntrepot },
      order: { timestamp: 'DESC' },
    });
  }

  create(dto: CreateMesureDto): Promise<Mesure> {
    const mesure = this.mesuresRepository.create(dto);
    return this.mesuresRepository.save(mesure);
  }
}

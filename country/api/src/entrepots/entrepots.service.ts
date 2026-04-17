import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Entrepot } from './entrepot.entity';
import { CreateEntrepotDto } from './dto/create-entrepot.dto';
import { UpdateEntrepotDto } from './dto/update-entrepot.dto';

@Injectable()
export class EntrepotsService {
  constructor(
    @InjectRepository(Entrepot)
    private readonly entrepotsRepository: Repository<Entrepot>,
  ) {}

  findAll(): Promise<Entrepot[]> {
    return this.entrepotsRepository.find();
  }

  findByExploitation(id_exploitation: number): Promise<Entrepot[]> {
    return this.entrepotsRepository.findBy({ id_exploitation });
  }

  async findOne(id: number): Promise<Entrepot> {
    const entrepot = await this.entrepotsRepository.findOneBy({ id_entrepot: id });
    if (!entrepot) throw new NotFoundException('Entrepôt non trouvé');
    return entrepot;
  }

  create(dto: CreateEntrepotDto): Promise<Entrepot> {
    const entrepot = this.entrepotsRepository.create(dto);
    return this.entrepotsRepository.save(entrepot);
  }

  async update(id: number, dto: UpdateEntrepotDto): Promise<Entrepot> {
    await this.findOne(id);
    await this.entrepotsRepository.update({ id_entrepot: id }, dto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.entrepotsRepository.delete({ id_entrepot: id });
  }
}

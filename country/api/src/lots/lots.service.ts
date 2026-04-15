import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lot } from './lot.entity';
import { CreateLotDto } from './dto/create-lot.dto';
import { UpdateLotDto } from './dto/update-lot.dto';

@Injectable()
export class LotsService {
  constructor(
    @InjectRepository(Lot)
    private readonly lotsRepository: Repository<Lot>,
  ) {}

  findAll(): Promise<Lot[]> {
    return this.lotsRepository.find();
  }

  async findOne(id: string): Promise<Lot> {
    const lot = await this.lotsRepository.findOneBy({ id_lot: id });
    if (!lot) throw new NotFoundException('Lot non trouvé');
    return lot;
  }

  create(dto: CreateLotDto): Promise<Lot> {
    const lot = this.lotsRepository.create(dto);
    return this.lotsRepository.save(lot);
  }

  async update(id: string, dto: UpdateLotDto): Promise<Lot> {
    await this.findOne(id);
    await this.lotsRepository.update({ id_lot: id }, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.lotsRepository.delete({ id_lot: id });
  }
}

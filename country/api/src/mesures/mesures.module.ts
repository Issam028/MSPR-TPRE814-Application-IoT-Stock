import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mesure } from './mesure.entity';
import { MesuresService } from './mesures.service';
import { MesuresController } from './mesures.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mesure])],
  controllers: [MesuresController],
  providers: [MesuresService],
})
export class MesuresModule {}

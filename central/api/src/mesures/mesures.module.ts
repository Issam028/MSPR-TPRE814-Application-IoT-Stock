import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MesuresService } from './mesures.service';
import { MesuresController } from './mesures.controller';

@Module({
  imports: [HttpModule.register({ timeout: 5000 })],
  controllers: [MesuresController],
  providers: [MesuresService],
})
export class MesuresModule {}

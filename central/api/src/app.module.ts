import { Module } from '@nestjs/common';
import { LotsModule } from './lots/lots.module';
import { MesuresModule } from './mesures/mesures.module';

@Module({
  imports: [
    LotsModule,
    MesuresModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { LotsModule } from './lots/lots.module';
import { MesuresModule } from './mesures/mesures.module';
import { ExploitationsModule } from './exploitations/exploitations.module';
import { EntrepotsModule } from './entrepots/entrepots.module';

@Module({
  imports: [
    LotsModule,
    MesuresModule,
    ExploitationsModule,
    EntrepotsModule,
  ],
})
export class AppModule {}

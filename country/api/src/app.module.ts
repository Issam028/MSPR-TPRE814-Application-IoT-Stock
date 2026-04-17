import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotsModule } from './lots/lots.module';
import { MesuresModule } from './mesures/mesures.module';
import { ExploitationsModule } from './exploitations/exploitations.module';
import { EntrepotsModule } from './entrepots/entrepots.module';
import { Lot } from './lots/lot.entity';
import { Mesure } from './mesures/mesure.entity';
import { Exploitation } from './exploitations/exploitation.entity';
import { Entrepot } from './entrepots/entrepot.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'root',
      database: process.env.DB_NAME || 'brazil_db',
      entities: [Lot, Mesure, Exploitation, Entrepot],
      synchronize: true,
    }),
    LotsModule,
    MesuresModule,
    ExploitationsModule,
    EntrepotsModule,
  ],
})
export class AppModule {}

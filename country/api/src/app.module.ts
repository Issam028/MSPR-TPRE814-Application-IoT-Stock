import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LotsModule } from './lots/lots.module';
import { MesuresModule } from './mesures/mesures.module';
import { Lot } from './lots/lot.entity';
import { Mesure } from './mesures/mesure.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'root',
      database: process.env.DB_NAME || 'futurekawa_db',
      entities: [Lot, Mesure],
      synchronize: false,
    }),
    LotsModule,
    MesuresModule,
  ],
})
export class AppModule {}

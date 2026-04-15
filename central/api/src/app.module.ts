import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { LotsModule } from './lots/lots.module';
import { MesuresModule } from './mesures/mesures.module';

@Module({
  imports: [
    HttpModule.register({
      baseURL: process.env.COUNTRY_API_URL || 'http://localhost:3000',
      timeout: 5000,
    }),
    LotsModule,
    MesuresModule,
  ],
})
export class AppModule {}

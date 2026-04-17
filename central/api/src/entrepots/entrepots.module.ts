import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EntrepotsService } from './entrepots.service';
import { EntrepotsController } from './entrepots.controller';

@Module({
  imports: [HttpModule.register({ timeout: 5000 })],
  controllers: [EntrepotsController],
  providers: [EntrepotsService],
})
export class EntrepotsModule {}

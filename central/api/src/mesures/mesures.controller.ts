import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { MesuresService } from './mesures.service';

@Controller('mesures')
export class MesuresController {
  constructor(private readonly mesuresService: MesuresService) {}

  @Get()
  findAll() {
    return this.mesuresService.findAll();
  }

  @Get('entrepot/:id')
  findByEntrepot(@Param('id') id: string) {
    return this.mesuresService.findByEntrepot(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mesuresService.findOne(+id);
  }

  @Post()
  create(@Body() body: any) {
    return this.mesuresService.create(body);
  }
}

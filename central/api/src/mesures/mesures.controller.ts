import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { MesuresService } from './mesures.service';

@Controller(':country/mesures')
export class MesuresController {
  constructor(private readonly mesuresService: MesuresService) {}

  @Get()
  findAll(@Param('country') country: string) {
    return this.mesuresService.findAll(country);
  }

  @Get('entrepot/:id')
  findByEntrepot(@Param('country') country: string, @Param('id') id: string) {
    return this.mesuresService.findByEntrepot(country, id);
  }

  @Get(':id')
  findOne(@Param('country') country: string, @Param('id') id: string) {
    return this.mesuresService.findOne(country, +id);
  }

  @Post()
  create(@Param('country') country: string, @Body() body: any) {
    return this.mesuresService.create(country, body);
  }
}

import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { LotsService } from './lots.service';

@Controller(':country/lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  @Get()
  findAll(@Param('country') country: string) {
    return this.lotsService.findAll(country);
  }

  @Get('entrepot/:id')
  findByEntrepot(@Param('country') country: string, @Param('id') id: string) {
    return this.lotsService.findByEntrepot(country, id);
  }

  @Get(':id')
  findOne(@Param('country') country: string, @Param('id') id: string) {
    return this.lotsService.findOne(country, id);
  }

  @Post()
  create(@Param('country') country: string, @Body() body: any) {
    return this.lotsService.create(country, body);
  }

  @Put(':id')
  update(@Param('country') country: string, @Param('id') id: string, @Body() body: any) {
    return this.lotsService.update(country, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('country') country: string, @Param('id') id: string) {
    return this.lotsService.remove(country, id);
  }
}

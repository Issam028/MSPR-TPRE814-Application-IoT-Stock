import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { EntrepotsService } from './entrepots.service';

@Controller(':country/entrepots')
export class EntrepotsController {
  constructor(private readonly entrepotsService: EntrepotsService) {}

  @Get()
  findAll(@Param('country') country: string) {
    return this.entrepotsService.findAll(country);
  }

  @Get('exploitation/:id')
  findByExploitation(@Param('country') country: string, @Param('id') id: string) {
    return this.entrepotsService.findByExploitation(country, id);
  }

  @Get(':id')
  findOne(@Param('country') country: string, @Param('id') id: string) {
    return this.entrepotsService.findOne(country, id);
  }

  @Post()
  create(@Param('country') country: string, @Body() body: any) {
    return this.entrepotsService.create(country, body);
  }

  @Put(':id')
  update(@Param('country') country: string, @Param('id') id: string, @Body() body: any) {
    return this.entrepotsService.update(country, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('country') country: string, @Param('id') id: string) {
    return this.entrepotsService.remove(country, id);
  }
}

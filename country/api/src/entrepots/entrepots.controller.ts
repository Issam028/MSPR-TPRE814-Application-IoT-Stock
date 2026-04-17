import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { EntrepotsService } from './entrepots.service';
import { CreateEntrepotDto } from './dto/create-entrepot.dto';
import { UpdateEntrepotDto } from './dto/update-entrepot.dto';

@Controller('entrepots')
export class EntrepotsController {
  constructor(private readonly entrepotsService: EntrepotsService) {}

  @Get()
  findAll() {
    return this.entrepotsService.findAll();
  }

  @Get('exploitation/:id')
  findByExploitation(@Param('id') id: string) {
    return this.entrepotsService.findByExploitation(+id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entrepotsService.findOne(+id);
  }

  @Post()
  create(@Body() dto: CreateEntrepotDto) {
    return this.entrepotsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEntrepotDto) {
    return this.entrepotsService.update(+id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.entrepotsService.remove(+id);
  }
}

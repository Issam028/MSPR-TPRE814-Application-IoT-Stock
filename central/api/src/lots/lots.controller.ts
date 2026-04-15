import { Controller, Get, Post, Put, Delete, Param, Body, HttpCode } from '@nestjs/common';
import { LotsService } from './lots.service';

@Controller('lots')
export class LotsController {
  constructor(private readonly lotsService: LotsService) {}

  @Get()
  findAll() {
    return this.lotsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lotsService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.lotsService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.lotsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string) {
    return this.lotsService.remove(id);
  }
}

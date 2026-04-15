import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LotsService {
  constructor(private readonly httpService: HttpService) {}

  async findAll() {
    const { data } = await firstValueFrom(this.httpService.get('/lots'));
    return data;
  }

  async findOne(id: string) {
    const { data } = await firstValueFrom(this.httpService.get(`/lots/${id}`));
    return data;
  }

  async create(body: any) {
    const { data } = await firstValueFrom(this.httpService.post('/lots', body));
    return data;
  }

  async update(id: string, body: any) {
    const { data } = await firstValueFrom(this.httpService.put(`/lots/${id}`, body));
    return data;
  }

  async remove(id: string) {
    const { data } = await firstValueFrom(this.httpService.delete(`/lots/${id}`));
    return data;
  }
}

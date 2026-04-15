import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MesuresService {
  constructor(private readonly httpService: HttpService) {}

  async findAll() {
    const { data } = await firstValueFrom(this.httpService.get('/mesures'));
    return data;
  }

  async findOne(id: number) {
    const { data } = await firstValueFrom(this.httpService.get(`/mesures/${id}`));
    return data;
  }

  async findByEntrepot(idEntrepot: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`/mesures/entrepot/${idEntrepot}`),
    );
    return data;
  }

  async create(body: any) {
    const { data } = await firstValueFrom(this.httpService.post('/mesures', body));
    return data;
  }
}

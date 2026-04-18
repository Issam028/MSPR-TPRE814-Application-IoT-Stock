import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const COUNTRY_URLS: Record<string, string> = {
  brazil: process.env.BRAZIL_API_URL || 'http://api_brazil:3000',
  colombia: process.env.COLOMBIA_API_URL || 'http://api_colombia:3000',
};

@Injectable()
export class MesuresService {
  constructor(private readonly httpService: HttpService) {}

  private getBaseUrl(country: string): string {
    const url = COUNTRY_URLS[country.toLowerCase()];
    if (!url) throw new NotFoundException(`Pays '${country}' non supporté`);
    return url;
  }

  async findAll(country: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.getBaseUrl(country)}/mesures`),
    );
    return data;
  }

  async findOne(country: string, id: number) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.getBaseUrl(country)}/mesures/${id}`),
    );
    return data;
  }

  async findByEntrepot(country: string, idEntrepot: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.getBaseUrl(country)}/mesures/entrepot/${idEntrepot}`),
    );
    return data;
  }

  async findLatestByEntrepot(country: string, idEntrepot: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.getBaseUrl(country)}/mesures/entrepot/${idEntrepot}/latest`),
    );
    return data;
  }

  async create(country: string, body: any) {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.getBaseUrl(country)}/mesures`, body),
    );
    return data;
  }
}

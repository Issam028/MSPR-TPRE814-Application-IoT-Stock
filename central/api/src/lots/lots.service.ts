import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const COUNTRY_URLS: Record<string, string> = {
  brazil: process.env.BRAZIL_API_URL || 'http://api_brazil:3000',
  colombia: process.env.COLOMBIA_API_URL || 'http://api_colombia:3000',
};

@Injectable()
export class LotsService {
  constructor(private readonly httpService: HttpService) {}

  private getBaseUrl(country: string): string {
    const url = COUNTRY_URLS[country.toLowerCase()];
    if (!url) throw new NotFoundException(`Pays '${country}' non supporté`);
    return url;
  }

  async findAll(country: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.getBaseUrl(country)}/lots`),
    );
    return data;
  }

  async findOne(country: string, id: string) {
    const { data } = await firstValueFrom(
      this.httpService.get(`${this.getBaseUrl(country)}/lots/${id}`),
    );
    return data;
  }

  async create(country: string, body: any) {
    const { data } = await firstValueFrom(
      this.httpService.post(`${this.getBaseUrl(country)}/lots`, body),
    );
    return data;
  }

  async update(country: string, id: string, body: any) {
    const { data } = await firstValueFrom(
      this.httpService.put(`${this.getBaseUrl(country)}/lots/${id}`, body),
    );
    return data;
  }

  async remove(country: string, id: string) {
    await firstValueFrom(
      this.httpService.delete(`${this.getBaseUrl(country)}/lots/${id}`),
    );
  }
}

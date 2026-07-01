import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

interface AlertMessage {
  subject: string;
  text: string;
}

type AlertMode = 'disabled' | 'log' | 'smtp';

@Injectable()
export class AlertNotificationService {
  private readonly logger = new Logger(AlertNotificationService.name);

  async notifyMeasureAlert(params: {
    idMesure: number;
    idEntrepot: number;
    temperature: number;
    humidite: number;
    statut: string;
    temperatureMin: number;
    temperatureMax: number;
    humiditeMin: number;
    humiditeMax: number;
  }): Promise<void> {
    await this.sendAlert({
      subject: `[FutureKawa] Alerte entrepot ${params.idEntrepot}`,
      text: [
        `Une mesure est en alerte pour l'entrepot ${params.idEntrepot}.`,
        '',
        `Mesure: ${params.idMesure}`,
        `Temperature: ${params.temperature} C`,
        `Humidite: ${params.humidite} %`,
        `Statut: ${params.statut}`,
        '',
        `Seuils attendus: temperature ${params.temperatureMin}-${params.temperatureMax} C, humidite ${params.humiditeMin}-${params.humiditeMax} %.`,
      ].join('\n'),
    });
  }

  async notifyLotAlert(params: {
    idLot: number;
    idEntrepot: number;
    statut: string;
    dateStockage?: Date | string;
  }): Promise<void> {
    await this.sendAlert({
      subject: `[FutureKawa] Alerte lot ${params.idLot}`,
      text: [
        `Un lot necessite une attention pour l'entrepot ${params.idEntrepot}.`,
        '',
        `Lot: ${params.idLot}`,
        `Date de stockage: ${params.dateStockage ?? 'non renseignee'}`,
        `Statut: ${params.statut}`,
        '',
        'Regle: un lot devient en alerte avant peremption, puis perime apres 365 jours.',
      ].join('\n'),
    });
  }

  private async sendAlert(message: AlertMessage): Promise<void> {
    const mode = this.getMode();

    if (mode === 'disabled') {
      return;
    }

    if (mode === 'log') {
      this.logger.warn(`EMAIL ALERT LOG\nSubject: ${message.subject}\n${message.text}`);
      return;
    }

    try {
      await this.sendSmtp(message);
    } catch (error) {
      this.logger.error(`Email alert failed: ${(error as Error).message}`);
    }
  }

  private getMode(): AlertMode {
    const mode = (process.env.ALERT_EMAIL_MODE ?? 'log').toLowerCase();

    if (mode === 'disabled' || mode === 'smtp') {
      return mode;
    }

    return 'log';
  }

  private async sendSmtp(message: AlertMessage): Promise<void> {
    const host = process.env.SMTP_HOST;
    const to = process.env.ALERT_EMAIL_TO;

    if (!host || !to) {
      this.logger.warn('SMTP alert skipped: SMTP_HOST or ALERT_EMAIL_TO is missing.');
      return;
    }

    const port = Number(process.env.SMTP_PORT ?? 587);
    const secure = (process.env.SMTP_SECURE ?? 'false').toLowerCase() === 'true';
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.ALERT_EMAIL_FROM ?? user ?? 'futurekawa-alerts@example.com';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
    });

    await transporter.sendMail({
      from,
      to,
      subject: message.subject,
      text: message.text,
    });

    this.logger.log(`Email alert sent to ${to}: ${message.subject}`);
  }
}

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('mesures')
export class Mesure {
  @PrimaryGeneratedColumn()
  id_mesure: number;

  @Column({ type: 'bigint', nullable: true })
  id_entrepot: number;

  @Column({ type: 'float', nullable: true })
  temperature: number;

  @Column({ type: 'float', nullable: true })
  humidite: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timestamp: Date;

  @Column({ length: 20, nullable: true })
  statut: string;
}

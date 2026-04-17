import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('lots')
export class Lot {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id_lot: number;

  @Column({ type: 'bigint', nullable: true })
  id_exploitation: number;

  @Column({ type: 'bigint', nullable: true })
  id_entrepot: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_stockage: Date;

  @Column({ length: 20, nullable: true })
  statut: string;
}

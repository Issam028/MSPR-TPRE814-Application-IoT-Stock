import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('lots')
export class Lot {
  @PrimaryColumn({ length: 50 })
  id_lot: string;

  @Column({ length: 50, nullable: true })
  pays: string;

  @Column({ length: 100, nullable: true })
  exploitation: string;

  @Column({ length: 100, nullable: true })
  entrepot: string;

  @Column({ type: 'timestamp', nullable: true })
  date_stockage: Date;

  @Column({ length: 20, nullable: true })
  statut: string;
}

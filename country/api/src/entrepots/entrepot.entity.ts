import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('entrepots')
export class Entrepot {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id_entrepot: number;

  @Column({ type: 'bigint', nullable: true })
  id_exploitation: number;

  @Column({ length: 100, nullable: true })
  nom: string;
}

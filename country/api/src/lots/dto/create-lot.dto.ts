export class CreateLotDto {
  id_lot: string;
  pays?: string;
  exploitation?: string;
  entrepot?: string;
  date_stockage?: Date;
  statut?: string;
}

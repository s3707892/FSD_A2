import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('BookingStatus')
export class BookingStatus {
  @PrimaryGeneratedColumn()
  statusId: number;

  @Column()
  statusName: string;
}

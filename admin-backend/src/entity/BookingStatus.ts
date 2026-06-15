// stores the possible statuses a booking can have such as pending, approved or rejected
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('BookingStatus')
export class BookingStatus {
  @PrimaryGeneratedColumn()
  statusId: number;

  @Column()
  statusName: string;
}

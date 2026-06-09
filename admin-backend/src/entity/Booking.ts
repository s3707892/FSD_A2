import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Venue } from './Venue';
import { User } from './User';
import { BookingStatus } from './BookingStatus';

@Entity('Booking')
export class Booking {
  @PrimaryGeneratedColumn()
  bookingId: number;

  @Column()
  userId: number;

  @Column()
  venueId: number;

  @Column({ nullable: true })
  statusId: number;

  @Column()
  startDateTime: Date;

  @Column()
  eventName: string;

  @Column()
  guests: number;

  @Column()
  duration: number;

  @CreateDateColumn()
  dateSubmitted: Date;

  @ManyToOne(() => Venue, (v) => v.bookings)
  @JoinColumn({ name: 'venueId' })
  venue: Venue;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => BookingStatus)
  @JoinColumn({ name: 'statusId' })
  bookingStatus: BookingStatus;
}

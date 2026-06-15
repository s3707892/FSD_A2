// represents a venue with address, pricing and availability details
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { State } from './State';
import { Booking } from './Booking';

@Entity('Venue')
export class Venue {
  @PrimaryGeneratedColumn()
  venueId: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  suburb: string;

  @Column({ nullable: true })
  postcode: string;

  @Column({ nullable: true })
  capacity: number;

  @Column({ nullable: true })
  hourlyPrice: number;

  @Column({ nullable: true })
  description: string;

  @Column({ default: true })
  active: boolean;

  @Column({ nullable: true })
  featured: boolean;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  stateId: number;

  @ManyToOne(() => User, (u) => u.venues)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => State)
  @JoinColumn({ name: 'stateId' })
  state: State;

  @OneToMany(() => Booking, (b) => b.venue)
  bookings: Booking[];
}

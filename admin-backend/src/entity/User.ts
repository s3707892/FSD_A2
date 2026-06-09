import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Venue } from './Venue';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  userId: number;

  @Column()
  email: string;

  @Column({ nullable: true })
  roleId: number;

  @OneToMany(() => Venue, (v) => v.user)
  venues: Venue[];
}

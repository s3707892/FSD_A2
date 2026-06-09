import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('State')
export class State {
  @PrimaryGeneratedColumn()
  stateId: number;

  @Column()
  stateName: string;
}

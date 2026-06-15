// stores australian state names referenced by venue addresses
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany } from "typeorm"
import { Venue } from "./Venue"



@Entity()
export class State extends BaseEntity {
    @PrimaryGeneratedColumn()
    stateId: number

    @Column({
        length: 20,
        unique: true,
    })
    state: string

    @OneToMany(() => Venue, (venue) => venue.state)
    venues: Venue[]
}
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { Venue } from "./Venue"

@Entity()
export class Blockouts extends BaseEntity {
    @PrimaryGeneratedColumn()
    blockoutId: number

    @ManyToOne(() => Venue, (venue) => venue.blockouts)
    @JoinColumn({ name: "venueId" })
    venue: Venue

    @Column({
    })
    startDate: Date

    @Column({
    })
    endDate: Date
}
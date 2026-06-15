// stores image file paths linked to a venue for display purposes
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, JoinColumn } from "typeorm"
import { Venue } from "./Venue"

@Entity()
export class Image extends BaseEntity {
    @PrimaryGeneratedColumn()
    imageId: number

    @ManyToOne(() => Venue, (venue) => venue.images)
    @JoinColumn({ name: "venueId" })
    venue: Venue

    @Column()
    path: string


}
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToOne, PrimaryColumn, JoinColumn } from "typeorm"
import { Venue } from "./Venue"
import { Suitability } from "./Suitability"


@Entity("VenueSuitability")
export class VenueSuitability extends BaseEntity {

    @PrimaryColumn()
    venueId: number

    @PrimaryColumn()
    suitabilityId: number
    
    @ManyToOne(() => Venue, (venue) => venue.venueSuitabilities)
    @JoinColumn({ name: "venueId" })
    venue: Venue

    @ManyToOne(() => Suitability, (suitability) => suitability.venueSuitabilities)
    @JoinColumn({ name: "suitabilityId" })
    suitability: Suitability
}
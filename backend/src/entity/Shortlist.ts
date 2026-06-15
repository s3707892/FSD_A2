// tracks which venues a hirer has shortlisted and their ranking order
import { Entity, Index, Column, BaseEntity, ManyToOne, PrimaryColumn, JoinColumn } from "typeorm"
import { Venue } from "./Venue"
import { User } from "./User"


@Entity()
export class Shortlist extends BaseEntity {

    @PrimaryColumn()
    userId: number

    @PrimaryColumn()
    venueId: number

    @ManyToOne(() => User, (user) => user.shortlists)
    @JoinColumn({ name: "userId" })
    user: User

    @ManyToOne(() => Venue, (venue) => venue.shortlists)
    @JoinColumn({ name: "venueId" })
    venue: Venue

    @Index("Shortlist_ranking")
    @Column()
    ranking: number
}
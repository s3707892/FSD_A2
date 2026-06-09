import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { Image } from "./Image"
import { State } from "./State"
import { Blockouts } from "./Blockouts"
import { VenueSuitability } from "./VenueSuitability"
import { Shortlist } from "./Shortlist"
import { Booking } from "./Booking"
import { User } from "./User"

@Entity()
export class Venue extends BaseEntity {
    @PrimaryGeneratedColumn()
    venueId: number

    @Column({ nullable: true })
    userId: number

    @ManyToOne(() => User, (user) => user.venues, { nullable: true })
    @JoinColumn({ name: "userId" })
    user: User

    @Column({
        length: 30,
    })
    name: string

    @Column({
        length: 50,
    })
    addressLine1: string

    @Column({
        length: 50,
        nullable: true,
    })
    addressLine2: string

    @ManyToOne(() => State, (state) => state.venues)
    @JoinColumn({ name: "stateId" })
    state: State


    @Column({
        length: 30,
    })
    suburb: string

    @Column({
        length: 6,
    })
    postcode: string

    @Column({
    })
    capacity: number

    @Column({

    })
    active: boolean

    @Column({ default: false })
    featured: boolean

    @Column({
    })
    description: string

    @Column("decimal",{
        precision: 19,
        scale: 2,
    })
    hourlyPrice: number

    @OneToMany(() => Image, (image) => image.venue)
    images: Image[]

    @OneToMany(() => Blockouts, (blockout) => blockout.venue)
    blockouts: Blockouts[]

    @OneToMany(() => VenueSuitability, (venueSuitability) => venueSuitability.venue)
    venueSuitabilities: VenueSuitability[]

    @OneToMany(() => Shortlist, (shortlist) => shortlist.venue)
    shortlists: Shortlist[]

    @OneToMany(() => Booking, (booking) => booking.venue)
    bookings: Booking[]
}
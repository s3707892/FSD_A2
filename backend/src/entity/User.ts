import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany, OneToOne, JoinColumn, CreateDateColumn } from "typeorm"
import { Role } from "./Role"
import { Shortlist } from "./Shortlist"
import { Booking } from "./Booking"
import { Person } from "./Person"
import { Vendor } from "./Vendor"
import { Venue } from "./Venue"

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    userId: number

    @Column({length: 50, unique: true})
    email: string

    @Column()
    password: string

    @Column({length: 20})
    phone: string

    @CreateDateColumn()
    createdAt: Date

    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn({ name: "roleId" })
    role: Role

    @OneToMany(() => Shortlist, (shortlist) => shortlist.user)
    shortlists: Shortlist[]

    @OneToMany(() => Booking, (booking) => booking.user)
    bookings: Booking[]

    @OneToOne(() => Person, (person) => person.user)
    person: Person

    @OneToOne(() => Vendor, (vendor) => vendor.user)
    vendor: Vendor

    @OneToMany(() => Venue, (venue) => venue.user)
    venues: Venue[]
}
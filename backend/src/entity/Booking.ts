// represents a booking submitted by a hirer for a specific venue
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToOne, CreateDateColumn, OneToOne, JoinColumn } from "typeorm"
import { Venue } from "./Venue"
import { User } from "./User"
import { BookingStatus } from "./BookingStatus"
import { Review } from "./Review"


@Entity()
export class Booking extends BaseEntity {
    @PrimaryGeneratedColumn()
    bookingId: number

    @ManyToOne(() => User, (user) => user.bookings)
    @JoinColumn({ name: "userId" })
    user: User

    @ManyToOne(() => Venue, (venue) => venue.bookings)
    @JoinColumn({ name: "venueId" })
    venue: Venue

    @ManyToOne(() => BookingStatus, (bookingStatus) => bookingStatus.bookingId)
    @JoinColumn({ name: "statusId" })
    bookingStatus: BookingStatus

    @Column()
    startDateTime: Date

    @Column()
    eventName: string

    @Column()
    guests: number

    @Column()
    duration: number

    @Column({
        length: 20,
        nullable: true,
    })
    abn: string

    @Column({ type: 'text', nullable: true })
    licensePhoto: string

    @Column({ type: 'text', nullable: true })
    liabilityDoc: string

    @Column({ type: 'text', nullable: true })
    abnDoc: string

    @CreateDateColumn()
    dateSubmitted: Date

    @OneToOne(() => Review, (review) => review.booking)
    review: Review
}
// stores a star rating and optional comment left by a hirer after a completed booking
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, CreateDateColumn, OneToOne, JoinColumn } from "typeorm"
import { Booking } from "./Booking"



@Entity()
export class Review extends BaseEntity {
    @PrimaryGeneratedColumn()
    reviewId: number

    @OneToOne(() => Booking, (booking) => booking.review)
    @JoinColumn({ name: "bookingId" })
    booking: Booking

    @Column("decimal", 
    { 
        precision: 2,
        scale: 1 
    })

    rating: number

    @Column({
        nullable: true,
    })
    comment: string

    @CreateDateColumn()
    createdAt: Date
}
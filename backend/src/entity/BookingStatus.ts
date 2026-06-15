// stores the possible statuses a booking can have such as pending, approved or rejected
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToOne } from "typeorm"
import { Booking } from "./Booking"



@Entity("BookingStatus")
export class BookingStatus extends BaseEntity {
    @PrimaryGeneratedColumn()
    statusId: number


    @Column({
        length: 20,
    })
    statusName: string

    @OneToMany(() => Booking, (booking) => booking.bookingStatus)
    bookingId: Booking[]
        
}
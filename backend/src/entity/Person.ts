import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne, OneToMany, JoinColumn, PrimaryColumn, OneToOne } from "typeorm"
import { User } from "./User";


@Entity()
export class Person extends BaseEntity {

    @PrimaryColumn()
    userId: number

    @OneToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User

    @Column({ length: 20 })
    firstName: string

    @Column({ length: 20 })
    lastName: string
}
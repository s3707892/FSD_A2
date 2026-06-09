import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToOne } from "typeorm"
import { User } from "./User"



@Entity()
export class Role extends BaseEntity {

    @PrimaryGeneratedColumn()
    roleId: number

    @Column({
        length: 15,
        unique: true,
    })
    roleName: string

    @OneToMany(() => User, (user) => user.role)
    users: User[]

}
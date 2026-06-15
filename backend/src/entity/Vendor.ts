// stores business name details for vendor accounts linked one to one with user
import { Entity, Column, BaseEntity, JoinColumn, PrimaryColumn, OneToOne } from "typeorm"
import { User } from "./User";


@Entity()
export class Vendor extends BaseEntity {

    @PrimaryColumn()
    userId: number

    @OneToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User

    @Column({ length: 50 })
    businessName: string

}
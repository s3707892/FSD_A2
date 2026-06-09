import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany, ManyToOne } from "typeorm"
import { VenueSuitability } from "./VenueSuitability"


@Entity()
export class Suitability extends BaseEntity {

    @PrimaryGeneratedColumn()
    suitabilityId: number

    @Column({
        length: 30,
    })
    name: string

    @OneToMany(() => VenueSuitability, (venueSuitability) => venueSuitability.suitability)
    venueSuitabilities: VenueSuitability[]

}
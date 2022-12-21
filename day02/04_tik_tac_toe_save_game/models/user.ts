import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    score: string
}

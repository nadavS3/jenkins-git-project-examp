import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Fact {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ name: "grain_obj_id", type: "varchar", length: 255 })
    grainObjId: string;

    @Column({ name: "fact_type", type: "varchar", length: 45, nullable: false })
    factType: string;

    @Column({ name: "fact_value", type: "varchar", length: 255, charset: "utf8", nullable: true, default: null })
    factValue: string;

    @Column({ name: "fact_value_id", type: "varchar", length: 255, nullable: true, default: null })
    factValueId: string;

    @Column({ name: "ts", type: 'timestamp', precision: 6, nullable: false })
    timeStamp: Date;
}

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum VehicleType {
  TWO_WHEELER = 'TWO_WHEELER',
  FOUR_WHEELER = 'FOUR_WHEELER',
}

@Entity('vehicle')
@Index(['licensePlate'], { unique: true })
export class Vehicle {
  @PrimaryGeneratedColumn()
  vehicleId: number;

  @Column({ type: 'varchar', length: 20, unique: true })
  licensePlate: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.FOUR_WHEELER,
  })
  vehicleType: VehicleType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ownerName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ownerEmail: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  ownerPhone: string;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}

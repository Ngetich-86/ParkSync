import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
// SlotType is now VehicleType - using local enum

export enum VehicleType {
  TWO_WHEELER = 'TWO_WHEELER',
  FOUR_WHEELER = 'FOUR_WHEELER',
}

export enum ReservationType {
  RESERVED = 'RESERVED',
  PUBLIC = 'PUBLIC',
}

@Entity('parking_slot')
@Index(['floorId', 'slotNumber'], { unique: true })
export class ParkingSlot {
  @PrimaryGeneratedColumn()
  parkingSlotId: number;

  @Column({ type: 'int', nullable: true })
  floorId: number;

  @Column({ type: 'varchar', length: 50 })
  slotNumber: string;

  @Column({
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.FOUR_WHEELER,
  })
  slotType: VehicleType;

  @Column({
    type: 'enum',
    enum: ReservationType,
    default: ReservationType.PUBLIC,
  })
  reservationType: ReservationType;

  @Column({ type: 'boolean', default: false })
  isOccupied: boolean;

  @Column({ type: 'boolean', default: false })
  isMaintenance: boolean;

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


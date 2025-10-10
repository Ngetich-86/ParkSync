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

export enum SlotType {
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
    enum: SlotType,
    default: SlotType.FOUR_WHEELER,
  })
  slotType: SlotType;

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

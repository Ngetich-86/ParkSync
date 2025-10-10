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
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { ParkingSlot } from '../../parking-slot/entities/parking-slot.entity';

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Entity('reservation')
@Index(['vehicleId', 'startTime'])
@Index(['slotId', 'startTime'])
@Index(['status'])
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  vehicleId: number;

  @Column({ type: 'int' })
  slotId: number;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.ACTIVE,
  })
  status: ReservationStatus;

  @Column({ type: 'timestamp' })
  entryTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  exitTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

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

  // Relations
  @ManyToOne(() => Vehicle, { eager: true })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @ManyToOne(() => ParkingSlot, { eager: true })
  @JoinColumn({ name: 'slotId' })
  parkingSlot: ParkingSlot;
}

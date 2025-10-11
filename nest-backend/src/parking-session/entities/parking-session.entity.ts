import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
  Index,
} from 'typeorm';
import { Vehicle } from '../../vehicles/entities/vehicle.entity';
import { ParkingSlot } from '../../parking-slot/entities/parking-slot.entity';
import { Payment } from '../../payments/entities/payment.entity';

@Entity('parking_session')
@Index(['vehicleId', 'entryTime'])
@Index(['slotId', 'entryTime'])
@Index(['entryTime'])
export class ParkingSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  vehicleId: number;

  @Column({ type: 'int' })
  slotId: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  entryTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  exitTime: Date;

  @Column({ type: 'int', nullable: true })
  duration: number; // in minutes

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amountPaid: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Vehicle, { eager: true })
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;

  @ManyToOne(() => ParkingSlot, { eager: true })
  @JoinColumn({ name: 'slotId' })
  slot: ParkingSlot;

  @OneToOne(() => Payment, { eager: true, nullable: true })
  @JoinColumn()
  payment: Payment;
}

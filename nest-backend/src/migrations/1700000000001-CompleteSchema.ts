import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex, TableForeignKey } from 'typeorm';

export class CompleteSchema1700000000001 implements MigrationInterface {
  name = 'CompleteSchema1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('superadmin', 'admin', 'manager', 'attendant', 'customer')`);
    await queryRunner.query(`CREATE TYPE "public"."role_enum" AS ENUM('ADMIN', 'USER')`);
    await queryRunner.query(`CREATE TYPE "public"."slot_type_enum" AS ENUM('RESERVED', 'NON_RESERVED')`);
    await queryRunner.query(`CREATE TYPE "public"."payment_status_enum" AS ENUM('PENDING', 'SUCCESS', 'FAILED')`);
    await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('PARKED', 'RESERVED', 'SLOT_VIOLATION')`);
    await queryRunner.query(`CREATE TYPE "public"."vehicle_type_enum" AS ENUM('TWO_WHEELER', 'FOUR_WHEELER')`);
    await queryRunner.query(`CREATE TYPE "public"."reservation_type_enum" AS ENUM('RESERVED', 'PUBLIC')`);
    await queryRunner.query(`CREATE TYPE "public"."reservation_status_enum" AS ENUM('ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED')`);

    // Create user table (if not exists)
    const userTableExists = await queryRunner.hasTable('user');
    if (!userTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'user',
          columns: [
            {
              name: 'userId',
              type: 'int',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'email',
              type: 'varchar',
              length: '255',
              isUnique: true,
            },
            {
              name: 'password',
              type: 'varchar',
              length: '255',
            },
            {
              name: 'role',
              type: 'enum',
              enum: ['superadmin', 'admin', 'manager', 'attendant', 'customer'],
              default: "'customer'",
            },
            {
              name: 'hashedRefreshToken',
              type: 'varchar',
              length: '255',
              isNullable: true,
            },
            {
              name: 'is_active',
              type: 'boolean',
              default: true,
            },
            {
              name: 'is_available',
              type: 'boolean',
              default: true,
            },
            {
              name: 'created_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'updated_at',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
              onUpdate: 'CURRENT_TIMESTAMP',
            },
          ],
        }),
        true,
      );
    }

    // Create vehicle table
    await queryRunner.createTable(
      new Table({
        name: 'vehicle',
        columns: [
          {
            name: 'vehicleId',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'licensePlate',
            type: 'varchar',
            length: '20',
            isUnique: true,
          },
          {
            name: 'vehicleType',
            type: 'enum',
            enum: ['TWO_WHEELER', 'FOUR_WHEELER'],
            default: "'FOUR_WHEELER'",
          },
          {
            name: 'ownerName',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'ownerEmail',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'ownerPhone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create parking_slot table
    await queryRunner.createTable(
      new Table({
        name: 'parking_slot',
        columns: [
          {
            name: 'parkingSlotId',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'floorId',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'slotNumber',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'slotType',
            type: 'enum',
            enum: ['TWO_WHEELER', 'FOUR_WHEELER'],
            default: "'FOUR_WHEELER'",
          },
          {
            name: 'reservationType',
            type: 'enum',
            enum: ['RESERVED', 'PUBLIC'],
            default: "'PUBLIC'",
          },
          {
            name: 'isOccupied',
            type: 'boolean',
            default: false,
          },
          {
            name: 'isMaintenance',
            type: 'boolean',
            default: false,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create payment table
    await queryRunner.createTable(
      new Table({
        name: 'payment',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'amount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['PENDING', 'SUCCESS', 'FAILED'],
            default: "'PENDING'",
          },
          {
            name: 'transactionId',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'paymentMethod',
            type: 'varchar',
            length: '50',
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create parking_session table
    await queryRunner.createTable(
      new Table({
        name: 'parking_session',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'vehicleId',
            type: 'int',
          },
          {
            name: 'slotId',
            type: 'int',
          },
          {
            name: 'entryTime',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'exitTime',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'duration',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'amountPaid',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create reservation table
    await queryRunner.createTable(
      new Table({
        name: 'reservation',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'vehicleId',
            type: 'int',
          },
          {
            name: 'slotId',
            type: 'int',
          },
          {
            name: 'startTime',
            type: 'timestamp',
          },
          {
            name: 'endTime',
            type: 'timestamp',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'],
            default: "'ACTIVE'",
          },
          {
            name: 'entryTime',
            type: 'timestamp',
          },
          {
            name: 'exitTime',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'paymentStatus',
            type: 'enum',
            enum: ['PENDING', 'SUCCESS', 'FAILED'],
            default: "'PENDING'",
          },
          {
            name: 'duration',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'amountPaid',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'notes',
            type: 'varchar',
            length: '500',
            isNullable: true,
          },
          {
            name: 'customerName',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'customerEmail',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'customerPhone',
            type: 'varchar',
            length: '20',
            isNullable: true,
          },
          {
            name: 'notificationType',
            type: 'enum',
            enum: ['PARKED', 'RESERVED', 'SLOT_VIOLATION'],
            isNullable: true,
          },
          {
            name: 'isExtended',
            type: 'boolean',
            default: false,
          },
          {
            name: 'extensionCount',
            type: 'int',
            default: 0,
          },
          {
            name: 'lastExtensionTime',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex('vehicle', new TableIndex({
      name: 'IDX_vehicle_license_plate',
      columnNames: ['licensePlate'],
      isUnique: true,
    }));

    await queryRunner.createIndex('parking_slot', new TableIndex({
      name: 'IDX_parking_slot_floor_slot',
      columnNames: ['floorId', 'slotNumber'],
      isUnique: true,
    }));

    await queryRunner.createIndex('parking_session', new TableIndex({
      name: 'IDX_parking_session_vehicle_entry',
      columnNames: ['vehicleId', 'entryTime'],
    }));

    await queryRunner.createIndex('parking_session', new TableIndex({
      name: 'IDX_parking_session_slot_entry',
      columnNames: ['slotId', 'entryTime'],
    }));

    await queryRunner.createIndex('parking_session', new TableIndex({
      name: 'IDX_parking_session_entry_time',
      columnNames: ['entryTime'],
    }));

    await queryRunner.createIndex('reservation', new TableIndex({
      name: 'IDX_reservation_vehicle_start',
      columnNames: ['vehicleId', 'startTime'],
    }));

    await queryRunner.createIndex('reservation', new TableIndex({
      name: 'IDX_reservation_slot_start',
      columnNames: ['slotId', 'startTime'],
    }));

    await queryRunner.createIndex('reservation', new TableIndex({
      name: 'IDX_reservation_status',
      columnNames: ['status'],
    }));

    // Create foreign keys
    await queryRunner.createForeignKey('parking_session', new TableForeignKey({
      columnNames: ['vehicleId'],
      referencedColumnNames: ['vehicleId'],
      referencedTableName: 'vehicle',
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('parking_session', new TableForeignKey({
      columnNames: ['slotId'],
      referencedColumnNames: ['parkingSlotId'],
      referencedTableName: 'parking_slot',
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('reservation', new TableForeignKey({
      columnNames: ['vehicleId'],
      referencedColumnNames: ['vehicleId'],
      referencedTableName: 'vehicle',
      onDelete: 'CASCADE',
    }));

    await queryRunner.createForeignKey('reservation', new TableForeignKey({
      columnNames: ['slotId'],
      referencedColumnNames: ['parkingSlotId'],
      referencedTableName: 'parking_slot',
      onDelete: 'CASCADE',
    }));

    // Add payment foreign key to parking_session
    await queryRunner.addColumn('parking_session', new TableColumn({
      name: 'paymentId',
      type: 'uuid',
      isNullable: true,
    }));

    await queryRunner.createForeignKey('parking_session', new TableForeignKey({
      columnNames: ['paymentId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'payment',
      onDelete: 'SET NULL',
    }));

    // Add payment foreign key to reservation
    await queryRunner.addColumn('reservation', new TableColumn({
      name: 'paymentId',
      type: 'uuid',
      isNullable: true,
    }));

    await queryRunner.createForeignKey('reservation', new TableForeignKey({
      columnNames: ['paymentId'],
      referencedColumnNames: ['id'],
      referencedTableName: 'payment',
      onDelete: 'SET NULL',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.query(`ALTER TABLE "parking_session" DROP CONSTRAINT IF EXISTS "FK_parking_session_vehicle"`);
    await queryRunner.query(`ALTER TABLE "parking_session" DROP CONSTRAINT IF EXISTS "FK_parking_session_slot"`);
    await queryRunner.query(`ALTER TABLE "parking_session" DROP CONSTRAINT IF EXISTS "FK_parking_session_payment"`);
    await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT IF EXISTS "FK_reservation_vehicle"`);
    await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT IF EXISTS "FK_reservation_slot"`);
    await queryRunner.query(`ALTER TABLE "reservation" DROP CONSTRAINT IF EXISTS "FK_reservation_payment"`);

    // Drop tables
    await queryRunner.dropTable('reservation');
    await queryRunner.dropTable('parking_session');
    await queryRunner.dropTable('payment');
    await queryRunner.dropTable('parking_slot');
    await queryRunner.dropTable('vehicle');
    await queryRunner.dropTable('user');

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."reservation_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."reservation_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."vehicle_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."notification_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."payment_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."slot_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."role_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role_enum"`);
  }
}

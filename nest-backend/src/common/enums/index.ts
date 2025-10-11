export enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum SlotType {
  RESERVED = 'RESERVED',
  NON_RESERVED = 'NON_RESERVED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum NotificationType {
  PARKED = 'PARKED',
  RESERVED = 'RESERVED',
  SLOT_VIOLATION = 'SLOT_VIOLATION',
}

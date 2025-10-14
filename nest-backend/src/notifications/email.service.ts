// src/modules/email/email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { ParkingSlot } from 'src/parking-slot/entities/parking-slot.entity';
import { ParkingSession } from 'src/parking-session/entities/parking-session.entity';
import { Reservation } from 'src/reservations/entities/reservation.entity';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Note: Email templates may receive entities with varying relation shapes.
// We defensively access fields with optional chaining to avoid type issues at compile time.

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get<string>('SMTP_HOST');
    const smtpPort = Number(this.configService.get<string>('SMTP_PORT') || 587);
    const smtpSecure = (this.configService.get<string>('SMTP_SECURE') || 'false') === 'true';
    const smtpUser = this.configService.get<string>('SMTP_USER') || this.configService.get<string>('EMAIL_SENDER');
    const smtpPass = this.configService.get<string>('SMTP_PASS') || this.configService.get<string>('EMAIL_PASSWORD');
    const service = this.configService.get<string>('SMTP_SERVICE');

    // Prefer service if provided (e.g., 'gmail')
    if (service) {
      this.transporter = nodemailer.createTransport({
        service,
        auth: { user: smtpUser, pass: smtpPass },
      });
    } else if (smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
      });
    } else {
      // Fallback to ethereal for development if nothing configured
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: smtpUser || 'user@example.com',
          pass: smtpPass || 'password',
        },
      });
    }

    // Verify connection configuration
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('SMTP connection error:', error);
      } else {
        this.logger.log('SMTP server connection established successfully');
      }
    });
  }

  private async sendMail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get('SMTP_FROM') || this.configService.get('EMAIL_SENDER'),
        ...options,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent successfully to: ${options.to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}:`, error);
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  // 1. Parking Confirmation Email
  async sendParkingConfirmation(
    email: string,
    ownerName: string,
    slot: ParkingSlot,
    entryTime: Date,
    licensePlate: string,
  ): Promise<void> {
    const subject = '🅿️ Parking Confirmation - Garage Management System';
    const html = this.generateParkingConfirmationTemplate(
      ownerName,
      slot,
      entryTime,
      licensePlate,
    );

    await this.sendMail({ to: email, subject, html });
  }

  // 2. Exit Confirmation Email
  async sendExitConfirmation(
    email: string,
    ownerName: string,
    session: ParkingSession,
  ): Promise<void> {
    const subject = '🚪 Parking Exit Confirmation - Garage Management System';
    const html = this.generateExitConfirmationTemplate(ownerName, session);

    await this.sendMail({ to: email, subject, html });
  }

  // 3. Reservation Confirmation Email
  async sendReservationConfirmation(
    email: string,
    ownerName: string,
    reservation: Reservation,
  ): Promise<void> {
    const subject = '🔐 Reservation Confirmation - Garage Management System';
    const html = this.generateReservationConfirmationTemplate(
      ownerName,
      reservation,
    );

    await this.sendMail({ to: email, subject, html });
  }

  // 4. Reservation Reminder Email
  async sendReservationReminder(
    email: string,
    ownerName: string,
    reservation: Reservation,
  ): Promise<void> {
    const subject = '⏰ Reservation Reminder - Your Parking Slot is Reserved';
    const html = this.generateReservationReminderTemplate(
      ownerName,
      reservation,
    );

    await this.sendMail({ to: email, subject, html });
  }

  // 5. Violation Alert Email (Non-reserved in reserved slot)
  async sendViolationAlert(
    email: string,
    ownerName: string,
    slot: ParkingSlot,
    entryTime: Date,
  ): Promise<void> {
    const subject = '⚠️ Parking Violation Alert - Garage Management System';
    const html = this.generateViolationAlertTemplate(ownerName, slot, entryTime);

    await this.sendMail({ to: email, subject, html });
  }

  // 6. Payment Receipt Email
  async sendPaymentReceipt(
    email: string,
    ownerName: string,
    session: ParkingSession,
    paymentId: string,
  ): Promise<void> {
    const subject = '🧾 Payment Receipt - Garage Management System';
    const html = this.generatePaymentReceiptTemplate(
      ownerName,
      session,
      paymentId,
    );

    await this.sendMail({ to: email, subject, html });
  }

  // Email Template Generators
  private generateParkingConfirmationTemplate(
    ownerName: string,
    slot: ParkingSlot,
    entryTime: Date,
    licensePlate: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2c5530, #4CAF50); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .info-card { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #4CAF50; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🅿️ Parking Confirmation</h1>
            <p>Your vehicle has been successfully parked</p>
          </div>
          <div class="content">
            <p>Hello <strong>${ownerName}</strong>,</p>
            <p>Your vehicle has been successfully parked in our garage. Here are your parking details:</p>
            
            <div class="info-card">
              <h3>Parking Details</h3>
              <p><strong>License Plate:</strong> ${licensePlate}</p>
              <p><strong>Parking Slot:</strong> ${slot.slotNumber}</p>
              <p><strong>Floor:</strong> ${slot.floorId}</p>
              <p><strong>Slot Type:</strong> ${slot.slotType}</p>
              <p><strong>Reservation Type:</strong> ${slot.reservationType}</p>
              <p><strong>Entry Time:</strong> ${entryTime.toLocaleString()}</p>
            </div>

            <div class="info-card" style="border-left-color: #2196F3;">
              <h3>💡 Important Information</h3>
              <p>• Please keep this email for your records</p>
              <p>• You will receive an exit confirmation when you leave</p>
              <p>• Contact support if you need assistance</p>
            </div>

            <p>Thank you for choosing our parking service!</p>
          </div>
          <div class="footer">
            <p>Garage Management System<br>
            Contact: support@garagemanagement.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateExitConfirmationTemplate(
    ownerName: string,
    session: ParkingSession,
  ): string {
    const anySession = session as any;
    const entryTime = new Date(anySession.entryTime);
    const exitTime = new Date(anySession.exitTime);
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationHours = (durationMs / (1000 * 60 * 60)).toFixed(2);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1976D2, #2196F3); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .info-card { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2196F3; }
          .amount { font-size: 24px; font-weight: bold; color: #2c5530; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚪 Parking Exit Confirmation</h1>
            <p>Your vehicle has exited the parking garage</p>
          </div>
          <div class="content">
            <p>Hello <strong>${ownerName}</strong>,</p>
            <p>Your vehicle has successfully exited our parking garage. Here's your parking summary:</p>
            
            <div class="info-card">
              <h3>Parking Summary</h3>
              <p><strong>License Plate:</strong> ${anySession.vehicle?.licensePlate ?? anySession.vehicle?.license_plate ?? ''}</p>
              <p><strong>Parking Slot:</strong> ${anySession.slot?.slotNumber ?? anySession.parkingSlot?.slotNumber ?? ''}</p>
              <p><strong>Entry Time:</strong> ${entryTime.toLocaleString()}</p>
              <p><strong>Exit Time:</strong> ${exitTime.toLocaleString()}</p>
              <p><strong>Total Duration:</strong> ${durationHours} hours</p>
            </div>

            ${(anySession.totalAmount ?? anySession.amountPaid) ? `
              <div class="amount">
                Total Amount: $${anySession.totalAmount ?? anySession.amountPaid}
              </div>
              
              <div class="info-card" style="border-left-color: #4CAF50;">
                <h3>💰 Payment Information</h3>
                <p><strong>Amount Paid:</strong> $${anySession.totalAmount ?? anySession.amountPaid}</p>
                <p><strong>Payment Status:</strong> ${anySession.paymentStatus || anySession.payment?.status || 'Completed'}</p>
                <p>Thank you for your payment!</p>
              </div>
            ` : ''}

            <p>We hope to see you again soon!</p>
          </div>
          <div class="footer">
            <p>Garage Management System<br>
            Contact: support@garagemanagement.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateReservationConfirmationTemplate(
    ownerName: string,
    reservation: Reservation,
  ): string {
    const anyRes = reservation as any;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #7B1FA2, #9C27B0); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .info-card { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #9C27B0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Reservation Confirmed</h1>
            <p>Your parking slot has been reserved</p>
          </div>
          <div class="content">
            <p>Hello <strong>${ownerName}</strong>,</p>
            <p>Your parking reservation has been confirmed! Here are your reservation details:</p>
            
            <div class="info-card">
              <h3>Reservation Details</h3>
              <p><strong>Vehicle:</strong> ${anyRes.vehicle?.licensePlate ?? anyRes.vehicle?.license_plate ?? ''}</p>
              <p><strong>Reserved Slot:</strong> ${anyRes.slot?.slotNumber ?? anyRes.parkingSlot?.slotNumber ?? ''}</p>
              <p><strong>Floor:</strong> ${anyRes.slot?.floor?.floorNumber ?? anyRes.parkingSlot?.floorId ?? ''}</p>
              <p><strong>Start Time:</strong> ${new Date(anyRes.startTime).toLocaleString()}</p>
              <p><strong>End Time:</strong> ${new Date(anyRes.endTime).toLocaleString()}</p>
              <p><strong>Reservation ID:</strong> ${anyRes.id ?? anyRes.reservationId ?? ''}</p>
            </div>

            <div class="info-card" style="border-left-color: #FF9800;">
              <h3>📋 Important Notes</h3>
              <p>• Your reserved slot will be held until 15 minutes after your start time</p>
              <p>• Please arrive within your reserved time frame</p>
              <p>• You will receive a reminder 1 hour before your reservation starts</p>
              <p>• Contact support if you need to modify your reservation</p>
            </div>

            <p>We look forward to serving you!</p>
          </div>
          <div class="footer">
            <p>Garage Management System<br>
            Contact: support@garagemanagement.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateReservationReminderTemplate(
    ownerName: string,
    reservation: Reservation,
  ): string {
    const anyRes = reservation as any;
    const startTime = new Date(anyRes.startTime);
    const now = new Date();
    const hoursUntil = Math.ceil((startTime.getTime() - now.getTime()) / (1000 * 60 * 60));

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #FF9800, #FFB74D); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .info-card { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #FF9800; }
          .reminder { background: #FFF3E0; padding: 15px; border-radius: 8px; border: 2px solid #FFB74D; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Reservation Reminder</h1>
            <p>Your reserved parking slot is coming up soon!</p>
          </div>
          <div class="content">
            <p>Hello <strong>${ownerName}</strong>,</p>
            
            <div class="reminder">
              <h3>🕐 Friendly Reminder</h3>
              <p>Your reserved parking slot starts in <strong>${hoursUntil} hour(s)</strong>!</p>
            </div>
            
            <div class="info-card">
              <h3>Reservation Details</h3>
              <p><strong>Vehicle:</strong> ${anyRes.vehicle?.licensePlate ?? anyRes.vehicle?.license_plate ?? ''}</p>
              <p><strong>Reserved Slot:</strong> ${anyRes.slot?.slotNumber ?? anyRes.parkingSlot?.slotNumber ?? ''} (Floor ${anyRes.slot?.floor?.floorNumber ?? anyRes.parkingSlot?.floorId ?? ''})</p>
              <p><strong>Start Time:</strong> ${startTime.toLocaleString()}</p>
              <p><strong>End Time:</strong> ${new Date(anyRes.endTime).toLocaleString()}</p>
            </div>

            <div class="info-card" style="border-left-color: #4CAF50;">
              <h3>📍 Location Tips</h3>
              <p>• Your reserved slot is marked with special signage</p>
              <p>• Please have your reservation details ready</p>
              <p>• Contact us if you're running late</p>
            </div>

            <p>Safe travels and see you soon!</p>
          </div>
          <div class="footer">
            <p>Garage Management System<br>
            Contact: support@garagemanagement.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateViolationAlertTemplate(
    ownerName: string,
    slot: ParkingSlot,
    entryTime: Date,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D32F2F, #F44336); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .alert-card { background: #FFEBEE; padding: 15px; margin: 10px 0; border-radius: 8px; border: 2px solid #F44336; }
          .info-card { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #F44336; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚠️ Parking Violation Alert</h1>
            <p>Important notice regarding your parked vehicle</p>
          </div>
          <div class="content">
            <p>Hello <strong>${ownerName}</strong>,</p>
            
            <div class="alert-card">
              <h3>🚨 Important Alert</h3>
              <p>Your vehicle is currently parked in a <strong>RESERVED PARKING SLOT</strong> without a valid reservation.</p>
            </div>
            
            <div class="info-card">
              <h3>Violation Details</h3>
              <p><strong>Parking Slot:</strong> ${slot.slotNumber} (RESERVED SLOT)</p>
              <p><strong>Floor:</strong> ${slot.floorId}</p>
              <p><strong>Entry Time:</strong> ${entryTime.toLocaleString()}</p>
            </div>

            <div class="info-card" style="border-left-color: #2196F3;">
              <h3>🔄 Required Action</h3>
              <p>• Please move your vehicle to a public parking slot immediately</p>
              <p>• Additional charges may apply for reserved slot violations</p>
              <p>• Contact support if you believe this is an error</p>
            </div>

            <p>Thank you for your immediate attention to this matter.</p>
          </div>
          <div class="footer">
            <p>Garage Management System<br>
            Contact: support@garagemanagement.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generatePaymentReceiptTemplate(
    ownerName: string,
    session: ParkingSession,
    paymentId: string,
  ): string {
    const anySession = session as any;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #388E3C, #4CAF50); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 10px 10px; }
          .receipt { background: white; padding: 20px; margin: 10px 0; border-radius: 8px; border: 2px solid #4CAF50; }
          .amount { font-size: 28px; font-weight: bold; color: #2c5530; text-align: center; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .thank-you { text-align: center; font-size: 18px; color: #388E3C; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧾 Payment Receipt</h1>
            <p>Thank you for your payment</p>
          </div>
          <div class="content">
            <p>Hello <strong>${ownerName}</strong>,</p>
            <p>Your payment has been processed successfully. Here's your receipt:</p>
            
            <div class="receipt">
              <h3 style="text-align: center; color: #2c5530;">OFFICIAL RECEIPT</h3>
              
              <div class="amount">
                $${anySession.totalAmount ?? anySession.amountPaid}
              </div>
              
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Payment ID:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${paymentId}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>License Plate:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${anySession.vehicle?.licensePlate ?? anySession.vehicle?.license_plate ?? ''}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Parking Slot:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${anySession.slot?.slotNumber ?? anySession.parkingSlot?.slotNumber ?? ''}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Entry Time:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(anySession.entryTime).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Exit Time:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(anySession.exitTime).toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Payment Date:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date().toLocaleString()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Status:</strong></td>
                  <td style="padding: 8px; border-bottom: 1px solid #eee; color: #4CAF50;"><strong>PAID</strong></td>
                </tr>
              </table>
            </div>

            <div class="thank-you">
              ✅ Thank you for your business!
            </div>

            <p style="text-align: center; color: #666;">
              This receipt is your proof of payment. Please keep it for your records.
            </p>
          </div>
          <div class="footer">
            <p>Garage Management System<br>
            Contact: support@garagemanagement.com | Phone: (555) 123-4567</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
import { Twilio } from 'twilio';

export interface OTPService {
  generateOTP(): string;
  sendOTP(phoneNumber: string, otp: string): Promise<boolean>;
  verifyOTP(phoneNumber: string, userOTP: string): boolean;
}

export class TwilioOTPService implements OTPService {
  private twilio: Twilio;
  private otpStore: Map<string, { otp: string; expiresAt: Date }> = new Map();

  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.warn('Twilio credentials not found. Using mock OTP service.');
      this.twilio = null as any;
    } else {
      this.twilio = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }
  }

  generateOTP(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      // Store OTP with 5-minute expiry
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      this.otpStore.set(phoneNumber, { otp, expiresAt });

      if (!this.twilio) {
        // Mock SMS for development
        console.log(`📱 Mock OTP sent to ${phoneNumber}: ${otp}`);
        console.log(`⏰ OTP expires at: ${expiresAt.toISOString()}`);
        return true;
      }

      // Send real SMS via Twilio
      const message = await this.twilio.messages.create({
        body: `Your Local Route Finder OTP is: ${otp}. Valid for 5 minutes.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      console.log(`✅ OTP sent to ${phoneNumber}: ${otp}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send OTP:', error);
      return false;
    }
  }

  verifyOTP(phoneNumber: string, userOTP: string): boolean {
    const storedData = this.otpStore.get(phoneNumber);
    
    if (!storedData) {
      return false;
    }

    // Check if OTP has expired
    if (new Date() > storedData.expiresAt) {
      this.otpStore.delete(phoneNumber);
      return false;
    }

    // Verify OTP
    const isValid = storedData.otp === userOTP;
    
    if (isValid) {
      this.otpStore.delete(phoneNumber); // Clean up after successful verification
    }

    return isValid;
  }

  // Clean up expired OTPs (call this periodically)
  cleanupExpiredOTPs(): void {
    const now = new Date();
    for (const [phoneNumber, data] of this.otpStore.entries()) {
      if (now > data.expiresAt) {
        this.otpStore.delete(phoneNumber);
      }
    }
  }
}

// Singleton instance
export const otpService = new TwilioOTPService();

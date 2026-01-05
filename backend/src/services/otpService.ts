import { Twilio } from 'twilio';

export interface OTPService {
  generateOTP(): string;
  sendOTP(phoneNumber: string, otp: string): Promise<boolean>;
  verifyOTP(phoneNumber: string, userOTP: string): boolean;
}

export class TwilioOTPService implements OTPService {
  private twilio: Twilio | null;
  private otpStore: Map<string, { otp: string; expiresAt: Date }> = new Map();

  constructor() {
    // Check for Twilio credentials
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      console.warn('⚠️ Twilio credentials not found. Using mock OTP service for development.');
      this.twilio = null;
    } else {
      console.log('✅ Twilio credentials found. Real SMS enabled.');
      this.twilio = new Twilio(accountSid, authToken);
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
      const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
      if (!twilioPhoneNumber) {
        console.error('❌ TWILIO_PHONE_NUMBER not configured');
        return false;
      }

      // Format phone number for international format (add +91 for India)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

      const message = await this.twilio.messages.create({
        body: `Your Local Route Finder OTP is: ${otp}. Valid for 5 minutes. Do not share this code.`,
        from: twilioPhoneNumber,
        to: formattedPhone
      });

      console.log(`✅ Real SMS sent to ${formattedPhone}: ${otp}`);
      console.log(`📬 Twilio Message SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send OTP via Twilio:', error);
      return false;
    }
  }

  verifyOTP(phoneNumber: string, userOTP: string): boolean {
    const storedData = this.otpStore.get(phoneNumber);
    
    if (!storedData) {
      console.log(`❌ No OTP found for ${phoneNumber}`);
      return false;
    }

    // Check if OTP has expired
    if (new Date() > storedData.expiresAt) {
      console.log(`❌ OTP expired for ${phoneNumber}`);
      this.otpStore.delete(phoneNumber);
      return false;
    }

    // Verify OTP
    const isValid = storedData.otp === userOTP;
    
    if (isValid) {
      console.log(`✅ OTP verified successfully for ${phoneNumber}`);
      this.otpStore.delete(phoneNumber); // Clean up after successful verification
    } else {
      console.log(`❌ Invalid OTP for ${phoneNumber}. Expected: ${storedData.otp}, Got: ${userOTP}`);
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

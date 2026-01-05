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
    try {
      // Check for Twilio credentials
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
      
      console.log('🔍 Checking Twilio configuration...');
      console.log('🔍 TWILIO_ACCOUNT_SID:', accountSid ? 'SET' : 'NOT SET');
      console.log('🔍 TWILIO_AUTH_TOKEN:', authToken ? 'SET' : 'NOT SET');
      console.log('🔍 TWILIO_PHONE_NUMBER:', phoneNumber || 'NOT SET');
      
      if (!accountSid || !authToken) {
        console.warn('⚠️ Twilio credentials not found. Using mock OTP service for development.');
        this.twilio = null;
      } else {
        console.log('✅ Twilio credentials found. Real SMS enabled.');
        this.twilio = new Twilio(accountSid, authToken);
        
        if (!phoneNumber) {
          console.warn('⚠️ TWILIO_PHONE_NUMBER not set. Will fall back to mock SMS.');
        }
      }
    } catch (error) {
      console.error('❌ Error initializing Twilio service:', error);
      this.twilio = null;
    }
  }

  generateOTP(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      console.log(`📱 Starting OTP send process for ${phoneNumber}`);
      
      // Store OTP with 5-minute expiry
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      this.otpStore.set(phoneNumber, { otp, expiresAt });
      console.log(`✅ OTP stored for ${phoneNumber}, expires at ${expiresAt.toISOString()}`);

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
        console.log('📱 Falling back to mock SMS due to missing Twilio phone number');
        // Fall back to mock mode
        console.log(`📱 Mock OTP sent to ${phoneNumber}: ${otp}`);
        console.log(`⏰ OTP expires at: ${expiresAt.toISOString()}`);
        return true;
      }

      // Validate Twilio phone number format (should start with + and be a valid Twilio number)
      if (!twilioPhoneNumber.startsWith('+') || twilioPhoneNumber.length < 10) {
        console.error('❌ Invalid TWILIO_PHONE_NUMBER format:', twilioPhoneNumber);
        console.log('📱 Falling back to mock SMS due to invalid Twilio phone number format');
        // Fall back to mock mode
        console.log(`📱 Mock OTP sent to ${phoneNumber}: ${otp}`);
        console.log(`⏰ OTP expires at: ${expiresAt.toISOString()}`);
        return true;
      }

      // Format phone number for international format (add +91 for India)
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

      console.log(`📬 Sending real SMS to ${formattedPhone} via Twilio`);
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
      console.error('❌ Error details:', error);
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

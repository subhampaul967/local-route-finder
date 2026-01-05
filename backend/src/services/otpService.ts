export interface OTPService {
  generateOTP(): string;
  sendOTP(phoneNumber: string, otp: string): Promise<boolean>;
  verifyOTP(phoneNumber: string, userOTP: string): boolean;
}

export class SimpleOTPService implements OTPService {
  private otpStore: Map<string, { otp: string; expiresAt: Date }> = new Map();

  generateOTP(): string {
    // Generate 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    try {
      // Store OTP with 5-minute expiry
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      this.otpStore.set(phoneNumber, { otp, expiresAt });

      // Always log OTP for development (since we don't have real SMS)
      console.log(`📱 OTP generated for ${phoneNumber}: ${otp}`);
      console.log(`⏰ OTP expires at: ${expiresAt.toISOString()}`);
      
      // In development, simulate SMS delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`✅ OTP "sent" to ${phoneNumber}: ${otp}`);
      console.log(`📱 NOTE: This is a mock SMS. In production, configure Twilio for real SMS.`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send OTP:', error);
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
export const otpService = new SimpleOTPService();

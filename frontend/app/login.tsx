'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SimpleLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [selectedCity, setSelectedCity] = useState("");

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      alert("Please enter your mobile number.");
      return;
    }

    if (!selectedCity) {
      alert("Please select your city.");
      return;
    }

    // Validate phone number (Indian mobile numbers start with 6-9)
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setLoading(true);
    try {
      // Send real OTP
      console.log('🔍 Sending OTP to:', phone);
      console.log('🔍 API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      console.log('🔍 Response status:', response.status);
      const data = await response.json();
      console.log('🔍 Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      
      // In development, show the OTP
      if (data.otp) {
        alert(`OTP sent successfully! Your OTP is: ${data.otp}`);
      } else {
        alert('OTP sent successfully! Please check your SMS.');
      }
    } catch (err: any) {
      console.error('❌ Send OTP error:', err);
      alert(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phone.trim()) {
      alert("Please enter your mobile number.");
      return;
    }

    if (!otp.trim()) {
      alert("Please enter the OTP.");
      return;
    }

    if (!selectedCity) {
      alert("Please select your city.");
      return;
    }

    // Validate OTP format
    const otpRegex = /^[0-9]{6}$/;
    if (!otpRegex.test(otp)) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      // Verify OTP and login
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store selected city in localStorage for use throughout the app
      localStorage.setItem('selectedCity', selectedCity);
      
      setAuth(data.user as any, data.token);
      
      // Force a page reload to ensure city is loaded
      window.location.href = "/";
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-semibold text-brand-foreground">Login</h1>
      <p className="text-xs text-slate-300">
        Use your mobile number to login. Real OTP will be sent to your phone.
      </p>

      <Card className="space-y-4 bg-slate-900/60 p-4">
        <div className="space-y-1">
          <Label htmlFor="city">Select your city</Label>
          <select
            id="city"
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">Choose your city...</option>
            <option value="Kolkata">Kolkata</option>
            <option value="Delhi">Delhi</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Bangalore">Bangalore</option>
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone">Mobile number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10 digit Indian number"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          />
          <p className="text-[10px] text-slate-400">
            Indian mobile numbers only (starts with 6-9)
          </p>
        </div>

        {!otpSent ? (
          <Button 
            className="w-full" 
            onClick={handleSendOtp} 
            disabled={loading || !phone || !selectedCity}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </Button>
        ) : (
          <>
            <div className="space-y-1">
              <Label htmlFor="otp">Enter OTP</Label>
              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
              <p className="text-[10px] text-slate-400">
                Enter the 6-digit OTP sent to your mobile
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={handleLogin} 
                disabled={loading || !otp}
              >
                {loading ? "Verifying..." : "Verify & Login"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>

            <Button 
              variant="outline" 
              className="w-full text-xs"
              onClick={handleSendOtp} 
              disabled={loading}
            >
              {loading ? "Resending..." : "Resend OTP"}
            </Button>
          </>
        )}

        {/* Debug info */}
        <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-800 rounded">
          Debug: otpSent={otpSent.toString()}, phone={phone}, city={selectedCity}, loading={loading.toString()}
        </div>
      </Card>
    </main>
  );
}

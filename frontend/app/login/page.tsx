'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginRequest } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const INDIAN_CITIES = [
  "Kolkata",
  "Delhi",
  "Mumbai",
  "Durgapur",
  "Nabadwip",
  "Chandigarh",
  "Goa",
  "Bangalore",
  "Chennai",
  "Hyderabad",
  "Pune",
  "Jaipur",
  "Lucknow",
  "Ahmedabad",
  "Surat",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Pimpri-Chinchwad",
  "Patna",
  "Vadodara",
  "Ghaziabad",
  "Ludhiana",
  "Agra",
  "Nashik",
  "Faridabad",
  "Meerut",
  "Rajkot",
  "Kalyan-Dombivali",
  "Vasai-Virar",
  "Varanasi",
  "Srinagar",
  "Aurangabad",
  "Dhanbad",
  "Amritsar",
  "Navi Mumbai",
  "Allahabad",
  "Ranchi",
  "Howrah",
  "Coimbatore",
  "Jabalpur",
  "Gwalior",
  "Vijayawada",
  "Jodhpur",
  "Madurai",
  "Raipur",
  "Kota",
  "Guwahati",
  "Chandigarh",
  "Hubli-Dharwad",
  "Cochin",
  "Cuttack",
  "Dehradun",
  "Durgapur",
  "Asansol",
  "Rourkela",
  "Nanded",
  "Kolhapur",
  "Ajmer",
  "Akola",
  "Amravati",
  "Bokaro",
  "Bhilai",
  "Bilaspur",
  "Bikaner",
  "Bhubaneswar",
  "Corporation (Chennai)",
  "Davanagere",
  "Dharwad",
  "Erode",
  "Gulbarga",
  "Kurnool",
  "Latur",
  "Nellore",
  "Pondicherry",
  "Sangli",
  "Siliguri",
  "Tiruchirappalli",
  "Tirupur",
  "Ujjain",
  "Vijayawada",
  "Warangal",
  "Nabadwip",
];

export default function LoginPage() {
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

    setLoading(true);
    try {
      // Send OTP (mock - just call login without OTP to trigger OTP generation)
      await loginRequest(phone);
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP. Please try again.");
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

    setLoading(true);
    try {
      const response = await loginRequest(phone, otp);
      const data = response.data as {
        token: string;
        user: { id: string; phone: string; role: string; name?: string | null };
      };

      // Store selected city in localStorage for use throughout the app
      localStorage.setItem('selectedCity', selectedCity);
      
      setAuth(data.user as any, data.token);
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col gap-4 px-4 py-6">
      <h1 className="text-xl font-semibold text-brand-foreground">Login</h1>
      <p className="text-xs text-slate-300">
        Use your mobile number to login. For demo admin access, use
        {" "}
        <span className="font-mono">9999999999</span>.
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
            {INDIAN_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <Label htmlFor="phone">Mobile number</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="numeric"
            maxLength={15}
            placeholder="10 digit number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="otp">OTP (mock)</Label>
          <Input
            id="otp"
            placeholder="Any 4-6 digit code (mocked)"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <p className="text-[10px] text-slate-400">
            OTP is not actually validated in this demo. Any value will work.
          </p>
        </div>

        <Button className="w-full" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in…" : "Login"}
        </Button>
      </Card>
    </main>
  );
}

'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      alert("Please enter both phone and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Admin login failed');
      }

      // Store admin token
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      
      alert('Admin login successful!');
      router.push('/admin/routes');
    } catch (err: any) {
      console.error('Admin login error:', err);
      alert(err.message || "Admin login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col gap-4 px-4 py-6">
      <Card className="p-6 bg-slate-900/60">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-semibold text-brand-foreground">Admin Login</h1>
          <p className="text-xs text-slate-300 mt-2">
            Login to access admin controls
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="phone">Admin Phone</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10 digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Admin Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button 
            className="w-full" 
            onClick={handleLogin} 
            disabled={loading}
          >
            {loading ? "Logging in..." : "Admin Login"}
          </Button>

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => router.push("/")}
              className="border-slate-600 text-slate-400 hover:bg-slate-800"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}

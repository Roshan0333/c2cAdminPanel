"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Image from "next/image";

export function LoginForm() {



  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await login(form.email, form.password);

      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-border shadow-2xl">
      <CardContent className="p-8">

        {/* Logo */}

        <div className="mb-8 flex flex-col items-center">

          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">

            <ShieldCheck className="h-8 w-8" />

          </div>

          <Image
            src="/c2c-logo.webp"
            width={150}
            height={150}
            alt="C2C Logo"
          />

          <p className="mt-1 text-sm text-muted-foreground">
            Admin Dashboard
          </p>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Sign in to continue managing your products,
            orders and customers.
          </p>

        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Email */}

          <div className="space-y-2">

            <Label htmlFor="email">
              Email Address
            </Label>

            <div className="relative">

              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                autoFocus
                required
                placeholder="admin@promolecules.com"
                className="pl-10"
                value={form.email}
                onChange={handleChange}
              />

            </div>

          </div>


          <div className="space-y-2">

            <Label htmlFor="password">
              Password
            </Label>

            <div className="relative">

              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                id="password"
                name="password"
                autoComplete="current-password"
                required
                placeholder="Enter password"
                type={showPassword ? "text" : "password"}
                className="pl-10 pr-11"
                value={form.password}
                onChange={handleChange}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>

            </div>

          </div>

          {/* Remember */}

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <Checkbox
                id="remember"
                checked={form.remember}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({
                    ...prev,
                    remember: checked,
                  }))
                }
              />

              <Label
                htmlFor="remember"
                className="cursor-pointer text-sm font-normal"
              >
                Remember me
              </Label>

            </div>

            <Link
              href="#"
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </Link>

          </div>

          {/* Button */}

          <Button
            className="h-11 w-full"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </Button>

        </form>

        <div className="mt-8 border-t pt-5 text-center text-xs text-muted-foreground">
          Secure Admin Access • C2C Supplement™
        </div>

      </CardContent>
    </Card>
  );
}
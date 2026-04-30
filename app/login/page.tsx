"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { signIn, getApiErrorMessage } from "@/lib/api";
import { loginSchema, type LoginSchema } from "@/lib/schemas";
import { safeZodResolver } from "@/lib/safeZodResolver";
import toast from "@/lib/toast";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: safeZodResolver<LoginSchema>(loginSchema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const onSubmit = async (data: LoginSchema) => {
    setApiError("");
    try {
      const res = await signIn(data.email, data.password);
      if (res.message === "success" && res.token && res.user) {
        login(res.user, res.token);
        toast.success(`Welcome back, ${res.user.name}!`);
        router.push("/");
      } else {
        setApiError(res.message ?? "Invalid credentials.");
      }
    } catch (err: unknown) {
      setApiError(getApiErrorMessage(err, "Something went wrong."));
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-8 px-4 bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row">

      
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 flex-1 relative min-h-[500px] overflow-hidden p-8">
          <div className="relative w-full flex-1 min-h-[280px] mb-4">
            <Image src="/grocery-cart.png" alt="FreshCart" fill sizes="50vw" className="object-contain" priority />
          </div>
          <h2 className="text-lg font-extrabold text-gray-900 text-center mb-1.5">
            FreshCart – Your One-Stop Shop<br />for Fresh Products
          </h2>
          <p className="text-gray-500 text-center text-sm mb-5 max-w-xs">
            Join thousands of happy customers who trust FreshCart for their daily grocery needs
          </p>
          <div className="flex items-center gap-5 text-sm text-gray-600">
            <span>🚚 Free Delivery</span>
            <span>🔒 Secure Payment</span>
            <span>💬 24/7 Support</span>
          </div>
        </div>

      
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-10">
          <div className="text-center mb-7">
            <Link href="/" className="text-2xl font-extrabold">
              <span className="text-primary-600">Fresh</span><span className="text-gray-900">Cart</span>
            </Link>
            <h2 className="text-xl font-bold text-gray-900 mt-3">Welcome Back!</h2>
            <p className="text-gray-400 text-sm mt-1">Sign in to continue your fresh shopping experience</p>
          </div>

       
          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4 font-medium">
              {apiError}
            </div>
          )}

          
          <div className="flex flex-col gap-3 mb-5">
            <Button variant="outline" type="button" className="w-full">
              <span className="text-red-500 font-bold">G</span> Continue with Google
            </Button>
            <Button variant="outline" type="button" className="w-full">
              <span className="text-blue-600 font-bold">f</span> Continue with Facebook
            </Button>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">or continue with email</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className={`pl-10 ${errors.email ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100" : ""}`}
                  {...register("email")}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
            </div>

          
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label htmlFor="password" className="mb-0">Password</Label>
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline font-medium">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Enter your password"
                  className={`pl-10 pr-10 ${errors.password ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100" : ""}`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
            </div>

         
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
              <input type="checkbox" className="accent-primary-600 w-4 h-4" {...register("remember")} />
              Keep me signed in
            </label>

            <Button type="submit" disabled={isSubmitting} className="w-full h-11">
              {isSubmitting
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : "Sign In"
              }
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            New to FreshCart?{" "}
            <Link href="/register" className="text-primary-600 font-bold hover:underline">Create an account</Link>
          </p>

          <div className="flex items-center justify-center gap-6 mt-5 text-xs text-gray-400">
            <span>🔒 SSL Secured</span>
            <span>👥 50K+ Users</span>
            <span>⭐ 4.9 Rating</span>
          </div>
        </div>
      </div>
    </div>
  );
}

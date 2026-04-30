"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { signUp, getApiErrorMessage } from "@/lib/api";
import { registerSchema, type RegisterSchema } from "@/lib/schemas";
import { safeZodResolver } from "@/lib/safeZodResolver";
import toast from "@/lib/toast";

function PasswordStrength({ password }: { password: string }) {
  const score = [/.{8,}/, /[0-9]/, /[^A-Za-z0-9]/].filter(r => r.test(password)).length;
  if (!password) return null;
  const labels = ["", "Weak", "Fair", "Strong"];
  const barColors = ["", "bg-red-500", "bg-yellow-500", "bg-green-500"];
  const textColors = ["", "text-red-500", "text-yellow-500", "text-green-500"];
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? barColors[score] : "bg-gray-200"}`} />
        ))}
      </div>
      <span className={`text-xs font-semibold ${textColors[score]}`}>{labels[score]}</span>
    </div>
  );
}

const FEATURES = [
  { icon: "⭐", title: "Premium Quality", desc: "Premium quality products sourced from trusted suppliers." },
  { icon: "🚚", title: "Fast Delivery", desc: "Same-day delivery available in most areas." },
  { icon: "🛡️", title: "Secure Shopping", desc: "Your data and payments are completely secure." },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [apiError, setApiError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: safeZodResolver<RegisterSchema>(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", rePassword: "", terms: false },
  });

  const password = watch("password");

  const errCls = (field: keyof RegisterSchema) =>
    errors[field] ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100" : "";

  const onSubmit = async (data: RegisterSchema) => {
    setApiError("");
    try {
      const res = await signUp({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        rePassword: data.rePassword,
      });
      if (res.message === "success" && res.token && res.user) {
        login(res.user, res.token);
        toast.success("Account created successfully! 🎉");
        router.push("/");
      } else if (res.message === "success") {
        toast.success("Account created successfully! Please sign in.");
        router.push("/login");
      } else {
        setApiError(res.message ?? "Registration failed.");
      }
    } catch (err: unknown) {
      setApiError(getApiErrorMessage(err, "Something went wrong."));
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-10 px-4 bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row">

      
        <div className="hidden md:flex flex-col justify-center p-12 flex-1 border-r border-gray-100">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
            Welcome to <span className="text-primary-600">FreshCart</span>
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Join thousands of happy customers who enjoy fresh groceries delivered right to their doorstep.
          </p>
          <div className="space-y-5 mb-8">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0 text-base">{icon}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 flex-shrink-0">S</div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Sarah Johnson</p>
                <div className="text-amber-400 text-xs">{"★".repeat(5)}</div>
              </div>
            </div>
            <p className="text-gray-500 text-xs italic leading-relaxed">
              &ldquo;FreshCart has transformed my shopping experience. The quality is outstanding. Highly recommend!&rdquo;
            </p>
          </div>
        </div>

       
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
            <p className="text-gray-400 text-sm mt-1">Start your fresh journey with us today</p>
          </div>

          {apiError && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-3 text-sm mb-4 font-medium">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <Button variant="outline" type="button">
              <span className="text-red-500 font-bold text-base">G</span> Google
            </Button>
            <Button variant="outline" type="button">
              <span className="text-blue-600 font-bold text-base">f</span> Facebook
            </Button>
          </div>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>

            <div>
              <Label>Name <span className="text-red-500">*</span></Label>
              <Input type="text" placeholder="Ali" className={errCls("name")} {...register("name")} />
              <FieldError message={errors.name?.message} />
            </div>

            <div>
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input type="email" placeholder="ali@example.com" className={errCls("email")} {...register("email")} />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <Label>Password <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  placeholder="create a strong password"
                  className={`pr-10 ${errCls("password")}`}
                  {...register("password")}
                />
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
              <FieldError message={errors.password?.message} />
            </div>

            <div>
              <Label>Confirm Password <span className="text-red-500">*</span></Label>
              <Input type="password" placeholder="confirm your password" className={errCls("rePassword")} {...register("rePassword")} />
              <FieldError message={errors.rePassword?.message} />
            </div>

            <div>
              <Label>Phone Number <span className="text-red-500">*</span></Label>
              <Input type="tel" placeholder="01010700701" className={errCls("phone")} {...register("phone")} />
              <FieldError message={errors.phone?.message} />
            </div>

            <div>
              <label className="flex items-start gap-2 cursor-pointer text-sm text-gray-600">
                <input type="checkbox" className="accent-primary-600 w-4 h-4 mt-0.5 flex-shrink-0" {...register("terms")} />
                <span>
                  I agree to the{" "}
                  <Link href="#" className="text-primary-600 hover:underline font-medium">Terms of Service</Link>
                  {" "}and{" "}
                  <Link href="#" className="text-primary-600 hover:underline font-medium">Privacy Policy</Link>
                  {" "}<span className="text-red-500">*</span>
                </span>
              </label>
              <FieldError message={errors.terms?.message} />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full h-11">
              {isSubmitting
                ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : "👤 Create My Account"
              }
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

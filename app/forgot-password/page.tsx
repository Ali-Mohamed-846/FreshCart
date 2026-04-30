"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Lock, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotEmailSchema, resetPasswordSchema, type ForgotEmailSchema, type ResetPasswordSchema } from "@/lib/schemas";
import toast from "@/lib/toast";
import { forgotPassword, verifyResetCode, resetPassword, changePassword, getApiErrorMessage } from "@/lib/api";
import { safeZodResolver } from "@/lib/safeZodResolver";
import { useAuth } from "@/context/AuthContext";

type Step = "email" | "verify" | "reset" | "done";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-red-500 mt-1">{message}</p>;
}

function StepCircle({ n, current, label }: { n: number; current: number; label: string }) {
  const done = current > n;
  const active = current === n;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all border-2
        ${done ? "bg-primary-600 border-primary-600 text-white"
          : active ? "bg-white border-primary-600 text-primary-600"
            : "bg-gray-100 border-gray-200 text-gray-400"}`}>
        {done ? <Check className="w-4 h-4" /> : n}
      </div>
      <span className={`text-xs font-medium ${active || done ? "text-primary-600" : "text-gray-400"}`}>{label}</span>
    </div>
  );
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [step, setStep] = useState<Step>(token ? "reset" : "email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentPwError, setCurrentPwError] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const stepNum = step === "email" ? 1 : step === "verify" ? 2 : 3;


  const emailForm = useForm<ForgotEmailSchema>({
    resolver: safeZodResolver<ForgotEmailSchema>(forgotEmailSchema),
  });


  const resetForm = useForm<ResetPasswordSchema>({
    resolver: safeZodResolver<ResetPasswordSchema>(resetPasswordSchema),
  });

  const onEmailSubmit = async (data: ForgotEmailSchema) => {
    try {
      await forgotPassword(data.email);
      setEmail(data.email);
      setStep("verify");
      toast.success("Verification code sent!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to send verification code.");
    }
  };

  const onVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.some(c => !c)) { toast.error("Please enter all 6 digits"); return; }
    try {
      await verifyResetCode(otp.join(""));
      setStep("reset");
      toast.success("Code verified.");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "The code is invalid or expired."));
    }
  };

  const onResetSubmit = async (data: ResetPasswordSchema) => {
    setCurrentPwError("");
    if (data.password !== data.confirm) {
      resetForm.setError("confirm", {
        type: "validate",
        message: "Passwords do not match",
      });
      return;
    }
    try {
      if (token) {
        if (!currentPassword) {
          setCurrentPwError("Current password is required");
          return;
        }
        await changePassword({
          token,
          currentPassword,
          newPassword: data.password,
        });
        setStep("done");
        toast.success("Password reset successfully!");
        setTimeout(() => router.push("/login"), 900);
        return;
      }

      await resetPassword({ email, newPassword: data.password });
      setStep("done");
      toast.success("Password reset successfully!");
      setTimeout(() => router.push("/login"), 900);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "Could not reset password. Please try again.");
      const low = msg.toLowerCase();

      if (low.includes("current") || low.includes("old password")) {
        setCurrentPwError(msg);
        return;
      }
      if (low.includes("reset code") || low.includes("verify")) {
        toast.error("The code is invalid or expired. Please enter a valid code and try again.");
        setStep("verify");
        return;
      }

      toast.error(msg);
    }
  };

  const setOtpChar = (i: number, v: string) => {
    const digit = v.slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) (document.getElementById(`otp-${i + 1}`) as HTMLInputElement)?.focus();
  };

  const errCls = (err: boolean) =>
    err ? "border-red-400 focus-visible:border-red-400 focus-visible:ring-red-100" : "";

  const resendCode = async () => {
    if (!email) {
      toast.error("Please enter your email first.");
      setStep("email");
      return;
    }
    try {
      await forgotPassword(email);
      setOtp(["", "", "", "", "", ""]);
      toast.success("Code resent!");
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Could not resend code. Please try again."));
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-10 px-4 bg-gray-50">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-lg overflow-hidden flex flex-col md:flex-row">

      
        <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-12 flex-1">
          <div className="w-56 h-56 bg-white rounded-3xl shadow-md flex items-center justify-center mb-8 relative">
            {step === "email" && <span className="text-8xl">✉️</span>}
            {step === "verify" && <span className="text-8xl">📱</span>}
            {(step === "reset" || step === "done") && <span className="text-8xl">🔒</span>}
            <div className="absolute -top-4 -right-4 w-12 h-12 bg-primary-100 rounded-full opacity-60" />
            <div className="absolute -bottom-3 -left-3 w-8  h-8  bg-emerald-200 rounded-full opacity-60" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 text-center mb-2">Reset Your Password</h2>
          <p className="text-gray-500 text-center text-sm">
            Don&apos;t worry, it happens to the best of us. We&apos;ll help you get back into your account in no time.
          </p>
          <div className="flex items-center gap-5 mt-6 text-xs text-gray-500">
            <span>✉️ Email Verification</span>
            <span>🔒 Secure Reset</span>
            <span>🛡️ Encrypted</span>
          </div>
        </div>

   
        <div className="flex-1 flex flex-col justify-center px-8 md:px-12 py-10">
          <div className="text-center mb-6">
            <Link href="/" className="text-xl font-extrabold">
              <span className="text-primary-600">Fresh</span><span className="text-gray-900">Cart</span>
            </Link>
          </div>


          {step !== "done" && (
            <div className="flex items-center justify-center gap-3 mb-8">
              <StepCircle n={1} current={stepNum} label="Email" />
              <div className={`flex-1 max-w-12 h-0.5 transition-all ${stepNum > 1 ? "bg-primary-600" : "bg-gray-200"}`} />
              <StepCircle n={2} current={stepNum} label="Verify" />
              <div className={`flex-1 max-w-12 h-0.5 transition-all ${stepNum > 2 ? "bg-primary-600" : "bg-gray-200"}`} />
              <StepCircle n={3} current={stepNum} label="Reset" />
            </div>
          )}

         
          {step === "email" && (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Forgot Password?</h3>
                <p className="text-gray-400 text-sm mt-1">Enter your email to receive a reset code</p>
              </div>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4" noValidate>
                <div>
                  <Label>Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      className={`pl-10 ${errCls(!!emailForm.formState.errors.email)}`}
                      {...emailForm.register("email")}
                    />
                  </div>
                  <FieldError message={emailForm.formState.errors.email?.message} />
                </div>
                <Button type="submit" className="w-full h-11" disabled={emailForm.formState.isSubmitting}>
                  {emailForm.formState.isSubmitting
                    ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : "Send Reset Code →"}
                </Button>
              </form>
            </>
          )}

         

          {step === "verify" && (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Check Your Email</h3>
                <p className="text-gray-400 text-sm mt-1">
                  We sent a 6-digit code to <strong className="text-gray-700">{email}</strong>
                </p>
              </div>
              <form onSubmit={onVerify} className="space-y-5">
                <div>
                  <Label className="text-center block mb-3">Enter verification code</Label>
                  <div className="flex justify-center gap-2">
                    {otp.map((c, i) => (
                      <input
                        key={i} id={`otp-${i}`} type="text" maxLength={1} value={c}
                        onChange={e => setOtpChar(i, e.target.value)}
                        className="w-11 h-12 text-center text-lg font-bold border-2 border-gray-200 rounded-xl outline-none focus:border-primary-500 transition"
                      />
                    ))}
                  </div>
                </div>
                <Button type="submit" className="w-full h-11" disabled={otp.some(c => !c)}>
                  Verify Code →
                </Button>
                <p className="text-center text-sm text-gray-400">
                  {"Didn't receive? "}
                  <button type="button" onClick={resendCode} className="text-primary-600 font-medium hover:underline">
                    Resend
                  </button>
                </p>
              </form>
            </>
          )}

       
          {step === "reset" && (
            <>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Create New Password</h3>
                <p className="text-gray-400 text-sm mt-1">Your new password must be different from previous passwords</p>
              </div>
              <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4" noValidate>
                {token && (
                  <div>
                    <Label>Current Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type={showCurrentPw ? "text" : "password"}
                        placeholder="Enter current password"
                        className={`pl-10 pr-10 ${errCls(!!currentPwError)}`}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowCurrentPw((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <FieldError message={currentPwError} />
                  </div>
                )}
                <div>
                  <Label>New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type={showPw ? "text" : "password"}
                      placeholder="Enter new password"
                      className={`pl-10 pr-10 ${errCls(!!resetForm.formState.errors.password)}`}
                      {...resetForm.register("password")}
                    />
                    <button type="button" onClick={() => setShowPw(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FieldError message={resetForm.formState.errors.password?.message} />
                </div>
                <div>
                  <Label>Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="password"
                      placeholder="Confirm new password"
                      className={`pl-10 ${errCls(!!resetForm.formState.errors.confirm)}`}
                      {...resetForm.register("confirm")}
                    />
                  </div>
                  <FieldError message={resetForm.formState.errors.confirm?.message} />
                </div>
                <Button type="submit" className="w-full h-11" disabled={resetForm.formState.isSubmitting}>
                  {resetForm.formState.isSubmitting
                    ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : "Reset Password"
                  }
                </Button>
              </form>
            </>
          )}

        
          {step === "done" && (
            <div className="text-center py-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5 text-4xl">✅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h3>
              <p className="text-gray-400 text-sm mb-6">Your password has been successfully updated.</p>
              <Button asChild className="px-8">
                <Link href="/login">Back to Sign In →</Link>
              </Button>
            </div>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Remember your password?{" "}
            <Link href="/login" className="text-primary-600 font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

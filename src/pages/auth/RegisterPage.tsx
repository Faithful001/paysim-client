import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, User, Phone, Eye, EyeOff, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { registerUser } from "@/api/auth";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const schema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().min(10, "Enter a valid phone number"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormData) =>
      registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phone,
        password: data.password,
      }),
    onSuccess: (data) => {
      console.log("data", data);
      // login(data.data.token, data.data.user);
      toast.success("Account created! Setting up your wallet…");
      navigate({ to: "/onboarding" });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message ?? "Registration failed. Please try again.");
    },
  });

  return (
    <div className="min-h-dvh flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-brand items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-white"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>
        <div className="relative z-10 text-center text-white">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm mb-8">
            <Wallet size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Join PaySim</h1>
          <p className="text-lg text-white/80 max-w-xs mx-auto">
            Create your account and get a virtual bank account instantly.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {["Instant Setup", "Bank Transfer", "Bill Payments"].map((f) => (
              <div key={f} className="bg-white/10 rounded-2xl py-3 px-2">
                <p className="text-xs font-semibold text-white/90">{f}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand shadow-lg">
              <Wallet size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">PaySim</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
          <p className="text-slate-500 text-sm mb-8">Get started in seconds</p>

          <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
            <Input
              id="register-name"
              label="First name"
              type="text"
              placeholder="John"
              leftIcon={<User size={16} />}
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <Input
              id="register-name"
              label="Last name"
              type="text"
              placeholder="Doe"
              leftIcon={<User size={16} />}
              error={errors.lastName?.message}
              {...register("lastName")}
            />
            <Input
              id="register-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail size={16} />}
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              id="register-phone"
              label="Phone number"
              type="tel"
              placeholder="+234 800 000 0000"
              leftIcon={<Phone size={16} />}
              error={errors.phone?.message}
              {...register("phone")}
            />
            <Input
              id="register-password"
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              error={errors.password?.message}
              {...register("password")}
            />
            <Input
              id="register-confirm-password"
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              placeholder="Repeat password"
              leftIcon={<Lock size={16} />}
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button
              type="submit"
              fullWidth
              isLoading={isPending}
              id="register-submit"
              className="mt-2"
            >
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

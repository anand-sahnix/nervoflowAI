import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api } from "../api/client.js";
import { Button } from "../components/Button.jsx";
import { useAuthStore } from "../store/authStore.js";
import { errorMessage } from "../utils/errors.js";

export function AuthPage({ mode }) {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const { register, handleSubmit, formState } = useForm({
    defaultValues:
      mode === "login"
        ? { email: "demo@neuroflow.ai", password: "Password@123" }
        : { name: "", email: "", password: "" }
  });
  const [error, setError] = useState("");

  async function onSubmit(values) {
    setError("");
    try {
      const { data } = await api.post(`/auth/${mode}`, values);
      setSession(data);
      navigate("/");
    } catch (err) {
      setError(errorMessage(err, "Authentication failed"));
    }
  }

  const isLogin = mode === "login";

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold text-emerald-700">NeuroFlow AI</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">{isLogin ? "Log in" : "Create account"}</h1>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {!isLogin && (
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Name</span>
              <input className="focus-ring mt-1 h-11 w-full rounded-md border border-slate-300 px-3" {...register("name", { required: true })} />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input className="focus-ring mt-1 h-11 w-full rounded-md border border-slate-300 px-3" type="email" {...register("email", { required: true })} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input className="focus-ring mt-1 h-11 w-full rounded-md border border-slate-300 px-3" type="password" {...register("password", { required: true, minLength: 6 })} />
          </label>
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button className="w-full" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Please wait" : isLogin ? "Log in" : "Register"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          {isLogin ? "Need an account?" : "Already have an account?"}{" "}
          <Link className="font-semibold text-emerald-700 hover:text-emerald-800" to={isLogin ? "/register" : "/login"}>
            {isLogin ? "Register" : "Log in"}
          </Link>
        </p>
      </section>
    </main>
  );
}

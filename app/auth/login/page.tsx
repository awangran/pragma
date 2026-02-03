import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <main
      className="relative flex min-h-screen items-center justify-end overflow-hidden bg-cover bg-center bg-no-repeat "
      style={{ backgroundImage: "url('/auth-bg.svg')" }}
    >
      <div className="w-full md:w-1/2 min-h-screen">
        <LoginForm />
      </div>
    </main>
  );
}

import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return (
     <main
      className="relative flex min-h-screen items-center justify-end overflow-hidden bg-cover bg-center bg-no-repeat "
      style={{ backgroundImage: "url('/auth-bg.svg')" }}
    >
      <div className="w-full max-w-xl min-h-screen">
        <SignUpForm />
    </div>

    </main>
    
  );
}

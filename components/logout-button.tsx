"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button
      variant="outline"
      className="border-2 border-pskyblue text-pblue font-medium rounded-full px-6 py-2 hover:bg-pskyblue/30"
      onClick={logout}
    >
      Cerrar sesión
    </Button>
  );
}

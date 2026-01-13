import { createClient } from "@/lib/supabase/server";
import { Suspense } from "react";

async function InstrumentsData() {
  const supabase = await createClient();
  const { data: userTest } = await supabase.from("user-test").select();

  return <pre>{JSON.stringify(userTest, null, 3)}</pre>;
}

export default function Instruments() {
  return (
    <Suspense fallback={<div>Loading users...</div>}>
      <InstrumentsData />
    </Suspense>
  );
}

const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase.from("deeds").select("*");
  console.log("Deeds:", data);
  console.log("Error:", error);
}

run();

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Erreur : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont requis.");
  console.error("Ajoutez-les dans votre fichier .env ou dans les secrets Replit.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createTestUser() {
  console.log("Création du compte de test...");

  const { data, error } = await supabase.auth.admin.createUser({
    email: "admin@nexus.local",
    password: "nexus2024",
    email_confirm: true,
    user_metadata: { username: "Admin" },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      console.log("Le compte existe déjà !");
    } else {
      console.error("Erreur :", error.message);
      process.exit(1);
    }
  } else {
    console.log("Compte de test créé avec succès !");
  }

  console.log("\n--- Identifiants de test ---");
  console.log("Email    : admin@nexus.local");
  console.log("Password : nexus2024");
  console.log("----------------------------\n");
}

createTestUser();

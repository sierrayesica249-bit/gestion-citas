addEventListener('scheduled', (event) => {
  event.waitUntil(doWork());
});

async function doWork() {
  const SUPABASE_URL = "https://lwxpwfbokqtgstteyaao.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3eHB3ZmJva3F0Z3N0dGV5YWFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc5MDE2NDYsImV4cCI6MjA5MzQ3NzY0Nn0.FRWF-Knri2oXX6RMrFKWfo_OB07AuAOqt0Qoiob9c0k";
  const TABLE_NAME = "dependencies";

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE_NAME}?select=id&limit=1`, {
      method: "GET",
      headers: {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Content-Type": "application/json"
      }
    });

    const status = response.status;
    const statusText = response.statusText;
    console.log(`[Supabase Keepalive] Status: ${status} ${statusText}`);

    if (!response.ok) {
      console.error(`Keepalive failed: ${status} ${statusText}`);
    }
  } catch (error) {
    console.error(`Keepalive error: ${error.message}`);
  }
}

const SUPABASE_URL = "https://ndvrwzngvnccdkeqcnui.supabase.co";
fetch(SUPABASE_URL + "/auth/v1/health")
  .then(res => console.log("Success! Status:", res.status))
  .catch(err => console.error("Error fetching:", err.message));

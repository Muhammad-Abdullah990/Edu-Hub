// Test script for fees API
const BASE = "http://localhost:3001/api";

async function main() {
  try {
    // 1. Login with correct admin credentials from seed file
    console.log("=== LOGIN ===");
    const loginRes = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "info@topperscoachingcenter.com", password: "ChangeMe123!" }),
    });
    const loginData = await loginRes.json();
    console.log("Login status:", loginRes.status);
    
    const token = loginData?.accessToken;
    if (!token) {
      console.log("NO TOKEN - full response:", JSON.stringify(loginData, null, 2));
      return;
    }
    console.log("Token obtained:", token.slice(0, 30) + "...");

    // 2. Test fees/upcoming
    console.log("\n=== GET /fees/upcoming ===");
    const feesRes = await fetch(`${BASE}/fees/upcoming`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Status:", feesRes.status);
    const feesData = await feesRes.json();
    console.log("Full response:", JSON.stringify(feesData, null, 2));

    // 3. Test fees/records
    console.log("\n=== GET /fees/records ===");
    const recordsRes = await fetch(`${BASE}/fees/records`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Status:", recordsRes.status);
    const recordsData = await recordsRes.json();
    console.log("Full response:", JSON.stringify(recordsData, null, 2));

    // 4. Test students list
    console.log("\n=== GET /students (with auth) ===");
    const studentsRes = await fetch(`${BASE}/students?limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Status:", studentsRes.status);
    const studentsData = await studentsRes.json();
    console.log("Students count:", studentsData?.data?.length || 0);
    console.log("First 2:", JSON.stringify(studentsData?.data?.slice(0, 2) || [], null, 2));

  } catch (err) {
    console.error("Error:", err);
  }
}

main();
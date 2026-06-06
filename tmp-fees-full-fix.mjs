const BASE = "http://localhost:3001/api";

async function login() {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "info@topperscoachingcenter.com", password: "ChangeMe123!" }),
  });
  const data = await res.json();
  return data.accessToken;
}

async function main() {
  const token = await login();
  console.log("Logged in successfully");

  const studentsRes = await fetch(`${BASE}/students?limit=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const studentsData = await studentsRes.json();
  const students = studentsData.data || [];

  console.log(`Found ${students.length} students`);

  const feeDefaults = {
    "habiba": { amount: 2000, startDate: "2024-01-01" },
    "abdullah": { amount: 2000, startDate: "2024-01-01" },
    "rayyan": { amount: 1500, startDate: "2024-06-01" },
    "sufyan": { amount: 1500, startDate: "2024-06-01" },
    "ahmed": { amount: 2500, startDate: "2023-06-01" },
    "fatima": { amount: 2500, startDate: "2023-06-01" },
    "aisha": { amount: 1500, startDate: "2024-06-01" },
    "omar": { amount: 2500, startDate: "2023-06-01" },
    "hassan": { amount: 2500, startDate: "2023-06-01" },
    "zainab": { amount: 1500, startDate: "2024-06-01" },
    "ali": { amount: 1500, startDate: "2024-06-01" },
    "maryam": { amount: 1500, startDate: "2024-06-01" },
    "student1": { amount: 1000, startDate: "2024-09-01" },
    "hania": { amount: 1000, startDate: "2024-09-01" },
    "abdul": { amount: 1500, startDate: "2024-06-01" },
    "alyan": { amount: 1000, startDate: "2024-09-01" },
    "studet": { amount: 1000, startDate: "2024-09-01" },
    "demo": { amount: 1000, startDate: "2025-01-01" },
  };

  let updatedCount = 0;
  for (const student of students) {
    const key = Object.keys(feeDefaults).find(k => 
      student.fullName.toLowerCase().includes(k)
    );
    if (key) {
      const config = feeDefaults[key];
      const updateRes = await fetch(`${BASE}/students/${student.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          monthlyFeeAmount: config.amount,
          feeCycleStartDate: config.startDate,
        }),
      });
      if (updateRes.ok) {
        console.log(`✓ ${student.fullName} (${student.studentCode}): Rs.${config.amount}`);
        updatedCount++;
      } else {
        const text = await updateRes.text();
        console.log(`✗ ${student.fullName}: ${updateRes.status} ${text.slice(0,200)}`);
      }
    }
  }

  console.log(`\nUpdated ${updatedCount} students with fee config`);

  console.log("\n=== Testing /fees/upcoming ===");
  const feesRes = await fetch(`${BASE}/fees/upcoming`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const feesData = await feesRes.json();
  console.log(`Status: ${feesRes.status}, Count: ${(feesData.data || []).length}`);
  (feesData.data || []).forEach(f => {
    const msRemaining = new Date(f.dueDate) - new Date();
    const daysRemaining = Math.ceil(msRemaining / (1000*60*60*24));
    let label;
    if (daysRemaining > 30) label = `${daysRemaining} days remaining`;
    else if (daysRemaining > 0) label = `${daysRemaining} days remaining`;
    else if (daysRemaining === 0) label = "Due today";
    else label = `Overdue by ${Math.abs(daysRemaining)} days`;
    console.log(`  ${f.studentName} — ${label} | Rs.${f.amountDue} | ${f.status}`);
  });
}

main().catch(e => console.error("Error:", e));
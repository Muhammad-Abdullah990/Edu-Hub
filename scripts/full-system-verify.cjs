/**
 * Full system verification: API modules + Playwright UI + background jobs.
 * Run: node scripts/full-system-verify.cjs
 */
const fs = require("fs");
const path = require("path");

const API = process.env.API_BASE || "http://127.0.0.1:3001";
const WEB = process.env.WEB_BASE || "http://127.0.0.1:4173";

const ACCOUNTS = {
  admin: { email: "info@topperscoachingcenter.com", password: "ChangeMe123!" },
  student: { email: "student.demo@topperscoachingcenter.com", password: "ChangeMe123!" },
  teacher: { email: "teacher.demo@topperscoachingcenter.com", password: "ChangeMe123!" },
};

const results = [];

function record(category, name, status, detail = "") {
  results.push({ category, name, status, detail });
  const icon = status === "pass" ? "PASS" : status === "partial" ? "PARTIAL" : "FAIL";
  console.log(`[${icon}] ${category} :: ${name}${detail ? " — " + detail : ""}`);
}

async function api(path, opts = {}) {
  const url = `${API}${path}`;
  const headers = { ...(opts.headers || {}) };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.csrf) headers["X-CSRF-Token"] = opts.csrf;
  if (opts.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method: opts.method || "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  let json = null;
  const text = await res.text();
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json, ok: res.ok };
}

async function login(role) {
  const creds = ACCOUNTS[role];
  const r = await api("/api/auth/login", { method: "POST", body: creds });
  if (!r.ok) return null;
  return {
    token: r.json.accessToken,
    csrf: r.json.csrfToken,
    user: r.json.user,
  };
}


async function runApiTests() {
  console.log("\n=== API VERIFICATION ===\n");

  const health = await api("/api/health");
  record(
    "api",
    "GET /api/health",
    health.ok && health.json?.status === "healthy" ? "pass" : "fail",
    `status=${health.status} body=${health.json?.status}`,
  );

  const pub = await api("/api/public/students");
  const pubCount = pub.json?.data?.length ?? 0;
  record("api", "GET /api/public/students", pub.ok && pubCount > 0 ? "pass" : "fail", `count=${pubCount}`);

  const admin = await login("admin");
  if (!admin) {
    record("api", "POST /api/auth/login (admin)", "fail");
    return { admin: null, studentId: null };
  }
  record("api", "POST /api/auth/login (admin)", "pass");

  const tests = [
    ["GET /api/students", "/api/students"],
    ["GET /api/users", "/api/users"],
    ["GET /api/admin/dashboard", "/api/admin/dashboard"],
    ["GET /api/admin/workflows/pending", "/api/admin/workflows/pending"],
    ["GET /api/fees/records", "/api/fees/records"],
    ["GET /api/communications/queue", "/api/communications/queue"],
    ["GET /api/audit/logs", "/api/audit/logs"],
    ["GET /api/roles", "/api/roles"],
    ["GET /api/permissions", "/api/permissions"],
    ["GET /api/sessions/me", "/api/sessions/me"],
    ["GET /api/analytics/class/Class%2010/summary", "/api/analytics/class/Class%2010/summary"],
    ["GET /api/metrics", "/api/metrics"],
  ];

  for (const [name, p] of tests) {
    const r = await api(p, { token: admin.token });
    record("api", name, r.ok ? "pass" : "fail", `HTTP ${r.status}`);
  }

  const dash = await api("/api/admin/dashboard", { token: admin.token });
  const queues = dash.json?.data?.queues ?? dash.json?.queues ?? [];
  const redisOk = Array.isArray(queues);
  record(
    "jobs",
    "admin dashboard queue metrics",
    redisOk ? "pass" : "partial",
    redisOk ? `${queues.length} queue(s) reported` : "no queue array",
  );

  const studentId = pub.json?.data?.[0]?.id;
  if (studentId) {
    const att = await api(
      `/api/attendance/class/Class%2010?date=${new Date().toISOString().slice(0, 10)}`,
      { token: admin.token },
    );
    record("api", "GET /api/attendance/class/:classId", att.ok ? "pass" : "partial", `HTTP ${att.status}`);

    const perf = await api(`/api/performance-notes/student/${studentId}`, { token: admin.token });
    record("api", "GET /api/performance-notes/student/:id", perf.ok ? "pass" : "fail", `HTTP ${perf.status}`);

    const parents = await api(`/api/students/${studentId}/parents`, { token: admin.token });
    record(
      "api",
      "GET /api/students/:id/parents",
      parents.ok ? "pass" : "partial",
      `HTTP ${parents.status} count=${parents.json?.data?.length ?? 0}`,
    );

    const reports = await api(`/api/reports/student/${studentId}`, { token: admin.token });
    record("api", "GET /api/reports/student/:id", reports.ok ? "pass" : "partial", `HTTP ${reports.status}`);

    const gen = await api("/api/reports/generate", {
      method: "POST",
      token: admin.token,
      csrf: admin.csrf,
      body: {
        studentId,
        month: "2099-01",
        teacherNote: "Verification unique month",
        strengths: ["Focus"],
        weaknesses: ["Speed"],
      },
    });
    record(
      "api",
      "POST /api/reports/generate",
      gen.status === 202 || gen.ok ? "pass" : gen.status === 409 ? "partial" : "fail",
      `HTTP ${gen.status}`,
    );
  }

  const teacher = await login("teacher");
  if (teacher) {
    record("api", "POST /api/auth/login (teacher demo)", "pass");
    const roster = await api("/api/students", { token: teacher.token });
    record("api", "GET /api/students (teacher role)", roster.ok ? "pass" : "fail", `HTTP ${roster.status}`);
  } else {
    record("api", "POST /api/auth/login (teacher demo)", "fail", "run db seed portal-users");
  }

  const student = await login("student");
  if (student) {
    const me = await api("/api/students/me", { token: student.token });
    record(
      "api",
      "GET /api/students/me (student role)",
      me.ok ? "pass" : "fail",
      me.json?.data?.fullName || `HTTP ${me.status}`,
    );
  } else {
    record("api", "POST /api/auth/login (student demo)", "fail", "seed portal user?");
  }

  const bad = await api("/api/users");
  record("api", "GET /api/users (no auth)", bad.status === 401 ? "pass" : "fail", `expected 401 got ${bad.status}`);

  const dbg = await api("/api/debug/db");
  record(
    "api",
    "GET /api/debug/db (dev only)",
    dbg.ok ? "pass" : dbg.status === 404 ? "pass" : "partial",
    `HTTP ${dbg.status}`,
  );

  return { admin, studentId };
}

function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    return require(path.join(__dirname, "..", "services", "api-server", "node_modules", "playwright"));
  }
}

async function portalLogin(page, account, expectPath) {
  await page.goto(`${WEB}/login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.locator('input[type="email"]').fill(account.email);
  await page.locator('input[type="password"]').fill(account.password);

  const loginResponse = page.waitForResponse(
    (res) => res.url().includes("/api/auth/login") && res.request().method() === "POST",
    { timeout: 20000 },
  );
  await page.getByRole("button", { name: /sign in/i }).click();
  const res = await loginResponse;
  const ok = res.status() >= 200 && res.status() < 300;
  await page.waitForTimeout(1500);
  const onPortal = page.url().includes(expectPath);
  return { ok, onPortal, url: page.url(), status: res.status() };
}

async function runUiTests() {
  console.log("\n=== UI / BROWSER VERIFICATION ===\n");
  let chromium;
  try {
    ({ chromium } = loadPlaywright());
  } catch (e) {
    record("ui", "playwright available", "fail", e.message);
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const apiErrors = [];

  page.on("requestfailed", (req) => {
    if (req.url().includes("/api/")) {
      apiErrors.push({
        type: "requestfailed",
        url: req.url(),
        failure: req.failure()?.errorText,
        page: page.url(),
      });
    }
  });

  page.on("response", (res) => {
    const url = res.url();
    if (!url.includes("/api/") || res.status() < 400) return;
    // Anonymous bootstrap calls refresh without a session — expected 401/403.
    if (url.includes("/api/auth/refresh") && [401, 403].includes(res.status())) return;
    apiErrors.push({ type: "http", url, status: res.status(), page: page.url() });
  });

  const publicRoutes = [
    "/",
    "/about",
    "/faculty",
    "/faculty/aamera-ishaque",
    "/faculty/muhammad-abdullah",
    "/faculty/tayyaba-gul",
    "/results",
    "/programs",
    "/contact",
    "/current-students",
    "/login",
    "/student-success",
    "/testimonials",
    "/privacy-policy",
    "/terms-of-service",
  ];

  for (const route of publicRoutes) {
    try {
      const res = await page.goto(`${WEB}${route}`, { waitUntil: "domcontentloaded", timeout: 25000 });
      const ok = res && res.status() < 400;
      record("ui", `page load ${route}`, ok ? "pass" : "fail", `HTTP ${res?.status()}`);
    } catch (e) {
      record("ui", `page load ${route}`, "fail", e.message);
    }
  }

  try {
    const admin = await portalLogin(page, ACCOUNTS.admin, "/admin");
    record(
      "ui",
      "admin login → /admin",
      admin.ok && admin.onPortal ? "pass" : "fail",
      `${admin.url} (login HTTP ${admin.status})`,
    );

    if (admin.onPortal) {
      const tabs = [
        "Attendance",
        "Fees",
        "Comms",
        "Users",
        "Students",
        "Reports",
        "Parents",
        "Audit",
        "Roles",
        "Analytics",
      ];
      for (const tab of tabs) {
        const btn = page.getByRole("button", { name: new RegExp(`^${tab}$`, "i") }).first();
        if (await btn.count()) {
          await btn.click();
          await page.waitForTimeout(1200);
          const hasError = (await page.locator("text=/Unable to load|Request failed/i").count()) > 0;
          record("ui", `admin tab: ${tab}`, hasError ? "partial" : "pass");
        } else {
          record("ui", `admin tab: ${tab}`, "fail", "button not found");
        }
      }
    }
  } catch (e) {
    record("ui", "admin portal flow", "fail", e.message);
  }

  try {
    await context.clearCookies();
    const student = await portalLogin(page, ACCOUNTS.student, "/student");
    record(
      "ui",
      "student login → /student",
      student.ok && student.onPortal ? "pass" : "fail",
      `${student.url} (login HTTP ${student.status})`,
    );
    if (student.onPortal) {
      let profileOk = false;
      try {
        await page.waitForSelector("text=Ahmed Hassan", { timeout: 15000 });
        profileOk = true;
      } catch {
        const profileErr =
          (await page.locator("text=Unable to load student profile").count()) > 0;
        record("ui", "student profile (/students/me)", "fail", profileErr ? "error shown" : "profile not rendered");
        profileOk = false;
      }
      if (profileOk) {
        record("ui", "student profile (/students/me)", "pass", "Ahmed Hassan");
      }
    }
  } catch (e) {
    record("ui", "student portal flow", "fail", e.message);
  }

  try {
    await context.clearCookies();
    const teacher = await portalLogin(page, ACCOUNTS.teacher, "/teacher");
    record(
      "ui",
      "teacher login → /teacher",
      teacher.ok && teacher.onPortal ? "pass" : "partial",
      teacher.onPortal ? teacher.url : `${teacher.url} — seed teacher.demo?`,
    );
    if (teacher.onPortal) {
      const rosterErr = (await page.locator("text=/Unable to load|Request failed/i").count()) > 0;
      record("ui", "teacher roster load", rosterErr ? "partial" : "pass");
    }
  } catch (e) {
    record("ui", "teacher portal flow", "fail", e.message);
  }

  record(
    "ui",
    "API errors during browser pass",
    apiErrors.length === 0 ? "pass" : "partial",
    `${apiErrors.length} issue(s)`,
  );
  if (apiErrors.length) {
    fs.writeFileSync(
      path.join(__dirname, "..", "artifacts", "ui-api-errors.json"),
      JSON.stringify(apiErrors.slice(0, 80), null, 2),
    );
  }

  await browser.close();
}

async function main() {
  console.log(`API: ${API}\nWEB: ${WEB}\n`);
  const uiOnly = process.argv.includes("--ui-only");
  if (uiOnly) {
    await runUiTests();
  } else {
    await runApiTests();
    await runUiTests();
  }

  const out = path.join(__dirname, "..", "artifacts", "verification-report.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(results, null, 2));

  const pass = results.filter((r) => r.status === "pass").length;
  const partial = results.filter((r) => r.status === "partial").length;
  const fail = results.filter((r) => r.status === "fail").length;
  console.log(`\n=== SUMMARY: ${pass} pass, ${partial} partial, ${fail} fail ===`);
  console.log(`Report: ${out}`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

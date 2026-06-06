import http from "http";

const loginData = JSON.stringify({ email: "info@topperscoachingcenter.com", password: "ChangeMe123!" });

const req = http.request({
  hostname: "localhost", port: 3001, path: "/api/auth/login",
  method: "POST",
  headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(loginData) },
}, (res) => {
  let body = "";
  res.on("data", (chunk) => (body += chunk));
  res.on("end", () => {
    const auth = JSON.parse(body);
    const token = auth?.accessToken;
    if (!token) { console.log("NO TOKEN - checking if auth returns token keys:", Object.keys(auth)); return; }
    console.log("GOT TOKEN:", token.substring(0, 20) + "...");

    // Test 1: /api/attendance/all (with auth)
    const req1 = http.request({
      hostname: "localhost", port: 3001, path: "/api/attendance/all?date=2026-05-23",
      method: "GET", headers: { Authorization: `Bearer ${token}` },
    }, (res1) => {
      let b1 = "";
      res1.on("data", (c) => b1 += c);
      res1.on("end", () => {
        console.log("\n=== TEST 1: GET /api/attendance/all ===");
        console.log("Status:", res1.statusCode);
        try {
          const p1 = JSON.parse(b1);
          console.log("Response keys:", Object.keys(p1));
          console.log("Data length:", Array.isArray(p1.data) ? p1.data.length : typeof p1.data);
          if (res1.statusCode === 200) {
            console.log("FIRST 2 items:", JSON.stringify(p1.data?.slice(0, 2)));
          } else {
            console.log("Error:", p1.error?.message || p1);
          }
        } catch(e) { console.log("RAW:", b1.slice(0, 300)); }

        // Test 2: /api/students?limit=100
        const req2 = http.request({
          hostname: "localhost", port: 3001, path: "/api/students?limit=100",
          method: "GET", headers: { Authorization: `Bearer ${token}` },
        }, (res2) => {
          let b2 = "";
          res2.on("data", (c) => b2 += c);
          res2.on("end", () => {
            console.log("\n=== TEST 2: GET /api/students?limit=100 ===");
            console.log("Status:", res2.statusCode);
            try {
              const p2 = JSON.parse(b2);
              console.log("Data length:", Array.isArray(p2.data) ? p2.data.length : typeof p2.data);
              if (res2.statusCode === 200 && Array.isArray(p2.data)) {
                console.log("FIRST 2 items:", JSON.stringify(p2.data.slice(0, 2).map(s => ({id: s.id.substring(0,8), name: s.fullName, class: s.class}))));
              } else {
                console.log("Error:", p2.error?.message || JSON.stringify(p2).slice(0, 300));
              }
            } catch(e) { console.log("RAW:", b2.slice(0, 300)); }

            // Test 3: /api/students?limit=500 (see if validation error occurs)
            const req3 = http.request({
              hostname: "localhost", port: 3001, path: "/api/students?limit=500",
              method: "GET", headers: { Authorization: `Bearer ${token}` },
            }, (res3) => {
              let b3 = "";
              res3.on("data", (c) => b3 += c);
              res3.on("end", () => {
                console.log("\n=== TEST 3: GET /api/students?limit=500 ===");
                console.log("Status:", res3.statusCode);
                try {
                  const p3 = JSON.parse(b3);
                  if (res3.statusCode !== 200) {
                    console.log("ERROR (expected):", p3.error?.message || JSON.stringify(p3).slice(0, 200));
                  } else {
                    console.log("UNEXPECTED SUCCESS, data:", Array.isArray(p3.data) ? p3.data.length : "none");
                  }
                } catch(e) { console.log("RAW:", b3.slice(0, 300)); }
                console.log("\n=== DIAGNOSIS COMPLETE ===");
              });
            });
            req3.on("error", console.error);
            req3.end();
          });
        });
        req2.on("error", console.error);
        req2.end();
      });
    });
    req1.on("error", console.error);
    req1.end();
  });
});
req.on("error", console.error);
req.write(loginData);
req.end();
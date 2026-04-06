async function testMe() {
  try {
    const loginRes = await fetch("https://lucro-certolucro-certo-api.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@lucrocerto.com", password: "admin123" })
    });
    const loginData = await loginRes.json();
    console.log("Token:", loginData.token);

    const meRes = await fetch("https://lucro-certolucro-certo-api.onrender.com/auth/me", {
      method: "GET",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": "Bearer " + loginData.token
      }
    });

    const status = meRes.status;
    const body = await meRes.text();
    console.log("Me Status:", status);
    console.log("Me Body:", body);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}
testMe();

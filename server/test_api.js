async function testLogin() {
  try {
    const res = await fetch("https://lucro-certolucro-certo-api.onrender.com/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@lucrocerto.com", password: "admin123" })
    });
    const status = res.status;
    const body = await res.text();
    console.log("Status:", status);
    console.log("Body:", body);
  } catch (err) {
    console.error("Fetch Error:", err);
  }
}
testLogin();

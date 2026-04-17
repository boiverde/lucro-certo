const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhNDJmZjM0NS0xOGQ0LTQ2ZDctYmRkMi05NTc0NDY1ZDYxZTkiLCJpYXQiOjE3NzYxMDg4NTIsImV4cCI6MTc3NjExMjQ1Mn0.V83fySXjQWr-LgMzd9wun_pytFiFdisqYZFkTC6D7iQ';
const api = 'https://lucro-certolucerto-api.onrender.com';

async function testRoute() {
    const res = await fetch(`${api}/vendas`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const text = await res.text();
    console.log("RESPONSE:", text.substring(0, 500));
}

testRoute();

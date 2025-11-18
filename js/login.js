const loginBox = document.getElementById("loginBox");
let timeout;

function mostrarLogin() {
  if (!loginBox) return;
  loginBox.classList.add("show");
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    loginBox.classList.remove("show");
  }, 6000);
}

document.addEventListener("mousemove", mostrarLogin);

document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById("loginForm");
  const submit = document.getElementById('submitbttn');

  const handleLogin = async (ev) => {
    ev.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (email === "" || password === "") {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      const resp = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.message || "No pudimos validar tus datos");
      }

      sessionStorage.setItem("user", data.user?.name || email);
      sessionStorage.setItem("token", data.token);
      window.location.href = "index.html";
    } catch (err) {
      alert(`No se pudo iniciar sesión: ${err.message}`);
    }
  };

  submit?.addEventListener('click', handleLogin);
  form?.addEventListener("submit", handleLogin);
});

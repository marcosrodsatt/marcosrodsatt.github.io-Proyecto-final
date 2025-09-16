const loginBox = document.getElementById("loginBox");
    let timeout;

    function mostrarLogin() {
      loginBox.classList.add("show");
      
      // Reinicia el temporizador cada vez que se mueve el mouse
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        loginBox.classList.remove("show");
      }, 6000); // Se oculta después de 3 segundos sin movimiento
    }

    document.addEventListener("mousemove", mostrarLogin);


    document.addEventListener('DOMContentLoaded', function(){

    let submitbttn = document.getElementById('submitbttn');

    submitbttn.addEventListener('click', function(){
      
      let username = document.getElementById('email').value.trim();
      let password = document.getElementById('password').value.trim();

   
    
    if (username === "" || password === "") {
      alert("Por favor completa todos los campos");
      return;
    }

    // Guardar en sesión
    sessionStorage.setItem("user", username);

    // Redirigir
    window.location.href = "index.html";
  })
  });

const form = document.getElementById("loginForm");

  form.addEventListener("submit", function(e) {
    e.preventDefault(); // Evita que se “envíen datos”
    if (form.checkValidity()) {
      window.location.href = "index.html"; // Redirige si todo es válido
    }
  });

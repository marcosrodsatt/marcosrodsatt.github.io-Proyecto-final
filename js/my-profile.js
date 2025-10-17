const form = document.getElementById('profile-form');
const profileImage = document.getElementById('profile-image');
const uploadPhoto = document.getElementById('upload-photo');

// === 1️⃣ Precargar datos existentes ===
document.addEventListener("DOMContentLoaded", () => {
  // Cargar foto si existe
  const savedImage = localStorage.getItem('profileImage');
  if (savedImage) {
    profileImage.src = savedImage;
  }

  // Cargar datos del perfil si existen
  const savedProfile = JSON.parse(localStorage.getItem('userProfile'));
  if (savedProfile) {
    document.getElementById('first-name').value = savedProfile.firstName || "";
    document.getElementById('last-name').value = savedProfile.lastName || "";
    document.getElementById('email').value = savedProfile.email || "";
    document.getElementById('phone').value = savedProfile.phone || "";
  } else {
    // Si no hay perfil guardado, precargar el email del usuario logueado
    const loggedEmail = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (loggedEmail) {
      document.getElementById('email').value = loggedEmail;
    }
  }
});

// === 2️⃣ Guardar imagen de perfil ===
uploadPhoto.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // (Opcional) Limitar tamaño
  if (file.size > 1024 * 1024) {
    alert("La imagen es demasiado grande. Seleccioná una menor a 1 MB.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const base64Image = reader.result;
    profileImage.src = base64Image;

    // ✅ Guardar la imagen en localStorage (persiste al cerrar navegador)
    localStorage.setItem('profileImage', base64Image);
  };
  reader.readAsDataURL(file);
});

// === 3️⃣ Guardar datos del perfil ===
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const profileData = {
    firstName: document.getElementById('first-name').value.trim(),
    lastName: document.getElementById('last-name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
  };

  // ✅ Guardar en localStorage (persiste entre sesiones)
  localStorage.setItem('userProfile', JSON.stringify(profileData));

  alert("✅ Perfil guardado con éxito");
});
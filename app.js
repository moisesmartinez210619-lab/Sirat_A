// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { 
  getFirestore, 
  addDoc, 
  collection, 
  getDocs, 
  updateDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// 🔥 CONFIGURA TU FIREBASE AQUÍ
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_STORAGE_BUCKET",
  messagingSenderId: "TU_MESSAGING_ID",
  appId: "TU_APP_ID"
};

// Inicialización
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ------------------- REGISTRO -------------------
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = registerEmail.value;
    const password = registerPassword.value;

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("✅ Registro exitoso. Ahora inicia sesión con tu cuenta.");
      // 🔁 Redirigir a la pantalla de inicio de sesión
      window.location.href = "index.html";
    } catch (error) {
      alert("❌ Error al registrarse: " + error.message);
    }
  });
}

// ------------------- LOGIN -------------------
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = loginEmail.value;
    const password = loginPassword.value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // ✅ Si el correo es del admin, lo manda al panel de administrador
      if (email === "admin@sirat-sena.com") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "report.html";
      }

    } catch (error) {
      alert("❌ Error al iniciar sesión: " + error.message);
    }
  });
}

// ------------------- ENVIAR REPORTE -------------------
const reportForm = document.getElementById("reportForm");
if (reportForm) {
  reportForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombreApellido = document.getElementById("nombreApellido").value;
    const formacion = document.getElementById("formacion").value;
    const ficha = document.getElementById("ficha").value;
    const instructor = document.getElementById("instructor").value;
    const fechaAccidente = document.getElementById("fechaAccidente").value;
    const horaAccidente = document.getElementById("horaAccidente").value;
    const gravedad = document.getElementById("gravedad").value;
    const descripcion = document.getElementById("descripcion").value;
    const imagen = document.getElementById("imagen").files[0];

    try {
      let imagenURL = "";
      if (imagen) {
        const imagenRef = ref(storage, `reportes/${Date.now()}-${imagen.name}`);
        await uploadBytes(imagenRef, imagen);
        imagenURL = await getDownloadURL(imagenRef);
      }

      await addDoc(collection(db, "reportes"), {
        nombreApellido,
        formacion,
        ficha,
        instructor,
        fechaAccidente,
        horaAccidente,
        gravedad,
        descripcion,
        imagenURL,
        estado: "pendiente",
        fechaEnvio: new Date().toISOString()
      });

      alert("✅ Reporte enviado con éxito");
      e.target.reset();

    } catch (error) {
      alert("❌ Error al enviar el reporte: " + error.message);
    }
  });
}

// ------------------- PANEL ADMIN -------------------
const reportList = document.getElementById("reportList");
if (reportList) {
  async function cargarReportes() {
    const querySnapshot = await getDocs(collection(db, "reportes"));
    reportList.innerHTML = "";
    
    querySnapshot.forEach((docu) => {
      const data = docu.data();
      const div = document.createElement("div");
      div.classList.add("reporte");
      div.innerHTML = `
        <p><strong>Nombre:</strong> ${data.nombreApellido}</p>
        <p><strong>Formación:</strong> ${data.formacion}</p>
        <p><strong>Ficha:</strong> ${data.ficha}</p>
        <p><strong>Instructor:</strong> ${data.instructor}</p>
        <p><strong>Fecha:</strong> ${data.fechaAccidente} - ${data.horaAccidente}</p>
        <p><strong>Gravedad:</strong> ${data.gravedad}</p>
        <p><strong>Descripción:</strong> ${data.descripcion}</p>
        ${data.imagenURL ? `<img src="${data.imagenURL}" width="200" alt="Imagen del accidente">` : ""}
        <p><strong>Estado:</strong> ${data.estado}</p>
        <button class="btn-solucionar" data-id="${docu.id}">Marcar como solucionado</button>
      `;
      reportList.appendChild(div);
    });

    // Botones de "solucionado"
    document.querySelectorAll(".btn-solucionar").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        await updateDoc(doc(db, "reportes", id), { estado: "solucionado" });
        alert("✅ Reporte marcado como solucionado");
        cargarReportes();
      });
    });
  }

  cargarReportes();
}


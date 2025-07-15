console.log("JS loaded. Html5Qrcode available:", typeof Html5Qrcode);

let html5QrCode;

// To Start scanning
function startScanner() {
  const scannerDiv = "scanner";
  const config = { fps: 10, qrbox: 250 };

  // Create a new instance
  html5QrCode = new Html5Qrcode(scannerDiv);

  html5QrCode
    .start(
      { facingMode: "environment" }, // use rear camera on mobile
      config,
      (decodedText, decodedResult) => {
        console.log("Scanned text:", decodedText);
        document.getElementById(
          "barcode-result"
        ).innerText = `Scanned: ${decodedText}`;
        fetchProductInfo(decodedText);
        html5QrCode.stop().then(() => {
          console.log("Scanner stopped after scan");
        });
      },
      (errorMessage) => {
      }
    )
    .catch((err) => {
      console.error("Camera start error:", err);
      alert("Unable to access camera. Make sure permission is allowed.");
    });
}

// To Stop scanning
function stopScanner() {
  if (html5QrCode) {
    html5QrCode
      .stop()
      .then(() => {
        document.getElementById("scanner").innerHTML = "";
        console.log("Scanner stopped");
      })
      .catch((err) => {
        console.error("Failed to stop scanner:", err);
      });
  }
}

async function fetchProductInfo(code) {
  const infoBox = document.getElementById("product-info");
  infoBox.innerHTML = "<p>Fetching product info...</p>";

  try {
    const res = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`);
    
    console.log("Status:", res.status);

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    console.log("API Response:", data);

     if (data.items && data.items.length > 0) {
      const item = data.items[0];
      infoBox.innerHTML = `
        <div class="product-card">
          <img src="${item.images[0] || ''}" alt="${item.title}" />
          <h2>${item.title}</h2>
          <p>Brand: ${item.brand}</p>
          <p>${item.description || 'No description available.'}</p>
        </div>
      `;  
    } else {
      infoBox.innerHTML = "<p>Product not found.</p>";
    }

  } catch (err) {
    console.error("Could not fetch product info:", err);
    infoBox.innerHTML = `<p style="color: red;">Could not fetch product info</p>`;
  }
}
// Dark mode toggle
const toggleButton = document.getElementById("toggle-theme");

toggleButton.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");

  //Save preference
  if (document.body.classList.contains("dark-mode")) {
    toggleButton.innerText = "☀️ Light Mode";
    localStorage.setItem("theme", "dark");
  } else {
    toggleButton.innerText = "🌙 Dark Mode";
    localStorage.setItem("theme", "light");
  }
});

// Load saved theme on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    toggleButton.innerText = "☀️ Light Mode";
  }
});

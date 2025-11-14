// ----------------------------
// BROWSER SCRIPT - FULLY WORKING
// ----------------------------
import { data } from "./data.js"; // now from static folder







const init = () => {
  // ---------- DOG SEARCH ----------
  const searchInput = document.getElementById("dogSearchInput");
  const dogList = document.getElementById("dogList");
  let allDogs = data || [];

  const renderDogs = (dogs) => {
    if (!dogList) return;
    dogList.innerHTML = dogs.map(dog => `
      <div class="dog-card">
        <img src="${dog.image || 'https://via.placeholder.com/250'}" alt="${dog.title}" />
        <h3>${dog.title}</h3>
        <p>${dog.description}</p>
        <p><strong>City:</strong> ${dog.city}</p>
        <p><strong>Contact:</strong> ${dog.contact.phone}</p>
      </div>
    `).join('');
  };

  if (searchInput && dogList) {
    renderDogs(allDogs);

    searchInput.addEventListener("input", () => {
      const value = searchInput.value.toLowerCase();
      const filtered = allDogs.filter(d => 
        d.title.toLowerCase().includes(value) ||
        d.city.toLowerCase().includes(value) ||
        d.state.toLowerCase().includes(value)
      );
      renderDogs(filtered);
    });
  }

  // ---------- CONTACT FORM ----------
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(contactForm);

      try {
        const response = await fetch('https://formspree.io/f/xgvpganz', {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          alert('Message sent successfully!');
          contactForm.reset();
        } else {
          alert('Failed to send message. Try again later.');
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred. Please try again.');
      }
    });
  }


    // ===================== MOBILE MENU TOGGLE =====================
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-link'); // matches HTML

menuToggle.addEventListener('click', () => {
  navLinks.classList.toggle('show'); // matches CSS
});



  // ---------- ANIMAL REPORT FORM ----------
  const form = document.getElementById('animalForm');
  const successMessage = document.getElementById('successMessage');
  let uploadedImageUrl = "";

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Get elements safely
      const animalTypeEl = document.getElementById('animalType');
      const postalCodeEl = document.getElementById('postalCode');
      const descriptionEl = document.getElementById('description');
      const addressEl = document.getElementById('address');

      if (!animalTypeEl || !postalCodeEl || !descriptionEl || !addressEl) {
        alert("Form elements missing. Please refresh the page.");
        return;
      }

      const formData = {
        animalType: animalTypeEl.value,
        postalCode: postalCodeEl.value,
        description: descriptionEl.value,
        address: addressEl.value,
        imageUrl: uploadedImageUrl
      };

      try {
        const endpoint = window.location.hostname.includes('localhost')
          ? 'http://localhost:8888/.netlify/functions/notify-ngo'
          : '/.netlify/functions/notify-ngo';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
          console.log("✅ Form successfully submitted!");
          form.style.display = "none";
          if (successMessage) successMessage.style.display = "block";
          alert(result.message || "Report sent!");
        } else {
          console.error('❌ Submission error:', result);
          alert(result.error || "Something went wrong.");
        }
      } catch (err) {
        console.error("⚠️ Network error:", err);
        alert("Network error. Please try again later.");
      }
    });
  }

  // ---------- CLOUDINARY PHOTO UPLOAD ----------
  const photoInput = document.getElementById('photoInput');
  const photoUploadArea = document.getElementById('photoUploadArea');
  const uploadBtn = document.getElementById('uploadBtn');
  const imagePreviewContainer = document.getElementById('imagePreview');
  const previewImg = document.getElementById('previewImg');
  const removePhotoBtn = document.getElementById('removePhoto');
  const MAX_WIDTH = 800;
  const MAX_HEIGHT = 500;

const CLOUD_NAME = "dn6stj8vn";
const UPLOAD_PRESET = "animal_reports";



  if (uploadBtn && photoInput) {
    uploadBtn.addEventListener('click', () => photoInput.click());

    photoInput.addEventListener('change', function() {
      const file = this.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function(e) {
        const img = new Image();
        img.onload = async function() {
          let width = img.width;
          let height = img.height;

          if (width > height && width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          } else if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          if (previewImg) previewImg.src = canvas.toDataURL('image/jpeg', 0.8);
          if (imagePreviewContainer) imagePreviewContainer.style.display = 'block';
          if (photoUploadArea) photoUploadArea.style.display = 'none';

          const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
          const formData = new FormData();
          formData.append("file", blob);
          formData.append("upload_preset", UPLOAD_PRESET);

          try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
              method: "POST",
              body: formData
            });
            const data = await response.json();
            uploadedImageUrl = data.secure_url;
            console.log("✅ Uploaded to Cloudinary:", uploadedImageUrl);
          } catch (err) {
            console.error("❌ Cloudinary upload failed:", err);
            alert("Image upload failed. Try again.");
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

    removePhotoBtn?.addEventListener('click', () => {
      if (photoInput) photoInput.value = '';
      if (previewImg) previewImg.src = '';
      if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
      if (photoUploadArea) photoUploadArea.style.display = 'block';
      uploadedImageUrl = '';
    });
  }
};

document.addEventListener('DOMContentLoaded', init);





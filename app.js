let galleryData = { galleries: [] };
let currentGallery = null;
let currentPhotoIndex = 0;

const navEl = document.getElementById("gallery-nav");
const containerEl = document.getElementById("gallery-container");
const badgeEl = document.getElementById("device-indicator");
const lightboxEl = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");

// 1. Fetch JSON Data produced by Decap CMS
async function loadGalleryData() {
  try {
    const response = await fetch('./data/galleries.json');
    if (!response.ok) throw new Error('Failed to load gallery data');
    galleryData = await response.json();
    
    if (galleryData.galleries && galleryData.galleries.length > 0) {
      currentGallery = galleryData.galleries[0];
      renderNav();
      renderGallery();
    }
  } catch (error) {
    console.error("Error loading galleries:", error);
    containerEl.innerHTML = `<p style="text-align:center; color:#9aa0a6; padding: 2rem;">No galleries found yet. Log in to /admin to upload your first photos.</p>`;
  }
}

// 2. Dynamic Device & Viewport Detection
function detectDeviceMode() {
  const width = window.innerWidth;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  
  let mode = "Desktop Grid";
  if (width < 640) mode = "Mobile Vertical Stream";
  else if (width <= 1024) mode = "Tablet 2-Column View";

  badgeEl.textContent = `Active Mode: ${mode} (${width}px | ${isTouch ? "Touch" : "Pointer"})`;
}

// 3. Render Navigation Bar
function renderNav() {
  navEl.innerHTML = "";
  galleryData.galleries.forEach(gal => {
    const btn = document.createElement("button");
    btn.textContent = gal.title;
    if (gal.id === currentGallery.id) btn.classList.add("active");
    btn.onclick = () => {
      currentGallery = gal;
      renderNav();
      renderGallery();
    };
    navEl.appendChild(btn);
  });
}

// 4. Render Gallery Grid / Feed with Responsive srcset
function renderGallery() {
  containerEl.innerHTML = "";
  if (!currentGallery || !currentGallery.photos) return;

  currentGallery.photos.forEach((photo, index) => {
    const card = document.createElement("article");
    card.className = "photo-card";

    const img = document.createElement("img");
    img.src = photo.src; // Fallback source
    
    // If your CMS or storage solution generates smaller size variants, 
    // you can automatically hook them up here for bandwidth savings on mobile:
    // img.srcset = `${photo.src}?w=600 600w, ${photo.src}?w=1200 1200w, ${photo.src}?w=2000 2000w`;
    // img.sizes = "(max-width: 639px) 100vw, (max-width: 1024px) 50vw, 33vw";

    img.alt = photo.caption || "Whidbey Island Photography";
    img.loading = "lazy";

    const caption = document.createElement("div");
    caption.className = "photo-caption";
    caption.textContent = photo.caption;

    // Open lightbox on Tablet/Desktop only; Phones use vertical scrolling stream
    card.onclick = () => {
      if (window.innerWidth >= 640) {
        openLightbox(index);
      }
    };

    card.appendChild(img);
    card.appendChild(caption);
    containerEl.appendChild(card);
  });
}

// 5. Lightbox Controls
function openLightbox(index) {
  currentPhotoIndex = index;
  updateLightbox();
  lightboxEl.classList.remove("hidden");
}

function updateLightbox() {
  const photo = currentGallery.photos[currentPhotoIndex];
  lightboxImg.src = photo.src;
  lightboxCaption.textContent = photo.caption;
}

document.getElementById("lightbox-close").onclick = () => lightboxEl.classList.add("hidden");
document.getElementById("lightbox-prev").onclick = () => {
  currentPhotoIndex = (currentPhotoIndex - 1 + currentGallery.photos.length) % currentGallery.photos.length;
  updateLightbox();
};
document.getElementById("lightbox-next").onclick = () => {
  currentPhotoIndex = (currentPhotoIndex + 1) % currentGallery.photos.length;
  updateLightbox();
};

// Close lightbox on escape key or background click
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") lightboxEl.classList.add("hidden");
});
lightboxEl.onclick = (e) => {
  if (e.target === lightboxEl) lightboxEl.classList.add("hidden");
};

window.addEventListener("resize", detectDeviceMode);

// Initialize app on load
detectDeviceMode();
loadGalleryData();
import sliderData from "./sliderData.js";

const config = {
    SCROLL_SPEED: 1.75,
    LERP_FACTOR: 0.05,
    MAX_VELOCITY: 150,
};

const totalSlideCount = sliderData.length;

const state = {
    currentX: 0,
    targetX: 0,
    slideWidth: 390,
    slides: [],
    isDragging: false,
    startX: 0,
    lastX: 0,
    lastMouseX: 0,
    lastScrollTime: Date.now(),
    isMoving: false,
    velocity: 0,
    lastCurrentX: 0,
    dragDistance: 0,
    hasActuallyDragged: false,
    isMobile: false,
    lastClickedSlide: null, // <-- NEW: To remember what was clicked
};

function checkMobile() {
    state.isMobile = window.innerWidth < 1000;
}

function createSlideElement(index) {
    const slide = document.createElement("div");
    slide.className = "slide";

    if (state.isMobile) {
        // These styles are set here, but also in CSS for robustness
        slide.style.width = "255px";
        slide.style.height = "300px";
    }

    const imageContainer = document.createElement("div");
    imageContainer.className = "slide-image";

    const img = document.createElement("img");
    const dataIndex = index % totalSlideCount;
    img.src = sliderData[dataIndex].img;
    img.alt = sliderData[dataIndex].title;

    const overlay = document.createElement("div");
    overlay.className = "slide-overlay";

    const title = document.createElement("p");
    title.className = "project-title";
    title.textContent = sliderData[dataIndex].title;

    const arrow = document.createElement("div");
    arrow.className = "project-arrow";
    arrow.innerHTML = `<svg viewBox="0 0 24 24">
<path d="M7 17L17 7M17 7H7M17 7V17"></path>
</svg>`;

    // MODIFIED: Pass the 'slide' element itself to openModal
    slide.addEventListener("click", (e) => {
        e.preventDefault();
        if (state.dragDistance < 10 && !state.hasActuallyDragged) {
            openModal(dataIndex, slide); // Pass 'slide'
        }
    });

    overlay.appendChild(title);
    overlay.appendChild(arrow);
    imageContainer.appendChild(img);
    slide.appendChild(imageContainer);
    slide.appendChild(overlay);

    return slide;
}

// --- MODAL FUNCTIONS (HEAVILY MODIFIED) ---
const modalOverlay = document.getElementById("modal-overlay");
const modalContent = document.querySelector(".modal-content");
const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalClient = document.getElementById("modal-client");
const modalDescription = document.getElementById("modal-description");

// 'slideElement' is the new parameter
function openModal(index, slideElement) {
    // Store the clicked slide for the close animation
    state.lastClickedSlide = slideElement;
    const project = sliderData[index];

    // 1. Populate the modal content
    modalImage.src = project.img;
    modalTitle.textContent = project.title;
    modalClient.textContent = `Client: ${project.client || "N/A"}`;
    modalDescription.textContent = project.description || "No description available.";

    // 2. Get position and size of the clicked slide's IMAGE
    const slideImgRect = slideElement.querySelector(".slide-image").getBoundingClientRect();
    // Get final position of the modal's content box
    const modalContentRect = modalContent.getBoundingClientRect();

    // 3. Calculate the scale and translation needed for the animation
    const scaleX = slideImgRect.width / modalContentRect.width;
    const scaleY = slideImgRect.height / modalContentRect.height;
    
    // Calculate translation to move modal center to slide center
    const translateX = (slideImgRect.left + slideImgRect.width / 2) - (modalContentRect.left + modalContentRect.width / 2);
    const translateY = (slideImgRect.top + slideImgRect.height / 2) - (modalContentRect.top + modalContentRect.height / 2);

    // 4. Set CSS variables to instantly move modal to the slide's position
    modalContent.style.setProperty("--modal-start-x", `${translateX}px`);
    modalContent.style.setProperty("--modal-start-y", `${translateY}px`);
    modalContent.style.setProperty("--modal-start-scale-x", scaleX);
    modalContent.style.setProperty("--modal-start-scale-y", scaleY);
    
    // A tiny delay to ensure CSS is set before transition starts
    setTimeout(() => {
        // 5. Show the modal (this triggers the CSS transition)
        modalOverlay.classList.add("active");
    }, 10);
}

function closeModal() {
    // 1. Get the LAST clicked slide
    const slideElement = state.lastClickedSlide;
    if (!slideElement) {
        modalOverlay.classList.remove("active");
        return;
    }

    // 2. Get its CURRENT position (it might have moved!)
    const slideImgRect = slideElement.querySelector(".slide-image").getBoundingClientRect();
    const modalContentRect = modalContent.getBoundingClientRect();

    // 3. Recalculate the scale and translation
    const scaleX = slideImgRect.width / modalContentRect.width;
    const scaleY = slideImgRect.height / modalContentRect.height;
    
    const translateX = (slideImgRect.left + slideImgRect.width / 2) - (modalContentRect.left + modalContentRect.width / 2);
    const translateY = (slideImgRect.top + slideImgRect.height / 2) - (modalContentRect.top + modalContentRect.height / 2);

    // 4. Set the variables AGAIN to ensure it animates back to the correct spot
    modalContent.style.setProperty("--modal-start-x", `${translateX}px`);
    modalContent.style.setProperty("--modal-start-y", `${translateY}px`);
    modalContent.style.setProperty("--modal-start-scale-x", scaleX);
    modalContent.style.setProperty("--modal-start-scale-y", scaleY);

    // 5. Hide the modal (triggers the reverse animation)
    modalOverlay.classList.remove("active");
}
// ------------------------------------------

function initializeSlides() {
    const track = document.querySelector(".slide-track");
    if (!track) return; // Safety check
    track.innerHTML = "";
    state.slides = [];

    checkMobile();
    // Calculate slide width including margin (350px width + 20px margin * 2)
    state.slideWidth = state.isMobile ? (255 + 20) : (350 + 40);

    const copies = 6;
    const totalSlides = totalSlideCount * copies;

    for (let i = 0; i < totalSlides; i++) {
        const slide = createSlideElement(i);
        track.appendChild(slide);
        state.slides.push(slide);
    }

    const startOffset = -(totalSlideCount * state.slideWidth * 2);
    state.currentX = startOffset;
    state.targetX = startOffset;
}

function updateSlidePositions() {
    const track = document.querySelector(".slide-track");
    if (!track) return;
    const sequenceWidth = state.slideWidth * totalSlideCount;

    // Don't update positions if modal is open, to prevent weirdness
    if (modalOverlay.classList.contains("active")) return;

    if (state.currentX > -sequenceWidth * 1) {
        state.currentX -= sequenceWidth;
        state.targetX -= sequenceWidth;
    } else if (state.currentX < -sequenceWidth * 4) {
        state.currentX += sequenceWidth;
        state.targetX += sequenceWidth;
    }

    track.style.transform = `translate3d(${state.currentX}px, 0, 0)`;
}

function updateParallax() {
    const viewportCenter = window.innerWidth / 2;
    state.slides.forEach((slide) => {
        const img = slide.querySelector("img");
        if (!img) return;

        const slideRect = slide.getBoundingClientRect();
        if (slideRect.right < -500 || slideRect.left > window.innerWidth + 500) {
            return;
        }

        const slideCenter = slideRect.left + slideRect.width / 2;
        const distanceFromCenter = slideCenter - viewportCenter;
        const parallaxOffset = distanceFromCenter * -0.25;

        img.style.transform = `translateX(${parallaxOffset}px) scale(2.25)`;
    });
}

function updateMovingState() {
    state.velocity = Math.abs(state.currentX - state.lastCurrentX);
    state.lastCurrentX = state.currentX;

    const isSlowEnough = state.velocity < 0.1;
    const hasBeenStillLongEnough = Date.now() - state.lastScrollTime > 200;

    state.isMoving = !isSlowEnough || !hasBeenStillLongEnough;
    state.hasActuallyDragged = state.isMoving || !hasBeenStillLongEnough;

    document.documentElement.style.setProperty(
        "--slider-moving",
        state.isMoving ? "1" : "0"
    );
}

function animate() {
    // Pause animation loop if modal is open
    if (!modalOverlay.classList.contains("active")) {
        state.currentX += (state.targetX - state.currentX) * config.LERP_FACTOR;
        updateMovingState();
        updateSlidePositions();
        updateParallax();
    }

    requestAnimationFrame(animate);
}

function handleWheel(e) {
    // Don't scroll background if modal is open
    if (modalOverlay.classList.contains("active")) return;

    // Check if the scroll is predominantly vertical
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // If it's horizontal, let the browser handle it (e.g., trackpad swipe)
        // But we still apply our logic
        state.targetX -= e.deltaX * config.SCROLL_SPEED * 0.5;
    } else {
        // If it's vertical (mouse wheel), we take over
        e.preventDefault();
        state.targetX -= e.deltaY * config.SCROLL_SPEED;
    }
    
    state.lastScrollTime = Date.now();
    const scrollDelta = e.deltaY * config.SCROLL_SPEED;
    state.targetX -= Math.max(
        -config.MAX_VELOCITY,
        Math.min(config.MAX_VELOCITY, scrollDelta)
    );
}

function handleTouchStart(e) {
    if (modalOverlay.classList.contains("active")) return;
    state.isDragging = true;
    state.startX = e.touches[0].clientX;
    state.lastX = state.targetX;
    state.dragDistance = 0;
    state.hasActuallyDragged = false;
    state.lastScrollTime = Date.now();
}

function handleTouchMove(e) {
    if (modalOverlay.classList.contains("active") || !state.isDragging) return;

    const deltaX = (e.touches[0].clientX - state.startX) * 1.5;
    state.targetX = state.lastX + deltaX;
    state.dragDistance += Math.abs(deltaX);

    if (state.dragDistance > 5) {
        state.hasActuallyDragged = true;
    }

    state.lastScrollTime = Date.now();
}

function handleTouchEnd() {
    if (modalOverlay.classList.contains("active")) return;
    state.isDragging = false;
    setTimeout(() => {
        state.hasActuallyDragged = false;
    }, 100);
}

function handleMouseDown(e) {
    if (modalOverlay.classList.contains("active")) return;
    e.preventDefault();
    state.isDragging = true;
    state.startX = e.clientX;
    state.lastMouseX = e.clientX;
    state.lastX = state.targetX;
    state.dragDistance = 0;
    state.hasActuallyDragged = false;
    state.lastScrollTime = Date.now();
}

function handleMouseMove(e) {
    if (modalOverlay.classList.contains("active") || !state.isDragging) return;
    
    e.preventDefault();

    const deltaX = (e.clientX - state.lastMouseX) * 2;
    state.targetX += deltaX;
    state.lastMouseX = e.clientX;
    state.dragDistance += Math.abs(deltaX);

    if (state.dragDistance > 5) {
        state.hasActuallyDragged = true;
    }

    state.lastScrollTime = Date.now();
}

function handleMouseUp() {
    state.isDragging = false;
    setTimeout(() => {
        state.hasActuallyDragged = false;
    }, 100);
}

function handleResize() {
    initializeSlides();
}

function initializeEventListeners() {
    const slider = document.querySelector(".slider");
    if (!slider) return;

    slider.addEventListener("wheel", handleWheel, { passive: false });
    slider.addEventListener("touchstart", handleTouchStart);
    slider.addEventListener("touchmove", handleTouchMove);
    slider.addEventListener("touchend", handleTouchEnd);
    slider.addEventListener("mousedown", handleMouseDown);
    slider.addEventListener("mouseleave", handleMouseUp);
    slider.addEventListener("dragstart", (e) => e.preventDefault());

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);

    // --- MODAL LISTENERS ---
    document.querySelector(".modal-close").addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (e) => {
        if (e.target.id === "modal-overlay") {
            closeModal();
        }
    });

    // Clear last clicked slide after close animation finishes
    modalContent.addEventListener("transitionend", () => {
        if (!modalOverlay.classList.contains("active")) {
            state.lastClickedSlide = null;
            modalImage.src = ""; // Clear image
        }
    });
}

function initializeSlider() {
    initializeSlides();
    initializeEventListeners();
    animate();
}

document.addEventListener("DOMContentLoaded", initializeSlider);
// Import the slider data to populate the dropdown
import sliderData from "./sliderData.js";

document.addEventListener("DOMContentLoaded", () => {
    // --- Get All DOM Elements ---
    const form = document.getElementById("feedback-form");
    const nameInput = document.getElementById("visitor-name");
    const emailInput = document.getElementById("visitor-email");
    const artworkSelect = document.getElementById("favorite-artwork");

    const modalOverlay = document.getElementById("feedback-modal-overlay");
    const modalCloseBtn = document.querySelector(".feedback-modal-close");
    
    // Modal dynamic content
    const modalName = document.getElementById("feedback-modal-name");
    const modalArtwork = document.getElementById("feedback-modal-artwork");
    const modalRating = document.getElementById("feedback-modal-rating");

    // Modal action buttons
    const restartTourBtn = document.getElementById("restart-tour-btn");

    // --- 1. Populate the "Favorite Artwork" Dropdown ---
    function populateFavoriteArtworkSelect() {
        if (!artworkSelect) return;
        
        sliderData.forEach(project => {
            const option = document.createElement("option");
            option.value = project.title;
            option.textContent = project.title;
            artworkSelect.appendChild(option);
        });
    }

    // --- 2. Validation Functions ---
    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(String(email).toLowerCase());
    }

    function showValidation() {
        // This class triggers the :invalid CSS styles
        form.classList.add("was-validated");
    }

    // --- 3. Form Submission ---
    function handleFeedbackSubmit(e) {
        e.preventDefault(); // Stop the form from submitting normally
        
        // Mark form as validated to show errors
        showValidation();

        // Get form values
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const artwork = artworkSelect.value;
        const ratingEl = document.querySelector('input[name="rating"]:checked');
        
        // --- Validation Checks ---
        let isValid = true;
        if (name === "") {
            isValid = false;
        }
        if (!validateEmail(email)) {
            isValid = false;
        }
        if (!ratingEl) {
            // Simple alert for radio, as CSS is trickier
            alert("Please select a rating."); 
            isValid = false;
        }

        if (!isValid) {
            return; // Stop if validation fails
        }
        
        // --- If valid, populate and show modal ---
        const rating = ratingEl.value;
        
        modalName.textContent = name;
        modalArtwork.textContent = artwork;
        modalRating.textContent = `${rating} ${rating > 1 ? 'stars' : 'star'}`;
        
        modalOverlay.classList.add("active");
    }

    // --- 4. Modal Close Functions ---
    function closeModal() {
        modalOverlay.classList.remove("active");
        
        // Reset the form for the next submission
        form.reset();
        form.classList.remove("was-validated");
    }

    // --- 5. Add Event Listeners ---
    if (form) {
        form.addEventListener("submit", handleFeedbackSubmit);
    }
    
    // Close modal listeners
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener("click", closeModal);
    }
    if (modalOverlay) {
        modalOverlay.addEventListener("click", (e) => {
            // Close if clicking on the dark background
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Restart tour button
    if (restartTourBtn) {
        restartTourBtn.addEventListener("click", () => {
            closeModal();
            // Smooth scroll to the top of the page
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // --- Run Initialization ---
    populateFavoriteArtworkSelect();
});
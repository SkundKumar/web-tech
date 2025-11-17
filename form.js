document.addEventListener("DOMContentLoaded", () => {
    
    // Ensure ScrollTrigger is registered
    gsap.registerPlugin(ScrollTrigger);

    // --- 1. Reveal Animation ---
    const animTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: ".feedback-section",
            start: "top 75%", // Starts when the top of form hits 75% of viewport height
            toggleActions: "play none none reverse"
        }
    });

    animTimeline
        .from(".feedback-header h2", {
            y: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        })
        .from(".feedback-header p", {
            y: 20,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        }, "-=0.8")
        .from(".input-group", {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.15, // Waterfall effect for inputs
            ease: "power2.out"
        }, "-=0.6")
        .from(".submit-btn", {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.6");


    // --- 2. Textarea Auto-Resize ---
    // This makes the text box grow as the user types
    const textarea = document.getElementById('message');
    
    if(textarea) {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }
});
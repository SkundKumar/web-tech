// Note: We no longer import gsap, ScrollTrigger, or Lenis here.
// They are loaded globally from the CDN in index.html.

document.addEventListener("DOMContentLoaded", () => {
    // Just register the plugin
    gsap.registerPlugin(ScrollTrigger);

    // Setup Lenis for smooth scroll
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // --- The rest of your spotlight animation code is unchanged ---

    const spotlightImgFinalPos = [
        [-120, -160],
        [20, -130],
        [-140, 20],
        [20, 40],
    ];

    const spotlightImages = document.querySelectorAll(".spotlight-img");

    ScrollTrigger.create({
        trigger: ".spotlight",
        start: "top top",
        end: `+=${window.innerHeight * 6}px`,
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
            const progress = self.progress;

            const initialRotations = [5, -3, 3.5, -0.1];
            const phaseOneStartOffsets = [0, 0.1, 0.2, 0.3];

            spotlightImages.forEach((img, index) => {
                
                const initialRotation = initialRotations[index];
                const phaseOneStart = phaseOneStartOffsets[index];
                const phaseOneEnd = Math.min(
                    phaseOneStart + (0.45 - phaseOneStart) * 0.9,
                    0.45
                );

                let x = -50;
                let y, rotation;

                // Phase 1: Card entry
                if (progress < phaseOneStart) {
                    y =200;
                    rotation = initialRotation;
                } else if (progress < phaseOneEnd) {
                    const phaseProgress =
                        (progress - phaseOneStart) / (phaseOneEnd - phaseOneStart);
                    
                    const linearProgress = 1 - Math.pow(1 - phaseProgress, 3);
                    
                    y = 200 - linearProgress * 250; // 200 to -50
                    rotation = initialRotation;
                } else {
                    y = -50;
                    rotation = initialRotation;
                }

                // Phase 2: Card scatter
                const phaseTwoStartOffsets = [0.5, 0.55, 0.6, 0.65];
                const phaseTwoStart = phaseTwoStartOffsets[index];
                const phaseTwoEnd = Math.min(
                    phaseTwoStart + (0.9 - phaseTwoStart) * 0.9,
                    0.95
                );

                const finalX = spotlightImgFinalPos[index][0];
                const finalY = spotlightImgFinalPos[index][1];

                if (progress >= phaseTwoStart && progress <= 0.95) {
                    let phase2Progress;

                    if (progress >= phaseTwoEnd) {
                        phase2Progress = 1;
                    } else {
                        const linearProgress = (progress - phaseTwoStart) / (phaseTwoEnd - phaseTwoStart);
                        phase2Progress = 1 - Math.pow(1 - linearProgress, 3);
                    }

                    x = -50 + (finalX + 50) * phase2Progress;
                    y = -50 + (finalY + 50) * phase2Progress;
                    rotation = initialRotation * (1 - phase2Progress);

                } else if (progress > 0.95) {
                    x = finalX;
                    y = finalY;
                    rotation = 0;
                }

                gsap.set(img, {
                    transform: `translate(${x}%, ${y}%) rotate(${rotation}deg)`,
                });
            });
        },
    });
});
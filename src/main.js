import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger);

const init = () => {
  const lacesPath = document.querySelector(".laces__path");
  const whiteRings = document.querySelector(".soccer__white-rings");

  // Set initial state - path is not drawn
  gsap.set(lacesPath, { drawSVG: "0%" });

  // Create the yoyo animation for laces
  gsap.to(lacesPath, {
    drawSVG: "100%",
    duration: 7,
    ease: "power2.inOut",
    repeat: -1,
    yoyo: true,
  });

  // White rings rotation on scroll
  gsap.to(whiteRings, {
    rotation: 360,
    ease: "none",
    scrollTrigger: {
      trigger: ".soccer__rings-wrapper",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
};

init();

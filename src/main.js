import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger, SplitText);

// Simple noise function - lower multiplier = slower change
const noise = (t) => Math.sin(t) * 0.5 + 0.5;

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

  // Horizontal scroll for fightclub dirk image with jitter
  const fightclubImage = document.querySelector(".fightclub__dirk");

  if (fightclubImage) {
    let t = 0;
    let scrollProgress = 0;
    const maxJitter = 5;

    const getScrollDistance = () => fightclubImage.scrollWidth - window.innerWidth;

    gsap.to(fightclubImage, {
      x: () => -getScrollDistance(),
      ease: "none",
      scrollTrigger: {
        trigger: fightclubImage,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true,
        // markers: true,
        onUpdate: (self) => {
          scrollProgress = self.progress;
        },
      },
    });

    gsap.ticker.add(() => {
      if (scrollProgress > 0) {
        const intensity = scrollProgress * maxJitter;
        const jitterX = (noise(t) - 0.5) * 2 * intensity;
        const jitterY = (noise(t + 100) - 0.5) * 2 * intensity;

        gsap.set(fightclubImage, { y: jitterY, xPercent: jitterX / 10 });
        t += 1;
      }
    });
  }

  // SplitText animation for fightclub paragraphs
  const fightclubParagraphs = gsap.utils.toArray(".fightclub__animation > p");

  fightclubParagraphs.forEach((paragraph, index) => {
    SplitText.create(paragraph, {
      type: "words,lines",
      mask: "lines",
      linesClass: "line",
      autoSplit: true,
      onSplit: (instance) => {
        // First paragraph: animate in (from below)
        // Second paragraph: animate out (to below)
        if (index === 0) {
          gsap.from(instance.lines, {
            yPercent: 120,
            stagger: 0.1,
            scrollTrigger: {
              trigger: paragraph,
              scrub: true,
              start: "clamp(top center)",
              end: "clamp(bottom center)",
            },
          });
        } else {
          gsap.to(instance.lines, {
            yPercent: 120,
            stagger: 0.1,
            scrollTrigger: {
              trigger: paragraph,
              scrub: true,
              start: "clamp(top center)",
              end: "clamp(bottom center)",
            },
          });
        }
      },
    });
  });
};

init();

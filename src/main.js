import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Physics2DPlugin } from "gsap/Physics2DPlugin";

gsap.registerPlugin(DrawSVGPlugin, ScrollTrigger, SplitText, Draggable, InertiaPlugin, Physics2DPlugin);

// Simple noise function - lower multiplier = slower change
const noise = (t) => Math.sin(t) * 0.5 + 0.5;

// Puzzle Overlay Drawing Functionality
const initPuzzleOverlay = () => {
  const puzzleTrigger = document.querySelector(".puzzle-trigger");
  const puzzleOverlay = document.getElementById("puzzleOverlay");
  const puzzleClose = document.getElementById("puzzleClose");
  const puzzleCanvas = document.getElementById("puzzleCanvas");
  const puzzleUndo = document.getElementById("puzzleUndo");
  const puzzleReset = document.getElementById("puzzleReset");
  const puzzleImage = document.querySelector(".puzzle-overlay__image");

  if (!puzzleTrigger || !puzzleOverlay || !puzzleCanvas) return;

  const ctx = puzzleCanvas.getContext("2d");
  let lines = [];
  let isDrawing = false;
  let startPoint = null;

  // Resize canvas to match image size
  const resizeCanvas = () => {
    if (puzzleImage) {
      puzzleCanvas.width = puzzleImage.offsetWidth;
      puzzleCanvas.height = puzzleImage.offsetHeight;
      redrawLines();
    }
  };

  // Get position relative to canvas
  const getPosition = (e) => {
    const rect = puzzleCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  // Draw a single line
  const drawLine = (line) => {
    ctx.beginPath();
    ctx.moveTo(line.startX, line.startY);
    ctx.lineTo(line.endX, line.endY);
    ctx.strokeStyle = "rgba(7, 69, 176, 0.5)"; // var(--color-blue) with opacity
    ctx.lineWidth = 30;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  // Redraw all lines
  const redrawLines = () => {
    ctx.clearRect(0, 0, puzzleCanvas.width, puzzleCanvas.height);
    lines.forEach(drawLine);
  };

  // Draw preview line while dragging
  const drawPreview = (endX, endY) => {
    redrawLines();
    if (startPoint) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = "rgba(7, 69, 176, 0.3)";
      ctx.lineWidth = 30;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  };

  // Start drawing
  const handleStart = (e) => {
    e.preventDefault();
    isDrawing = true;
    startPoint = getPosition(e);
  };

  // Drawing move (preview)
  const handleMove = (e) => {
    if (!isDrawing || !startPoint) return;
    e.preventDefault();
    const pos = getPosition(e);
    drawPreview(pos.x, pos.y);
  };

  // End drawing
  const handleEnd = (e) => {
    if (!isDrawing || !startPoint) return;
    e.preventDefault();
    
    let endPos;
    if (e.changedTouches) {
      const rect = puzzleCanvas.getBoundingClientRect();
      endPos = {
        x: e.changedTouches[0].clientX - rect.left,
        y: e.changedTouches[0].clientY - rect.top
      };
    } else {
      endPos = getPosition(e);
    }

    const newLine = {
      startX: startPoint.x,
      startY: startPoint.y,
      endX: endPos.x,
      endY: endPos.y
    };
    
    lines.push(newLine);
    redrawLines();
    
    isDrawing = false;
    startPoint = null;
  };

  // Open overlay
  puzzleTrigger.addEventListener("click", () => {
    puzzleOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
    
    // Wait for image to load and then resize canvas
    if (puzzleImage.complete) {
      setTimeout(resizeCanvas, 50);
    } else {
      puzzleImage.onload = resizeCanvas;
    }
  });

  // Close overlay
  puzzleClose.addEventListener("click", () => {
    puzzleOverlay.classList.remove("active");
    document.body.style.overflow = "";
  });

  // Close on overlay background click
  puzzleOverlay.addEventListener("click", (e) => {
    if (e.target === puzzleOverlay) {
      puzzleOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && puzzleOverlay.classList.contains("active")) {
      puzzleOverlay.classList.remove("active");
      document.body.style.overflow = "";
    }
  });

  // Undo last line
  puzzleUndo.addEventListener("click", () => {
    lines.pop();
    redrawLines();
  });

  // Reset all lines
  puzzleReset.addEventListener("click", () => {
    lines = [];
    redrawLines();
  });

  // Mouse events
  puzzleCanvas.addEventListener("mousedown", handleStart);
  puzzleCanvas.addEventListener("mousemove", handleMove);
  puzzleCanvas.addEventListener("mouseup", handleEnd);
  puzzleCanvas.addEventListener("mouseleave", handleEnd);

  // Touch events
  puzzleCanvas.addEventListener("touchstart", handleStart, { passive: false });
  puzzleCanvas.addEventListener("touchmove", handleMove, { passive: false });
  puzzleCanvas.addEventListener("touchend", handleEnd, { passive: false });

  // Resize canvas on window resize
  window.addEventListener("resize", () => {
    if (puzzleOverlay.classList.contains("active")) {
      resizeCanvas();
    }
  });
};

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

  // Pin the soccer rings and scroll through text blocks
  const athleteSoccer = document.querySelector(".athlete__soccer");
  const soccerText = document.querySelector(".athlete__soccer__text");
  const ringsWrapper = document.querySelector(".soccer__rings-wrapper");

  if (athleteSoccer && soccerText && ringsWrapper) {
    // Pin the rings wrapper while scrolling through the text
    ScrollTrigger.create({
      trigger: athleteSoccer,
      start: "top top",
      end: () => `+=${soccerText.scrollHeight*0.75}`,
      pin: ringsWrapper,
      pinSpacing: false,
      // markers: true,
    });

    // White rings rotation on scroll
    gsap.to(whiteRings, {
      rotation: 360,
      ease: "none",
      scrollTrigger: {
        trigger: athleteSoccer,
        start: "top top",
        end: () => `+=${soccerText.scrollHeight}`,
        scrub: true,
      },
    });

    // Animate each text block as it enters/exits the center
    const textBlocks = gsap.utils.toArray(".athlete__soccer__text > div");
    textBlocks.forEach((block) => {
      gsap.fromTo(block, 
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: block,
            start: "top 80%",
            end: "top 30%",
            scrub: true,
          },
        }
      );

      gsap.to(block, {
        opacity: 0,
        y: -50,
        scrollTrigger: {
          trigger: block,
          start: "bottom 30%",
          end: "bottom -10%",
          scrub: true,
        },
      });
    });
  } else {
    // Fallback: just rotate rings on scroll
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
  }

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
        // Both paragraphs: animate in (from below)
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
      },
    });
  });

  // Soccer ball draggable with inertia
  const soccerGoal = document.querySelector(".soccer__goal");
  const soccerBall = document.querySelector(".soccer__ball");
  
  // Explosion effect config
  const dotQuantity = 25;
  const dotSizeMax = 20;
  const dotSizeMin = 10;
  const emitterSize = 100;
  const speed = 3;
  const gravity = 3;
  
  // Explode at position - creates fresh dots each time
  function explode(x, y) {
    const container = document.createElement("div");
    container.style.cssText = `position:fixed; left:${x}px; top:${y}px; overflow:visible; z-index:5000; pointer-events:none;`;
    document.body.appendChild(container);
    
    const tl = gsap.timeline({
      onComplete: () => container.remove()
    });
    
    for (let i = 0; i < dotQuantity; i++) {
      const dot = document.createElement("div");
      dot.className = "explosion-dot";
      const size = gsap.utils.random(dotSizeMin, dotSizeMax, 1);
      container.appendChild(dot);

      const angle = Math.random() * Math.PI * 2;
      const length = Math.random() * (emitterSize / 2 - size / 2);

      gsap.set(dot, {
        x: Math.cos(angle) * length,
        y: Math.sin(angle) * length,
        width: size,
        height: size,
        xPercent: -50,
        yPercent: -50,
        force3D: true,
        opacity: 1
      });

      tl.to(
        dot,
        {
          physics2D: {
            angle: (angle * 180) / Math.PI,
            velocity: (100 + Math.random() * 250) * speed,
            gravity: 500 * gravity
          },
          duration: 1 + Math.random()
        },
        0
      ).to(
        dot,
        {
          opacity: 0,
          duration: 0.2,
          ease: "power2.inOut"
        },
        0.7
      );
    }
  }

  // Check if ball is in goal zone (middle 20vw of screen)
  function isInGoalZone(ballElement) {
    const ballBounds = ballElement.getBoundingClientRect();
    const ballCenterX = ballBounds.left + ballBounds.width / 2;
    const ballCenterY = ballBounds.top + ballBounds.height / 2;
    
    const viewportWidth = window.innerWidth;
    const goalLeft = viewportWidth * 0.4; // 40% from left (10vw margin on each side of 20vw zone)
    const goalRight = viewportWidth * 0.6; // 60% from left
    const goalBottom = 150; // Goal is at top of screen, check if ball is near top
    
    return ballCenterX >= goalLeft && ballCenterX <= goalRight && ballCenterY <= goalBottom;
  }
  
  Draggable.create(".soccer__ball", {
    bounds: ".athlete",
    inertia: true,
    onDragStart: () => {
      gsap.to(soccerGoal, {
        yPercent: 100,
        duration: 0.3,
        ease: "power2.out"
      });
    },
    onDragEnd: function() {
      // Check if ball is in goal zone
      if (isInGoalZone(this.target)) {
        const ballBounds = this.target.getBoundingClientRect();
        explode(ballBounds.left + ballBounds.width / 2, ballBounds.top + ballBounds.height / 2);
      }
      
      gsap.to(soccerGoal, {
        yPercent: 0,
        duration: 0.3,
        ease: "power2.in"
      });
    }
  });
};

// Flip card animation for war/army images
const initFlipCards = () => {
  gsap.utils.toArray(".flip-card").forEach((card) => {
    // Set up 3D transform style
    gsap.set(card, {
      transformStyle: "preserve-3d",
      transformPerspective: 1000
    });

    const front = card.querySelector(".flip-card__front");
    const back = card.querySelector(".flip-card__back");

    // Set initial state - back is rotated 180 degrees
    gsap.set(back, { rotationY: -180 });

    // Create the flip timeline (paused)
    const tl = gsap.timeline({ paused: true })
      .to(front, { duration: 0.6, rotationY: 180, ease: "power2.inOut" })
      .to(back, { duration: 0.6, rotationY: 0, ease: "power2.inOut" }, 0)
      .to(card, { z: 50, duration: 0.3, ease: "power2.out" }, 0)
      .to(card, { z: 0, duration: 0.3, ease: "power2.in" }, 0.3);

    // Track flipped state
    let isFlipped = false;

    // Toggle flip on click
    card.addEventListener("click", () => {
      if (isFlipped) {
        tl.reverse();
      } else {
        tl.play();
      }
      isFlipped = !isFlipped;
    });
  });
};

init();
initPuzzleOverlay();
initFlipCards();

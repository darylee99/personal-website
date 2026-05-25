const slides = [
  { path: "作品素材/1.png", focus: "center" },
  { path: "作品素材/2.png", focus: "center" },
  { path: "作品素材/3.png", focus: "center" },
  { path: "作品素材/4.png", focus: "center" },
];

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const slideNodes = Array.from(document.querySelectorAll(".hero-slide"));
const heroMedia = document.querySelector(".hero-media");
const root = document.documentElement;
const hero = document.querySelector(".hero");
const body = document.body;
const introDuration = 4300;

slideNodes.forEach((node, index) => {
  const slide = slides[index];
  if (!slide) return;

  node.style.backgroundImage = `url("${slide.path}")`;
  node.style.backgroundPosition = slide.focus;
});

const startSlideshow = () => {
  if (prefersReducedMotion || slideNodes.length <= 1) return;

  let activeIndex = 0;
  let isSwitching = false;

  const switchSlide = () => {
    if (isSwitching) return;

    isSwitching = true;
    heroMedia?.classList.add("is-switching");

    window.setTimeout(() => {
      slideNodes[activeIndex].classList.remove("is-active");
      activeIndex = (activeIndex + 1) % slideNodes.length;
      slideNodes[activeIndex].classList.add("is-active");
    }, 1080);

    window.setTimeout(() => {
      heroMedia?.classList.remove("is-switching");
      isSwitching = false;
    }, 2860);
  };

  window.setInterval(() => {
    switchSlide();
  }, 5000);
};

if (prefersReducedMotion) {
  body.classList.remove("is-intro-running");
  body.classList.add("is-intro-complete");
} else {
  window.setTimeout(() => {
    body.classList.remove("is-intro-running");
    body.classList.add("is-intro-complete");
    startSlideshow();
  }, introDuration);
}

if (!prefersReducedMotion && hero) {
  let ticking = false;

  const updateHeroDrift = () => {
    const heroHeight = hero.offsetHeight || window.innerHeight;
    const maxScroll = Math.max(heroHeight, 1);
    const progress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    const maxDrift = Math.min(window.innerWidth * 0.18, 260);

    root.style.setProperty("--hero-drift", `${progress * maxDrift}px`);
    ticking = false;
  };

  const requestHeroDrift = () => {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(updateHeroDrift);
  };

  updateHeroDrift();
  window.addEventListener("scroll", requestHeroDrift, { passive: true });
  window.addEventListener("resize", requestHeroDrift);
}

const contactLink = document.querySelector(".contact-link");
const contactText = document.querySelector(".contact-text");

if (contactLink && contactText) {
  const email = contactText.textContent.trim();
  let toastTimer;

  contactText.textContent = "";
  contactText.setAttribute("aria-hidden", "true");

  const contactChars = Array.from(email).map((char) => {
    const node = document.createElement("span");
    node.className = "contact-char";
    node.textContent = char;
    contactText.appendChild(node);
    return node;
  });

  const resetContactChars = () => {
    contactChars.forEach((char) => {
      char.style.setProperty("--char-scale", "1");
      char.style.setProperty("--char-y", "0px");
    });
  };

  if (!prefersReducedMotion) {
    contactLink.addEventListener("pointermove", (event) => {
      const radius = Math.min(Math.max(window.innerWidth * 0.055, 42), 76);

      contactChars.forEach((char) => {
        const rect = char.getBoundingClientRect();
        const center = rect.left + rect.width / 2;
        const distance = Math.abs(event.clientX - center);
        const influence = Math.max(0, 1 - distance / radius);
        const eased = influence * influence * (3 - 2 * influence);
        const scale = 1 + eased * 0.46;
        const lift = -eased * 8;

        char.style.setProperty("--char-scale", scale.toFixed(3));
        char.style.setProperty("--char-y", `${lift.toFixed(2)}px`);
      });
    });

    contactLink.addEventListener("pointerleave", resetContactChars);
    contactLink.addEventListener("blur", resetContactChars);
  }

  const fallbackCopyEmail = () => {
    const textarea = document.createElement("textarea");
    textarea.value = email;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  };

  const showCopyToast = () => {
    window.clearTimeout(toastTimer);
    contactLink.classList.add("is-copied");
    toastTimer = window.setTimeout(() => {
      contactLink.classList.remove("is-copied");
    }, 1400);
  };

  contactLink.addEventListener("click", async (event) => {
    event.preventDefault();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        fallbackCopyEmail();
      }

      showCopyToast();
    } catch {
      fallbackCopyEmail();
      showCopyToast();
    }
  });
}

(() => {
  document.documentElement.classList.add("js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Year
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Nav: border on scroll + mobile menu
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const menu = document.getElementById("nav-menu");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    menu.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // Reveal on scroll
  const items = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const siblings = [...e.target.parentElement.children].filter((c) => c.classList.contains("reveal"));
          e.target.style.transitionDelay = `${Math.min(siblings.indexOf(e.target), 5) * 70}ms`;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach((el) => io.observe(el));
  }

  // Copy email
  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        const label = btn.textContent;
        btn.textContent = "Copied ✓";
        setTimeout(() => (btn.textContent = label), 1800);
      } catch {
        window.location.href = `mailto:${btn.dataset.copy}`;
      }
    });
  });

  // Hero field: a grid of "sites" that light up, like inventory going live.
  const canvas = document.querySelector(".hero__field");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const GAP = 34;
  let w, h, dpr, cols, rows, nodes, raf;
  const mouse = { x: -9999, y: -9999 };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cols = Math.ceil(w / GAP) + 1;
    rows = Math.ceil(h / GAP) + 1;
    nodes = [];
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++)
        nodes.push({ x: x * GAP + (y % 2 ? GAP / 2 : 0), y: y * GAP, glow: 0, life: 0 });
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    // ignite a few random nodes
    for (let i = 0; i < 2; i++) {
      if (Math.random() < 0.35) {
        const n = nodes[(Math.random() * nodes.length) | 0];
        if (n.life <= 0) n.life = 1;
      }
    }
    for (const n of nodes) {
      const dx = n.x - mouse.x, dy = n.y - mouse.y;
      const near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 160);
      if (n.life > 0) n.life -= 0.008;
      const pulse = n.life > 0 ? Math.sin(n.life * Math.PI) : 0;
      const g = Math.max(pulse, near * 0.9);
      if (g > 0.02) {
        ctx.fillStyle = `rgba(16, 192, 112, ${0.15 + g * 0.75})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.4 + g * 2.6, 0, Math.PI * 2);
        ctx.fill();
        if (pulse > 0.2) {
          ctx.strokeStyle = `rgba(16, 192, 112, ${pulse * 0.25})`;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 4 + (1 - n.life) * 14, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = "rgba(11, 61, 44, 0.13)";
        ctx.fillRect(n.x - 0.9, n.y - 0.9, 1.8, 1.8);
      }
    }
    raf = requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener("resize", resize);
  canvas.parentElement.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });

  if (reduceMotion) {
    draw();
    cancelAnimationFrame(raf);
    return;
  }
  // Pause when the hero is off-screen
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!raf) draw(); }
    else { cancelAnimationFrame(raf); raf = null; }
  }).observe(canvas);
})();

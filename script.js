const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const navLinks = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section[id]");

const activateNav = (id) => {
  navLinks.forEach((link) => {
    const target = link.getAttribute("href") || "";
    link.classList.toggle("active", target === `#${id}`);
  });
};

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activateNav(entry.target.id);
      }
    });
  },
  {
    threshold: 0.5,
    rootMargin: "-20% 0px -20% 0px",
  }
);

sections.forEach((section) => sectionObserver.observe(section));

const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const shapeOne = document.querySelector(".bg-shape-one");
const shapeTwo = document.querySelector(".bg-shape-two");

window.addEventListener("pointermove", (event) => {
  if (!shapeOne || !shapeTwo) {
    return;
  }

  const x = (event.clientX / window.innerWidth - 0.5) * 12;
  const y = (event.clientY / window.innerHeight - 0.5) * 12;

  shapeOne.style.transform = `translate(${x}px, ${y}px)`;
  shapeTwo.style.transform = `translate(${-x}px, ${-y}px)`;
});

// --- Simple chatbot behavior (client-side, canned replies) ---
document.addEventListener("DOMContentLoaded", () => {
  // Theme toggle: initialize from localStorage or system preference
  const themeToggleBtn = document.getElementById("themeToggle");
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('theme');
  const applyTheme = (theme) => {
    if (theme === 'light') {
      document.body.classList.add('light');
      if (themeToggleBtn) themeToggleBtn.textContent = '🌞';
    } else {
      document.body.classList.remove('light');
      if (themeToggleBtn) themeToggleBtn.textContent = '🌙';
    }
  };
  const initial = saved || (prefersDark ? 'dark' : 'light');
  applyTheme(initial);
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light');
      const newTheme = isLight ? 'light' : 'dark';
      localStorage.setItem('theme', newTheme);
      applyTheme(newTheme);
    });
  }
  const chatToggle = document.getElementById("chatToggle");
  const chatPanel = document.getElementById("chatPanel");
  const chatClose = document.getElementById("chatClose");
  const chatForm = document.getElementById("chatForm");
  const chatInput = document.getElementById("chatInput");
  const chatMessages = document.getElementById("chatMessages");

  if (!chatToggle || !chatPanel || !chatForm || !chatInput || !chatMessages) return;

  const setOpen = (open) => {
    chatPanel.style.display = open ? "flex" : "none";
    chatToggle.setAttribute("aria-expanded", String(open));
    chatPanel.setAttribute("aria-hidden", String(!open));
    if (open) chatInput.focus();
  };

  setOpen(false);

  chatToggle.addEventListener("click", () => setOpen(chatPanel.style.display !== "flex"));
  chatClose.addEventListener("click", () => setOpen(false));

  const appendMessage = (text, who = "bot") => {
    const el = document.createElement("div");
    el.className = `chat-bubble ${who}`;
    el.textContent = text;
    chatMessages.appendChild(el);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  // Audio: play short notification using Web Audio API
  let audioCtx = null;
  const ensureAudio = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  };

  const playReplySound = () => {
    try {
      const ctx = ensureAudio();
      const now = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(950, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.12, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.17);
    } catch (err) {
      // ignore audio errors
    }
  };

  const cannedReply = (msg) => {
    const lower = msg.toLowerCase();
    if (lower.includes("resume") || lower.includes("cv")) {
      return "You can download my resume from the Resume section, or click the Download Resume button.";
    }
    if (lower.includes("job") || lower.includes("role") || lower.includes("hiring") || lower.includes("opportunity")) {
      return "I'm actively seeking full-time backend roles. I'm available for interviews and can provide references on request.";
    }
    if (lower.includes("tech") || lower.includes("stack") || lower.includes("spring") || lower.includes("java")) {
      return "I primarily work with Java, Spring Boot, MongoDB, and dynatrace monitoring.";
    }
    if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
      return "Hi — how can I help? Ask about my experience, projects, or resume.";
    }
    return "Thanks for the message — I typically respond to inquiries about roles, my resume, or my projects. Try asking about resume, role, or tech stack.";
  };

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const value = chatInput.value.trim();
    if (!value) return;
    appendMessage(value, "user");
    chatInput.value = "";
    // ensure audio context is resumed on user interaction
    try { ensureAudio().resume(); } catch (e) {}
    setTimeout(() => {
      appendMessage(cannedReply(value), "bot");
      playReplySound();
    }, 600);
  });

  // keyboard: Esc closes
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  // starter message
  appendMessage("Hi — I'm a quick helper. Ask about jobs, resume, or tech stack.", "bot");
});

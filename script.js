const safeCreateIcons = () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }
};

const revealElements = document.querySelectorAll(".reveal");
const countElements = document.querySelectorAll(".count-up");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealElements.forEach((element) => revealObserver.observe(element));

const animateCount = (element) => {
  const targetValue = Number(element.dataset.target || 0);
  const suffix = element.textContent.includes("+") || element.textContent.includes("hr") ? "" : "";
  const isDecimal = Number.isInteger(targetValue) ? false : true;
  const duration = 1200;
  const startTime = performance.now();

  const step = (currentTime) => {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = isDecimal ? (targetValue * eased).toFixed(1) : Math.round(targetValue * eased);
    const displayValue = targetValue >= 24 ? `${currentValue} hr` : `${currentValue}${targetValue >= 10 && targetValue < 100 ? "+" : targetValue === 500 ? "+" : ""}`;
    element.textContent = displayValue;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = targetValue >= 24 ? `${targetValue} hr` : `${targetValue}${targetValue >= 10 && targetValue < 100 ? "+" : targetValue === 500 ? "+" : ""}`;
    }
  };

  requestAnimationFrame(step);
};

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

countElements.forEach((element) => countObserver.observe(element));

const splashScreen = document.querySelector("#splashScreen");
const pageContent = document.querySelector("#pageContent");

const revealPage = () => {
  document.body.classList.remove("loading");
  document.body.classList.remove("no-scroll");
  splashScreen?.classList.add("hidden");
  pageContent?.classList.add("ready");
};

safeCreateIcons();
document.body.classList.add("no-scroll");
const splashDelay = 1600;
document.addEventListener("DOMContentLoaded", () => {
  window.setTimeout(revealPage, splashDelay);
});
window.addEventListener("load", () => {
  window.setTimeout(revealPage, splashDelay);
});
window.setTimeout(revealPage, 2200);

const toast = document.querySelector("#toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3200);
}

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");

menuToggle.addEventListener("click", () => {
  mainNav.classList.toggle("open");
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => mainNav.classList.remove("open"));
});

let activeDeal = "All";
document.querySelectorAll(".deal-tabs button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".deal-tabs button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    activeDeal = button.dataset.deal || "All";
  });
});

const propertySearch = document.querySelector("#propertySearch");
const propertyCards = [...document.querySelectorAll(".property-card")];

if (propertySearch) {
  propertySearch.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(propertySearch);
    const location = formData.get("location");
    const type = formData.get("type");
    let visibleCount = 0;

    propertyCards.forEach((card) => {
      const locationMatch = !location || card.dataset.location === location;
      const typeMatch = !type || card.dataset.type === type;
      const dealText = card.dataset.deal.toLowerCase();
      const dealMatch = activeDeal === "All" || dealText.includes(activeDeal.toLowerCase()) || (activeDeal === "Sale" && (dealText.includes("sale") || dealText.includes("buy")));
      const isVisible = locationMatch && typeMatch && dealMatch;

      if (isVisible) {
        card.style.display = "";
        requestAnimationFrame(() => card.classList.remove("is-hidden"));
        visibleCount += 1;
      } else {
        card.classList.add("is-hidden");
        window.setTimeout(() => {
          if (card.classList.contains("is-hidden")) {
            card.style.display = "none";
          }
        }, 220);
      }
    });

    showToast(visibleCount ? `${visibleCount} matching properties found.` : "No exact match shown. Send enquiry for private inventory.");
  });
}

document.querySelectorAll(".favorite").forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.toggle("active");
    showToast(button.classList.contains("active") ? "Added to favorite properties." : "Removed from favorites.");
  });
});

const compareBar = document.querySelector("#compareBar");
const compareCount = document.querySelector("#compareCount");
const compareChecks = document.querySelectorAll(".compare-check");

function updateCompareBar() {
  const count = [...compareChecks].filter((check) => check.checked).length;
  compareCount.textContent = count;
  compareBar.classList.toggle("visible", count > 0);
}

compareChecks.forEach((check) => check.addEventListener("change", updateCompareBar));

document.querySelector("#compareButton").addEventListener("click", () => {
  const selected = [...compareChecks]
    .filter((check) => check.checked)
    .map((check) => check.closest(".property-card").querySelector("h3").textContent);

  showToast(selected.length > 1 ? `Comparing: ${selected.join(", ")}.` : "Select at least two properties to compare.");
});

const propertyModal = document.querySelector("#propertyModal");
const modalTitle = document.querySelector("#modalTitle");
const modalImage = document.querySelector("#modalImage");
const imageByTitle = {
  "Grade A Managed Office Floor": "assets/hitec.jpg",
  "Standalone Corporate Building": "assets/financial.jpg",
  "High Street Retail Frontage": "assets/madhapur.jpg",
  "Enterprise Coworking Campus": "assets/gachibowli.jpg",
};

document.querySelectorAll(".open-detail").forEach((button) => {
  button.addEventListener("click", () => {
    modalTitle.textContent = button.dataset.property;
    modalImage.src = imageByTitle[button.dataset.property] || modalImage.src;
    propertyModal.showModal();
    calculateEmi();
  });
});

document.querySelectorAll(".modal-close").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog").close());
});

document.querySelector("#brochureButton").addEventListener("click", () => {
  showToast("Brochure request captured. Add a PDF file later to enable direct download.");
});

document.querySelector("#tourButton").addEventListener("click", () => {
  showToast("Virtual tour placeholder ready. Add a video or 360 tour link when available.");
});

const visitModal = document.querySelector("#visitModal");
document.querySelectorAll("[data-open-visit]").forEach((button) => {
  button.addEventListener("click", () => {
    if (propertyModal.open) propertyModal.close();
    visitModal.showModal();
  });
});

document.querySelector("#visitForm").addEventListener("submit", (event) => {
  event.preventDefault();
  visitModal.close();
  showToast("Site visit request received. The team can follow up with availability.");
});

document.querySelector("#leadForm").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.reset();
  showToast("Enquiry received. Contact details can be connected to email, CRM or WhatsApp next.");
});

const loanAmount = document.querySelector("#loanAmount");
const interestRate = document.querySelector("#interestRate");
const loanYears = document.querySelector("#loanYears");
const emiResult = document.querySelector("#emiResult");

function calculateEmi() {
  const principal = Number(loanAmount.value || 0);
  const annualRate = Number(interestRate.value || 0);
  const years = Number(loanYears.value || 1);
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  const emi = monthlyRate
    ? (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    : principal / months;
  emiResult.textContent = `Estimated EMI: Rs. ${Math.round(emi).toLocaleString("en-IN")} / month`;
}

[loanAmount, interestRate, loanYears].forEach((input) => input.addEventListener("input", calculateEmi));

const chatWidget = document.querySelector(".chat-widget");
document.querySelector(".chat-launcher").addEventListener("click", () => {
  chatWidget.classList.toggle("open");
});

document.querySelector(".chat-close").addEventListener("click", () => {
  chatWidget.classList.remove("open");
});

document.querySelectorAll(".quick-prompts button").forEach((button) => {
  button.addEventListener("click", () => {
    const messages = document.querySelector("#chatMessages");
    const userMessage = document.createElement("p");
    userMessage.className = "user-message";
    userMessage.textContent = button.textContent;
    messages.appendChild(userMessage);

    const reply = document.createElement("p");
    reply.className = "assistant-message";
    reply.textContent = "Please share area, budget and preferred visit time. The team can shortlist matching options for rent, lease or sale.";
    messages.appendChild(reply);
    messages.scrollTop = messages.scrollHeight;
  });
});

document.querySelector("#chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.querySelector("#chatInput");
  const value = input.value.trim();
  if (!value) return;

  const messages = document.querySelector("#chatMessages");
  const userMessage = document.createElement("p");
  userMessage.className = "user-message";
  userMessage.textContent = value;
  messages.appendChild(userMessage);

  const reply = document.createElement("p");
  reply.className = "assistant-message";
  reply.textContent = "Thanks. Please add your phone number in the enquiry form so the team can confirm available spaces and schedule a visit.";
  messages.appendChild(reply);

  input.value = "";
  messages.scrollTop = messages.scrollHeight;
});

const testimonialSlides = [...document.querySelectorAll(".testimonial-slide")];
const testimonialDots = [...document.querySelectorAll(".slider-dot")];
const sliderButtons = [...document.querySelectorAll(".slider-btn")];
let testimonialIndex = 0;

function showTestimonial(index) {
  testimonialSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("active", slideIndex === index);
  });
  testimonialDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === index);
  });
  testimonialIndex = index;
}

if (testimonialSlides.length) {
  sliderButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const direction = button.textContent.includes("←") ? -1 : 1;
      const nextIndex = (testimonialIndex + direction + testimonialSlides.length) % testimonialSlides.length;
      showTestimonial(nextIndex);
    });
  });

  testimonialDots.forEach((dot, index) => {
    dot.addEventListener("click", () => showTestimonial(index));
  });

  window.setInterval(() => {
    const nextIndex = (testimonialIndex + 1) % testimonialSlides.length;
    showTestimonial(nextIndex);
  }, 6000);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    chatWidget.classList.remove("open");
  }
});

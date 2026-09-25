
// ----NAVBAR javascript--- (open)

// ---- hamburger javascript ----
(function () {
  const hamburger = document.querySelector("#hamburger");
  const menu = document.querySelector("#menu");
  if (!hamburger || !menu) return; // not on this page, skip quietly

  hamburger.addEventListener("click", function () {
    const isOpen = menu.classList.toggle("open");
    hamburger.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", isOpen);
  });

  // close the menu when a nav link is tapped
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      menu.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    });
  });

  // close the menu if someone taps outside it while it's open
  document.addEventListener("click", function (event) {
    const clickedInsideNav = event.target.closest("#navbar");
    if (!clickedInsideNav && menu.classList.contains("open")) {
      menu.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });
})();

// ----NAVBAR javascript--- (open)



// ---- product javascript ----
(function () {
  const modalImage = document.querySelector("#modalProductImage");
  if (!modalImage) return; // this page has no product modal, skip quietly

  const modalName = document.querySelector("#modalProductName");
  const modalDescription = document.querySelector("#modalProductDescription");
  const modalPrice = document.querySelector("#modalProductPrice");
  const quantity = document.querySelector("#quantity");
  const cards = document.querySelectorAll(".clickable-card");

  cards.forEach(function (card) {
    card.addEventListener("click", function () {
      const image = card.querySelector("img");
      const name = card.querySelector(".product-name");
      const description = card.querySelector(".product-desc");
      const price = card.querySelector(".product-price");

      modalImage.src = image.src;
      modalImage.alt = image.alt;
      modalName.textContent = name.textContent;
      modalDescription.textContent = description.textContent;
      modalPrice.textContent = price.textContent;
      quantity.textContent = 1;

      new bootstrap.Modal(document.querySelector("#productModal")).show();
    });

    const addButton = card.querySelector(".add-btn");
    if (!addButton) return; // this card has no add button, skip it
    addButton.addEventListener("click", function (event) {
      event.stopPropagation();
      addToCart(card.querySelector(".product-name").textContent,
                card.querySelector(".product-price").textContent, 1);
    });
  });

  const minusBtn = document.querySelector("#minusBtn");
  const plusBtn = document.querySelector("#plusBtn");
  plusBtn.addEventListener("click", function () {
    quantity.textContent = Number(quantity.textContent) + 1;
  });
  minusBtn.addEventListener("click", function () {
    let q = Number(quantity.textContent);
    if (q > 1) quantity.textContent = q - 1;
  });

  document.querySelector("#modalAddToCart").addEventListener("click", function () {
    addToCart(modalName.textContent, modalPrice.textContent, Number(quantity.textContent));
  });
})();

function addToCart(name, price, quantity) {
  alert(name + " added to cart");
}

// ---- widget javascript ----
(function () {
  const clockEl = document.getElementById("clock");
  if (!clockEl) return; // this page has no clock element, skip quietly

  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    clockEl.textContent = hours + ":" + minutes + ":" + seconds + " " + ampm;
  }

  updateClock();
  setInterval(updateClock, 1000);
})();



// ----CHAT BOT javascrip----(open)

// ---- chatbot javascript ----
(function () {
  const toggleBtn = document.querySelector("#chat-toggle");
  const closeBtn = document.querySelector("#chat-close");
  const chatWindow = document.querySelector("#chat-window");
  const chatMessages = document.querySelector("#chat-messages");
  const chatForm = document.querySelector("#chat-form");
  const chatInput = chatForm ? chatForm.querySelector("input") : null;
  const chips = document.querySelectorAll(".chip");

  if (!toggleBtn || !chatWindow) return; // widget not on this page, bail quietly

  toggleBtn.addEventListener("click", () => chatWindow.classList.toggle("hidden"));
  if (closeBtn) closeBtn.addEventListener("click", () => chatWindow.classList.add("hidden"));

  // ---- rule-based knowledge base: keyword arrays -> response ----
  const rules = [
    { keywords: ["hello", "hi", "hey", "salam", "assalam"], response: "Hi! Ask me about market timings, produce, prices, vendors or delivery." },
    { keywords: ["open", "timing", "hours", "time"], response: "Most FreshFind markets run 7 AM–7 PM daily — check the green badge on each market card for today's live status." },
    { keywords: ["tomato"], response: "Tomatoes are currently listed at 3 nearby markets — check the Vegetables section for live stock." },
    { keywords: ["vegetable", "veggies", "veg"], response: "Fresh vegetables are listed under the Vegetables section, updated daily by our partner farms." },
    { keywords: ["fruit"], response: "Seasonal fruit picks are in the Fruits section, sourced straight from local orchards." },
    { keywords: ["price", "cost", "rate", "expensive", "cheap"], response: "Prices are set directly by the vendor and shown on each product card — no hidden markup." },
    { keywords: ["deliver", "delivery", "shipping"], response: "Right now we support pickup at listed markets. Home delivery is rolling out soon in select areas." },
    { keywords: ["organic"], response: "Look for the 'Organic' badge on a product card — those are certified pesticide-free." },
    { keywords: ["location", "market", "near", "address", "where"], response: "Use the market map on the homepage to find the FreshFind market closest to you." },
    { keywords: ["vendor", "farmer", "seller"], response: "Every vendor is a verified local farmer — tap a product card to see their profile." },
    { keywords: ["contact", "support", "help", "phone", "email"], response: "You can reach our support team through the Contact page linked in the footer." },
    { keywords: ["thanks", "thank you", "shukriya"], response: "You're welcome! Happy to help you find fresh produce." },
    { keywords: ["techwiz", "competition", "muqabla"], response: "Good Techwiz competition race is on fire lately ." },
    { keywords: ["4minds project"], response: "The project of 4minds team is looking solid and unique also." },
    { keywords: ["4minds",], response: "bhai ye team to apne kaam se dosro ko peeche chorde gi." }
  ];
  const fallback = "I'm not sure about that one yet — try asking about market timings, produce, prices, vendors or delivery.";

  function getBotResponse(text) {
    const msg = text.toLowerCase();
    const hit = rules.find(rule => rule.keywords.some(k => msg.includes(k)));
    return hit ? hit.response : fallback;
  }

  function addMessage(text, sender) {
    const bubble = document.createElement("div");
    bubble.className = "message " + (sender === "user" ? "user-message" : "bot-message");
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function askQuestion(text) {
    if (!text || !text.trim()) return;
    addMessage(text, "user");
    setTimeout(() => addMessage(getBotResponse(text), "bot"), 400); // slight delay = feels like it's "thinking"
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      askQuestion(chatInput.value);
      chatInput.value = "";
    });
  }

  chips.forEach(chip => {
    chip.addEventListener("click", () => askQuestion(chip.dataset.question || chip.textContent));
  });
})();

// ----CHAT BOT javascrip----(closed)
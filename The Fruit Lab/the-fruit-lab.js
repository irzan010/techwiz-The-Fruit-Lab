



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

// ----NAVBAR javascript--- (closed)



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

// ---- market data (source of truth for detail modal + bookmarks) ----
const MARKETS = [
  {
    id: "green-sabzi-mandi",
    name: "Green Sabzi Mandi",
    address: "Purani Sabzi Mandi, Karachi",
    description: "Vibrant market featuring organic veggies, berries, fresh bread, and local dairy. Retail and Wholesale.",
    schedule: "Mon, Wed, Sat (8:00 AM – 2:00 PM)",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&auto=format&fit=crop&q=60",
    produce: ["Tomatoes", "Spinach", "Berries", "Fresh Bread", "Dairy"]
  },
  {
    id: "sunrise-market",
    name: "Sunrise Market",
    address: "Kifaya Mart Clifton, Karachi",
    description: "Community-focused store offering citrus fruits, fresh herbs, and farm eggs.",
    schedule: "Tue, Thu, Sun (9:00 AM – 3:00 PM)",
    image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=600&auto=format&fit=crop&q=60",
    produce: ["Oranges", "Lemons", "Fresh Herbs", "Farm Eggs"]
  },
  {
    id: "organic-plaza",
    name: "Organic Plaza",
    address: "Organic Plaza Saddar, Karachi",
    description: "Corporate office-side market with organic produce, cheeses, jams, and plants.",
    schedule: "Fri, Sat, Sun (10:00 AM – 6:00 PM)",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=60",
    produce: ["Organic Veggies", "Cheese", "Jams", "Potted Plants"]
  }
];

// ==========================================================
// BOOKMARKING SYSTEM
// ==========================================================
(function () {
  const STORAGE_KEY = "freshfind_bookmarks";
  const NOTES_KEY = "freshfind_notes";

  function loadBookmarks() {
    try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveBookmarks(data) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  function loadNotes() {
    try { return JSON.parse(sessionStorage.getItem(NOTES_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveNotes(data) {
    sessionStorage.setItem(NOTES_KEY, JSON.stringify(data));
  }

  function isBookmarked(marketId) {
    return !!loadBookmarks()[marketId];
  }

  function toggleBookmark(marketId) {
    const bookmarks = loadBookmarks();
    if (bookmarks[marketId]) {
      delete bookmarks[marketId];
      const notes = loadNotes();
      delete notes[marketId];
      saveNotes(notes);
    } else {
      bookmarks[marketId] = true;
    }
    saveBookmarks(bookmarks);
    renderBookmarks();
    syncStarButtons();
    document.dispatchEvent(new CustomEvent("bookmarks:changed"));
  }

  function syncStarButtons() {
    const bookmarks = loadBookmarks();
    document.querySelectorAll(".btn-bookmark[data-market-id]").forEach(function (btn) {
      const saved = !!bookmarks[btn.dataset.marketId];
      btn.classList.toggle("saved", saved);
      btn.setAttribute("aria-pressed", saved);
    });
  }

  function renderBookmarks() {
    const grid = document.querySelector(".bookmarks-grid");
    if (!grid) return;

    const bookmarks = loadBookmarks();
    const notes = loadNotes();
    const savedIds = Object.keys(bookmarks);

    if (savedIds.length === 0) {
      grid.innerHTML = '<p class="text-muted">No markets bookmarked yet — tap the ★ on any market card to save it here.</p>';
      return;
    }

    grid.innerHTML = "";
    savedIds.forEach(function (id) {
      const market = MARKETS.find(function (m) { return m.id === id; });
      if (!market) return;

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML =
        '<div class="card-header">' +
          '<h3>' + market.name + '</h3>' +
          '<button class="btn-delete" data-market-id="' + market.id + '" title="Remove bookmark">🗑</button>' +
        '</div>' +
        '<p class="address">' + market.address + '</p>' +
        '<div class="note-box">' +
          '<label for="note-' + market.id + '">Personal Session Note:</label>' +
          '<textarea id="note-' + market.id + '" data-market-id="' + market.id + '" rows="2" ' +
            'placeholder="e.g. Remember to buy fresh sourdough at Stall #4...">' + (notes[market.id] || "") + '</textarea>' +
        '</div>' +
        '<button class="btn-share mt-2" data-market-id="' + market.id + '">🔗 Share on WhatsApp</button>';
      grid.appendChild(card);
    });

    grid.querySelectorAll(".btn-delete").forEach(function (btn) {
      btn.addEventListener("click", function () { toggleBookmark(btn.dataset.marketId); });
    });

    grid.querySelectorAll(".note-box textarea").forEach(function (textarea) {
      textarea.addEventListener("input", function () {
        const n = loadNotes();
        n[textarea.dataset.marketId] = textarea.value;
        saveNotes(n);
      });
    });

    grid.querySelectorAll(".btn-share").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const market = MARKETS.find(function (m) { return m.id === btn.dataset.marketId; });
        if (!market) return;
        const text = encodeURIComponent("Check out " + market.name + " on FreshFind — " + market.address);
        window.open("https://api.whatsapp.com/send?text=" + text, "_blank");
      });
    });
  }

  document.querySelectorAll(".btn-bookmark[data-market-id]").forEach(function (btn) {
    btn.addEventListener("click", function () { toggleBookmark(btn.dataset.marketId); });
  });

  const exportBtn = document.querySelector("#exportBookmarks");
  if (exportBtn) {
    exportBtn.addEventListener("click", function () {
      const bookmarks = loadBookmarks();
      const notes = loadNotes();
      const ids = Object.keys(bookmarks);
      if (ids.length === 0) { alert("You have no bookmarked markets yet."); return; }

      let text = "My FreshFind Bookmarked Markets\n" + "=".repeat(32) + "\n\n";
      ids.forEach(function (id) {
        const market = MARKETS.find(function (m) { return m.id === id; });
        if (!market) return;
        text += market.name + "\n" + market.address + "\nSchedule: " + market.schedule + "\n";
        if (notes[id]) text += "Note: " + notes[id] + "\n";
        text += "\n";
      });

      const blob = new Blob([text], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "freshfind-bookmarks.txt";
      link.click();
    });
  }

  window.isBookmarked = isBookmarked;
  window.toggleBookmark = toggleBookmark;

  syncStarButtons();
  renderBookmarks();
})();

// ==========================================================
// MARKET DETAIL MODAL
// ==========================================================
(function () {
  const detailButtons = document.querySelectorAll(".btn-details[data-market-id]");
  const modalEl = document.querySelector("#marketDetailModal");
  if (!detailButtons.length || !modalEl) return;

  const modalName = modalEl.querySelector("#marketModalName");
  const modalImage = modalEl.querySelector("#marketModalImage");
  const modalDesc = modalEl.querySelector("#marketModalDescription");
  const modalSchedule = modalEl.querySelector("#marketModalSchedule");
  const modalAddress = modalEl.querySelector("#marketModalAddress");
  const modalMap = modalEl.querySelector("#marketModalMap");
  const modalProduce = modalEl.querySelector("#marketModalProduce");
  const modalBookmarkBtn = modalEl.querySelector("#marketModalBookmarkBtn");

  let currentMarketId = null;

  function updateModalBookmarkButton() {
    if (!currentMarketId) return;
    const saved = window.isBookmarked(currentMarketId);
    modalBookmarkBtn.textContent = saved ? "★ Remove Bookmark" : "★ Bookmark this Market";
    modalBookmarkBtn.classList.toggle("btn-success", saved);
    modalBookmarkBtn.classList.toggle("btn-outline-success", !saved);
  }

  detailButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const market = MARKETS.find(function (m) { return m.id === btn.dataset.marketId; });
      if (!market) return;
      currentMarketId = market.id;

      modalName.textContent = market.name;
      modalImage.src = market.image;
      modalImage.alt = market.name;
      modalDesc.textContent = market.description;
      modalSchedule.textContent = market.schedule;
      modalAddress.textContent = market.address;
      modalMap.src = "https://maps.google.com/maps?q=" + encodeURIComponent(market.address) + "&t=&z=14&ie=UTF8&iwloc=&output=embed";

      modalProduce.innerHTML = "";
      market.produce.forEach(function (item) {
        const tag = document.createElement("span");
        tag.className = "tag tag-veg";
        tag.textContent = item;
        modalProduce.appendChild(tag);
      });

      updateModalBookmarkButton();
      new bootstrap.Modal(modalEl).show();
    });
  });

  modalBookmarkBtn.addEventListener("click", function () {
    if (!currentMarketId) return;
    window.toggleBookmark(currentMarketId);
    updateModalBookmarkButton();
  });

  document.addEventListener("bookmarks:changed", updateModalBookmarkButton);
})();


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
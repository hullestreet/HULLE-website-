// 1. SUPABASE CONNECTION & ADMIN PASSWORD
const SUPABASE_URL = "https://supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7aEKsn2s8qNrYYwe-GMkXw_fFkjNSik";
const ADMIN_SECRET_PASSWORD = "Simgari@123.com"; // Product add karte waqt yeh password dalna hoga

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let products = [];
let activeFilter = "all";

function money(n) { return "₹" + Number(n).toLocaleString("en-IN"); }
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

// Supabase se live products load karna
async function loadProductsFromDB() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error loading products:", error);
    return;
  }
  products = data || [];
  renderProducts();
}

function renderProducts() {
  const list = products.filter(p => activeFilter === "all" || p.product_type === activeFilter);
  const container = document.getElementById("products");
  container.innerHTML = list.map(p => {
    const tag = p.product_type === "original" ? "HULLE ORIGINAL" : "AFFILIATE PICK";
    const image = p.image_url ? `<img src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.name)}" onerror="this.style.display='none'">` : `<div class="product-placeholder">H</div>`;
    const action = p.product_type === "original"
      ? `<a class="product-action" href="#creator" onclick="alert('Order karne ke liye neeche Creator/Contact form mein apni details bharein.')">Enquire / Buy</a>`
      : `<a class="product-action" href="${p.affiliate_url ? escapeHTML(p.affiliate_url) : '#'}" ${p.affiliate_url ? 'target="_blank" rel="noopener noreferrer"' : 'onclick="alert(\\'Affiliate link missing hai.\\');return false;"'}>View on partner site ↗</a>`;
    return `<article class="product-card"><div class="product-image">${image}<span class="tag">${tag}</span></div><div class="product-info"><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description || p.category || "")}</p><div class="price-row"><span class="price">${money(p.price)}</span>${action}</div></div></article>`;
  }).join("");
  document.getElementById("emptyState").classList.toggle("hidden", list.length !== 0);
}

// Filters
document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active"); activeFilter = btn.dataset.filter; renderProducts();
}));
const origBtn = document.querySelector("[data-original-filter]");
if (origBtn) {
  origBtn.addEventListener("click", () => {
    activeFilter = "original";
    document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b.dataset.filter === "original"));
    renderProducts();
  });
}

// Admin Modal
const modal = document.getElementById("adminModal");
document.getElementById("openAdmin").addEventListener("click", () => modal.classList.remove("hidden"));
document.getElementById("closeAdmin").addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", e => { if (e.target === modal) modal.classList.add("hidden"); });

const typeSelect = document.querySelector('#productForm [name="type"]');
const affiliateWrap = document.getElementById("affiliateLinkWrap");
typeSelect.addEventListener("change", () => affiliateWrap.classList.toggle("hidden", typeSelect.value !== "affiliate"));

// Naya product check karke Supabase mein save karna
document.getElementById("productForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const enteredPass = f.get("adminPass");
  const msgEl = document.getElementById("productMessage");

  // Password check
  if (enteredPass !== ADMIN_SECRET_PASSWORD) {
    msgEl.textContent = "Galat Admin Password! Product add nahi ho sakta.";
    msgEl.classList.remove("hidden");
    return;
  }

  const type = f.get("type");
  const link = f.get("link").trim();

  if (type === "affiliate" && !link) {
    msgEl.textContent = "Affiliate product ke liye tracking link dalna zaroori hai.";
    msgEl.classList.remove("hidden");
    return;
  }

  const newProduct = {
    product_type: type,
    name: f.get("name").trim(),
    price: Number(f.get("price")),
    category: f.get("category").trim(),
    image_url: f.get("image").trim(),
    affiliate_url: type === "affiliate" ? link : null,
    description: f.get("description").trim(),
    status: "approved"
  };

  const { error } = await supabaseClient.from("products").insert([newProduct]);

  if (error) {
    msgEl.textContent = "Database Error: " + error.message;
  } else {
    msgEl.textContent = "Badhai ho! Product live website par add ho gaya hai.";
    e.target.reset();
    affiliateWrap.classList.add("hidden");
    loadProductsFromDB();
  }
  msgEl.classList.remove("hidden");
});

// Creator Registration
document.getElementById("creatorForm").addEventListener("submit", e => {
  e.preventDefault();
  document.getElementById("creatorMessage").textContent = "Thanks! Aapki request submit ho gayi hai.";
  document.getElementById("creatorMessage").classList.remove("hidden");
  e.target.reset();
});

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

loadProductsFromDB();

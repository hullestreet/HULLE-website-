const SUPABASE_URL = "https://rlmohmhfibhrdlptegtp.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_7aEKsn2s8qNrYYwe-GMkXw_fFkjNSik";

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let products = [];
let activeFilter = "all";

function money(n){ return "₹" + Number(n).toLocaleString("en-IN"); }
function escapeHTML(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

// Supabase se live products fetch karein
async function fetchProducts() {
  const { data, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return;
  }
  products = data || [];
  renderProducts();
}

function renderProducts(){
  const list = products.filter(p => activeFilter === "all" || p.product_type === activeFilter);
  const container = document.getElementById("products");
  container.innerHTML = list.map(p => {
    const tag = p.product_type === "original" ? "HULLE ORIGINAL" : "AFFILIATE PICK";
    const image = p.image_url ? `<img src="${escapeHTML(p.image_url)}" alt="${escapeHTML(p.name)}" onerror="this.style.display='none'">` : `<div class="product-placeholder">H</div>`;
    const action = p.product_type === "original"
      ? `<a class="product-action" href="#creator" onclick="alert('Contact us on Instagram or WhatsApp to order!')">Enquire / Buy</a>`
      : `<a class="product-action" href="${p.affiliate_url ? escapeHTML(p.affiliate_url) : '#'}" target="_blank" rel="noopener noreferrer">View on partner site ↗</a>`;
    return `<article class="product-card"><div class="product-image">${image}<span class="tag">${tag}</span></div><div class="product-info"><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description || p.category || "")}</p><div class="price-row"><span class="price">${money(p.price)}</span>${action}</div></div></article>`;
  }).join("");
  document.getElementById("emptyState").classList.toggle("hidden", list.length !== 0);
}

// Filters
document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active"); activeFilter = btn.dataset.filter; renderProducts();
}));
const origFilterBtn = document.querySelector("[data-original-filter]");
if (origFilterBtn) {
  origFilterBtn.addEventListener("click", () => {
    activeFilter = "original";
    document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b.dataset.filter === "original"));
    renderProducts();
  });
}

// Admin Modal & Auth State Check
const modal = document.getElementById("adminModal");
const loginSection = document.getElementById("adminLoginSection");
const productSection = document.getElementById("adminProductSection");
const openAdminBtn = document.getElementById("openAdmin");

async function checkUserSession() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    if (loginSection) loginSection.classList.add("hidden");
    if (productSection) productSection.classList.remove("hidden");
    if (openAdminBtn) openAdminBtn.textContent = "Add Product +";
  } else {
    if (loginSection) loginSection.classList.remove("hidden");
    if (productSection) productSection.classList.add("hidden");
    if (openAdminBtn) openAdminBtn.textContent = "Admin Login";
  }
}

if (openAdminBtn) {
  openAdminBtn.addEventListener("click", () => {
    checkUserSession();
    if (modal) modal.classList.remove("hidden");
  });
}
const closeAdminBtn = document.getElementById("closeAdmin");
if (closeAdminBtn) {
  closeAdminBtn.addEventListener("click", () => modal.classList.add("hidden"));
}
if (modal) {
  modal.addEventListener("click", e => { if(e.target === modal) modal.classList.add("hidden"); });
}

// Admin Login Submit
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: f.get("email").trim(),
      password: f.get("password")
    });
    const errBox = document.getElementById("loginError");
    if (error) {
      errBox.textContent = error.message;
      errBox.classList.remove("hidden");
    } else {
      errBox.classList.add("hidden");
      checkUserSession();
    }
  });
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    checkUserSession();
  });
}

// Product Type Toggle
const typeSelect = document.querySelector('#productForm [name="type"]');
const affiliateWrap = document.getElementById("affiliateLinkWrap");
if (typeSelect && affiliateWrap) {
  typeSelect.addEventListener("change", () => affiliateWrap.classList.toggle("hidden", typeSelect.value !== "affiliate"));
}

// Add Product to Supabase
const productForm = document.getElementById("productForm");
if (productForm) {
  productForm.addEventListener("submit", async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const msgBox = document.getElementById("productMessage");
    
    const newProduct = {
      product_type: f.get("type"),
      name: f.get("name").trim(),
      price: Number(f.get("price")),
      category: f.get("category").trim(),
      image_url: f.get("image").trim() || null,
      affiliate_url: f.get("type") === "affiliate" ? f.get("link").trim() : null,
      description: f.get("description").trim(),
      status: "approved"
    };

    if (newProduct.product_type === "affiliate" && !newProduct.affiliate_url) {
      msgBox.textContent = "Please add an affiliate tracking link.";
      msgBox.classList.remove("hidden");
      return;
    }

    const { error } = await supabaseClient.from("products").insert([newProduct]);
    if (error) {
      msgBox.textContent = "Error: " + error.message;
      msgBox.classList.remove("hidden");
    } else {
      msgBox.textContent = "Product published live!";
      msgBox.classList.remove("hidden");
      e.target.reset();
      if (affiliateWrap) affiliateWrap.classList.add("hidden");
      fetchProducts();
    }
  });
}

// Creator Registration (Ab Supabase mein save hoga!)
const creatorForm = document.getElementById("creatorForm");
if (creatorForm) {
  creatorForm.addEventListener("submit", async e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const msgBox = document.getElementById("creatorMessage");

    const creatorData = {
      name: f.get("name").trim(),
      handle: f.get("handle").trim(),
      phone: f.get("phone").trim()
    };

    const { error } = await supabaseClient.from("creator_requests").insert([creatorData]);
    
    if (error) {
      msgBox.textContent = "Error: " + error.message;
      msgBox.style.background = "#ffe0e0";
      msgBox.style.color = "#900";
    } else {
      msgBox.textContent = "Thanks! Your creator request has been received & saved.";
      msgBox.style.background = "#e0ffe0";
      msgBox.style.color = "#090";
      e.target.reset();
    }
    msgBox.classList.remove("hidden");
  });
}

const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

checkUserSession();
fetchProducts();

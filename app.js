const STORAGE_KEY = "hulle_demo_products_v1";
const CREATOR_KEY = "hulle_demo_creators_v1";

const starterProducts = [
  {id:"hulle-001",type:"original",name:"HULLE Essential Oversized Tee",price:599,category:"HULLE Originals",description:"A clean everyday streetwear essential.",image:"",link:""},
  {id:"hulle-002",type:"original",name:"HULLE Everyday Hoodie",price:999,category:"HULLE Originals",description:"Your own label. Your everyday layer.",image:"",link:""},
  {id:"aff-001",type:"affiliate",name:"Everyday Fashion Find",price:499,category:"Fashion",description:"Example partner product — add an approved affiliate URL.",image:"",link:""},
  {id:"aff-002",type:"affiliate",name:"Home & Lifestyle Pick",price:799,category:"Home",description:"Example partner product — replace with a real listing.",image:"",link:""}
];

let products = loadProducts();
let activeFilter = "all";

function loadProducts(){
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterProducts;
  } catch(e) { return starterProducts; }
}
function saveProducts(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(products)); }
function money(n){ return "₹" + Number(n).toLocaleString("en-IN"); }
function escapeHTML(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function renderProducts(){
  const list = products.filter(p => activeFilter === "all" || p.type === activeFilter);
  const container = document.getElementById("products");
  container.innerHTML = list.map(p => {
    const tag = p.type === "original" ? "HULLE ORIGINAL" : "AFFILIATE PICK";
    const image = p.image ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" onerror="this.style.display='none'">` : `<div class="product-placeholder">H</div>`;
    const action = p.type === "original"
      ? `<a class="product-action" href="#creator" onclick="alert('Demo store: connect checkout and shipping before accepting real orders.')">Enquire / Buy</a>`
      : `<a class="product-action" href="${p.link ? escapeHTML(p.link) : '#'}" ${p.link ? 'target="_blank" rel="noopener noreferrer"' : 'onclick="alert(\\'Add a real approved affiliate tracking link first.\\');return false;"'}>View on partner site ↗</a>`;
    return `<article class="product-card"><div class="product-image">${image}<span class="tag">${tag}</span></div><div class="product-info"><h3>${escapeHTML(p.name)}</h3><p>${escapeHTML(p.description || p.category || "")}</p><div class="price-row"><span class="price">${money(p.price)}</span>${action}</div></div></article>`;
  }).join("");
  document.getElementById("emptyState").classList.toggle("hidden", list.length !== 0);
}
document.querySelectorAll(".filter").forEach(btn => btn.addEventListener("click", () => {
  document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
  btn.classList.add("active"); activeFilter = btn.dataset.filter; renderProducts();
}));
document.querySelector("[data-original-filter]").addEventListener("click", () => {
  activeFilter = "original";
  document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b.dataset.filter === "original"));
  renderProducts();
});

const modal = document.getElementById("adminModal");
document.getElementById("openAdmin").addEventListener("click", () => modal.classList.remove("hidden"));
document.getElementById("closeAdmin").addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", e => { if(e.target === modal) modal.classList.add("hidden"); });
const typeSelect = document.querySelector('#productForm [name="type"]');
const affiliateWrap = document.getElementById("affiliateLinkWrap");
typeSelect.addEventListener("change", () => affiliateWrap.classList.toggle("hidden", typeSelect.value !== "affiliate"));

document.getElementById("productForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const product = {
    id: "p-" + Date.now(),
    type: f.get("type"),
    name: f.get("name").trim(),
    price: Number(f.get("price")),
    category: f.get("category").trim(),
    image: f.get("image").trim(),
    link: f.get("link").trim(),
    description: f.get("description").trim()
  };
  if(product.type === "affiliate" && !product.link){
    document.getElementById("productMessage").textContent = "Add the approved affiliate tracking link before publishing this affiliate product.";
    document.getElementById("productMessage").classList.remove("hidden");
    return;
  }
  products.unshift(product); saveProducts(); renderProducts();
  document.getElementById("productMessage").textContent = "Product added in this browser's demo catalogue.";
  document.getElementById("productMessage").classList.remove("hidden");
  e.target.reset(); affiliateWrap.classList.add("hidden");
});

document.getElementById("creatorForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = new FormData(e.target);
  const creators = JSON.parse(localStorage.getItem(CREATOR_KEY) || "[]");
  creators.push({name:f.get("name"),handle:f.get("handle"),phone:f.get("phone"),createdAt:new Date().toISOString()});
  localStorage.setItem(CREATOR_KEY, JSON.stringify(creators));
  document.getElementById("creatorMessage").textContent = "Thanks! Demo registration saved on this device only.";
  document.getElementById("creatorMessage").classList.remove("hidden");
  e.target.reset();
});
document.getElementById("year").textContent = new Date().getFullYear();
renderProducts();

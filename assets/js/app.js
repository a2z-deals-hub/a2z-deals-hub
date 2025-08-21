// Mobile nav
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');
if (hamburger && mainNav) {
  hamburger.addEventListener('click', () => {
    const open = mainNav.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
  });
}

// Year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Affiliate notice
const notice = document.getElementById('affiliateNotice');
const dismiss = document.getElementById('dismissNotice');
if (notice && dismiss) {
  dismiss.addEventListener('click', () => notice.remove());
}

// Data & rendering
const productGrid = document.getElementById('productGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');
const dealOfDayEl = document.getElementById('dealOfDay');

let PRODUCTS = [];

async function loadProducts(){
  try{
    const res = await fetch('data/products.json', { cache: 'no-store' });
    PRODUCTS = await res.json();
    renderAll();
    renderDealOfDay();
  }catch(e){
    console.error('Failed to load products.json', e);
    if (emptyState) { emptyState.hidden = false; emptyState.textContent = 'Unable to load products.'; }
  }
}

function applyFilters(list){
  const term = (searchInput?.value || '').trim().toLowerCase();
  const cat = categorySelect?.value || 'all';

  let result = list.filter(p=>{
    const matchTerm = !term || [p.title,p.description,p.category].join(' ').toLowerCase().includes(term);
    const matchCat = cat==='all' || p.category===cat;
    return matchTerm && matchCat;
  });

  switch ((sortSelect?.value)||'featured'){
    case 'price-asc': result.sort((a,b)=>a.price-b.price); break;
    case 'price-desc': result.sort((a,b)=>b.price-a.price); break;
    case 'rating-desc': result.sort((a,b)=> (b.rating??0)-(a.rating??0) ); break;
    default: /* featured */ result.sort((a,b)=> (b.featured??0)-(a.featured??0) );
  }

  return result;
}

function money(n){ return '$' + Number(n).toFixed(2); }

function productCard(p){
  const badge = p.tag ? `<span class="tag" aria-label="Tag">${p.tag}</span>` : '';
  const rating = p.rating ? `⭐ ${p.rating.toFixed(1)}` : '';
  const old = p.oldPrice ? `<span class="old">${money(p.oldPrice)}</span>` : '';
  const imgAlt = p.title + ' product photo';

  return `
  <article class="product" aria-label="${p.title}">
    <div class="media"><img src="${p.image}" alt="${imgAlt}"></div>
    <div class="px">
      <div class="meta"><span class="badge">${p.categoryLabel || p.category}</span><span class="badge">${rating}</span></div>
      <h3 class="title">${p.title}</h3>
      <p class="desc">${p.description}</p>
      <div class="meta">
        <div class="price">${money(p.price)} ${old}</div>
        <div>${badge}</div>
      </div>
      <div class="actions">
        <a class="btn" href="${p.link}" target="_blank" rel="nofollow sponsored noopener" aria-label="Buy ${p.title} on Amazon">Buy Now</a>
      </div>
    </div>
  </article>`;
}

function renderAll(){
  if (!productGrid) return;
  const filtered = applyFilters(PRODUCTS);
  productGrid.innerHTML = filtered.map(productCard).join('');
  if (emptyState) emptyState.hidden = filtered.length !== 0;
}

function renderDealOfDay(){
  if (!dealOfDayEl || PRODUCTS.length===0) return;
  const candidate = PRODUCTS.find(p => p.dealOfDay) || PRODUCTS[0];
  if (!candidate) return;
  dealOfDayEl.innerHTML = `
    <div class="media"><img src="${candidate.image}" alt="${candidate.title} product photo"></div>
    <div>
      <span class="badge">Deal of the Day</span>
      <h3>${candidate.title}</h3>
      <p class="muted">${candidate.description}</p>
      <div class="dod-price">
        <div class="price">${money(candidate.price)}</div>
        ${candidate.oldPrice ? `<div class="old">${money(candidate.oldPrice)}</div>` : ''}
        ${candidate.tag ? `<span class="tag">${candidate.tag}</span>` : ''}
      </div>
      <div style="margin-top:.6rem">
        <a class="btn primary" href="${candidate.link}" target="_blank" rel="nofollow sponsored noopener">Grab Deal</a>
      </div>
    </div>
  `;
}

// Events
[searchInput, categorySelect, sortSelect].forEach(el=>{
  if (el) el.addEventListener('input', renderAll);
});

// Init only on pages that have grid
if (productGrid) loadProducts();

// Mobile nav toggle
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

// Theme toggle (dark/light)
const root = document.documentElement;
const toggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') root.classList.add('dark');
if (toggle) {
  toggle.addEventListener('click', () => {
    root.classList.toggle('dark');
    localStorage.setItem('theme', root.classList.contains('dark') ? 'dark' : 'light');
  });
}

// Blog list on homepage
const postGrid = document.getElementById('postGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');

let POSTS = [];

function renderPosts(list) {
  if (!postGrid) return;
  postGrid.innerHTML = list.map(p => `
    <article class="card post" aria-label="${p.title}">
      <a class="post-thumb" href="${p.url}">
        <img src="${p.image}" alt="${p.title}">
      </a>
      <div class="post-meta">
        <span>${new Date(p.date).toLocaleDateString()}</span>
        <span>•</span>
        <span>${p.readTime} min read</span>
      </div>
      <h3 class="post-title"><a href="${p.url}">${p.title}</a></h3>
      <p class="muted">${p.excerpt}</p>
      <a class="read-more" href="${p.url}">Read more →</a>
    </article>
  `).join('');
  if (emptyState) emptyState.hidden = list.length !== 0;
}

function applyPostFilters() {
  const term = (searchInput?.value || '').trim().toLowerCase();
  let result = POSTS.filter(p =>
    !term || [p.title, p.excerpt, (p.tags||[]).join(' ')].join(' ').toLowerCase().includes(term)
  );
  switch ((sortSelect?.value)||'date-desc') {
    case 'date-asc': result.sort((a,b)=> new Date(a.date)-new Date(b.date)); break;
    case 'title-asc': result.sort((a,b)=> a.title.localeCompare(b.title)); break;
    default: result.sort((a,b)=> new Date(b.date)-new Date(a.date));
  }
  renderPosts(result);
}

async function loadPosts() {
  if (!postGrid) return;
  try {
    const res = await fetch('data/posts.json', { cache: 'no-store' });
    POSTS = await res.json();
    applyPostFilters();
  } catch (e) {
    console.error('Failed to load posts.json', e);
    if (emptyState) { emptyState.hidden = false; emptyState.textContent = 'Unable to load posts.'; }
  }
}

[searchInput, sortSelect].forEach(el => el && el.addEventListener('input', applyPostFilters));
loadPosts();

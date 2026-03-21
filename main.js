/* состояние приложения */
const state = {
  quizStep: 1,
  totalSteps: 3,
  favorites: new Set(),
  activeFilter: 'all',
  searchQuery: '',
  sortOrder: 'popular',
};

const BUDGET_CONFIG = [
  { amount: 'Бесплатно',   label: 'Пешая прогулка',   trackPct: 0   },
  { amount: '100–300₽',    label: 'Трамвай / Автобус', trackPct: 33  },
  { amount: '500–1500₽',   label: 'Такси',             trackPct: 66  },
  { amount: 'По расходам', label: 'Личный автомобиль', trackPct: 100 },
];

/* мобильное меню */
function toggleMenu() {
  const nav = document.getElementById('nav');
  const hamburger = document.getElementById('hamburger');
  nav.classList.toggle('open');
  hamburger.classList.toggle('open');
}

/* тень шапки при прокрутке */
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (header) header.classList.toggle('scrolled', window.scrollY > 30);
});

/* закрытие меню при расширении окна */
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    const nav = document.getElementById('nav');
    const hamburger = document.getElementById('hamburger');
    if (nav) nav.classList.remove('open');
    if (hamburger) hamburger.classList.remove('open');
  }
});

/* слайдер бюджета */
function updateBudget(value) {
  const idx = parseInt(value, 10);
  const cfg = BUDGET_CONFIG[idx];

  const amountEl = document.getElementById('budget-amount');
  const labelEl  = document.getElementById('budget-label');
  if (amountEl) amountEl.textContent = cfg.amount;
  if (labelEl)  labelEl.textContent  = cfg.label;

  // заливка слайдера
  const slider = document.getElementById('budget-slider');
  if (slider) {
    const pct = (idx / (BUDGET_CONFIG.length - 1)) * 100;
    slider.style.background = `linear-gradient(90deg, var(--blue) ${pct}%, var(--gray-2) ${pct}%)`;
  }

  // активная карточка транспорта
  for (let i = 0; i < BUDGET_CONFIG.length; i++) {
    const card = document.getElementById('tc-' + i);
    if (card) card.classList.toggle('active', i === idx);
  }
}

/* анимация появления элементов при прокрутке */
function initScrollReveal() {
  const els = document.querySelectorAll('.feature-card, .route-card, .catalog-card, .timeline-item');
  els.forEach(el => el.classList.add('reveal'));
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = (i * 0.06) + 's';
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => observer.observe(el));
}

/* эффект параллакса на главном экране */
function initParallax() {
  const heroBg = document.querySelector('.hero__bg img');
  if (!heroBg) return;
  window.addEventListener('scroll', () => {
    heroBg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
  }, { passive: true });
}

console.log('DonGuide инициализирован');

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

/* ===== квиз ===== */
function initQuiz() {
  state.quizStep = 1;
  updateQuizUI();
}

/* следующий шаг */
function quizNext() {
  if (state.quizStep < state.totalSteps) {
    state.quizStep++;
    updateQuizUI();
  } else {
    saveQuizAnswers();
    startLoadingSequence();
  }
}

/* предыдущий шаг */
function quizPrev() {
  if (state.quizStep > 1) {
    state.quizStep--;
    updateQuizUI();
  }
}

/* сохраняем ответы квиза в localStorage */
function saveQuizAnswers() {
  // начальная точка
  const startInput = document.querySelector('input[name="start"]:checked');
  const start = startInput ? startInput.value : 'station';

  // бюджет
  const slider = document.getElementById('budget-slider');
  const budget = slider ? parseInt(slider.value) : 0;

  // интересы
  const interestInputs = document.querySelectorAll('input[name="interests"]:checked');
  const interests = Array.from(interestInputs).map(i => i.value);

  localStorage.setItem('quiz', JSON.stringify({ start, budget, interests }));
}

/* обновление интерфейса квиза */
function updateQuizUI() {
  const step = state.quizStep;
  const total = state.totalSteps;

  for (let i = 1; i <= total; i++) {
    const el = document.getElementById('step-' + i);
    if (el) el.classList.toggle('hidden', i !== step);
  }

  const fill = document.getElementById('progress-fill');
  if (fill) fill.style.width = ((step - 1) / total * 100) + '%';

  for (let i = 1; i <= total; i++) {
    const ps = document.getElementById('ps-' + i);
    if (!ps) continue;
    ps.classList.remove('active', 'done');
    if (i === step) ps.classList.add('active');
    else if (i < step) ps.classList.add('done');
  }

  const lbl = document.getElementById('quiz-step-label');
  if (lbl) lbl.textContent = 'Шаг ' + step + ' из ' + total;

  const prevBtn = document.getElementById('quiz-prev');
  const nextBtn = document.getElementById('quiz-next');
  if (prevBtn) prevBtn.style.visibility = step > 1 ? 'visible' : 'hidden';
  if (nextBtn) {
    nextBtn.innerHTML = step === total
      ? `Построить маршрут <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M9 2L16 9L9 16" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 9H16" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`
      : `Далее <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M7 4L12 9L7 14" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  }

  // анимация появления шага
  const activeStep = document.getElementById('step-' + step);
  if (activeStep) {
    activeStep.style.opacity = '0';
    activeStep.style.transform = 'translateY(20px)';
    requestAnimationFrame(() => {
      activeStep.style.transition = 'opacity .4s ease, transform .4s ease';
      activeStep.style.opacity = '1';
      activeStep.style.transform = 'translateY(0)';
    });
  }
}

/* экран загрузки маршрута */
function startLoadingSequence() {
  const overlay = document.getElementById('quiz-loading');
  if (!overlay) return;
  overlay.classList.add('show');

  const steps = [1, 2, 3].map(i => document.getElementById('ls-' + i));

  steps.forEach((s, i) => {
    if (s) { s.className = 'loading-step'; if (i === 0) s.className += ' done'; }
  });

  setTimeout(() => {
    if (steps[1]) { steps[1].className = 'loading-step active'; steps[1].textContent = '⏳ Подбираем достопримечательности'; }
  }, 600);

  setTimeout(() => {
    if (steps[1]) { steps[1].className = 'loading-step done'; steps[1].textContent = '✓ Достопримечательности подобраны'; }
    if (steps[2]) { steps[2].className = 'loading-step active'; steps[2].textContent = '⏳ Оптимизируем маршрут'; }
  }, 1400);

  setTimeout(() => {
    if (steps[2]) { steps[2].className = 'loading-step done'; steps[2].textContent = '✓ Маршрут готов!'; }
    const fill = document.getElementById('progress-fill');
    if (fill) fill.style.width = '100%';
    const ps3 = document.getElementById('ps-3');
    if (ps3) ps3.classList.add('done');
  }, 2200);

  // переход на страницу маршрута
  setTimeout(() => {
    overlay.classList.remove('show');
    window.location.href = 'route.html';
  }, 2800);
}

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

/* ===== каталог ===== */
function initCatalog() {
  renderCatalog();
}

/* установка активного фильтра */
function setFilter(el) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  state.activeFilter = el.dataset.filter;
  renderCatalog();
}

/* поиск по каталогу */
function filterCatalog() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  state.searchQuery = input ? input.value.toLowerCase().trim() : '';
  if (clearBtn) clearBtn.style.display = state.searchQuery ? 'block' : 'none';
  renderCatalog();
}

/* сброс поиска */
function clearSearch() {
  const input = document.getElementById('search-input');
  const clearBtn = document.getElementById('search-clear');
  if (input) input.value = '';
  if (clearBtn) clearBtn.style.display = 'none';
  state.searchQuery = '';
  renderCatalog();
}

/* сортировка каталога */
function sortCatalog(value) {
  state.sortOrder = value;
  renderCatalog();
}

/* отрисовка каталога с учётом фильтров и поиска */
function renderCatalog() {
  const cards = Array.from(document.querySelectorAll('.catalog-card'));
  let visible = 0;
  const grid = document.getElementById('catalog-grid');

  // сортировка
  if (grid && state.sortOrder !== 'popular') {
    const sorted = [...cards].sort((a, b) => {
      if (state.sortOrder === 'rating') return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
      if (state.sortOrder === 'name')   return a.dataset.name.localeCompare(b.dataset.name, 'ru');
      return 0;
    });
    sorted.forEach(c => grid.appendChild(c));
  }

  // фильтрация
  cards.forEach(card => {
    const matchCategory = state.activeFilter === 'all' || card.dataset.category === state.activeFilter;
    const matchSearch   = !state.searchQuery || card.dataset.name.toLowerCase().includes(state.searchQuery);
    const isVisible     = matchCategory && matchSearch;
    card.classList.toggle('hidden', !isVisible);
    if (isVisible) visible++;
  });

  // счётчик результатов
  const countEl = document.getElementById('catalog-count');
  if (countEl) countEl.textContent = `Найдено: ${visible} ${pluralPlace(visible)}`;

  // сообщение «ничего не найдено»
  const existing = grid && grid.querySelector('.no-results');
  if (existing) existing.remove();
  if (visible === 0 && grid) {
    const nr = document.createElement('div');
    nr.className = 'no-results';
    nr.innerHTML = '<h3>Ничего не найдено</h3><p>Попробуйте изменить фильтр или поисковый запрос</p>';
    grid.appendChild(nr);
  }
}

/* склонение слова «место» */
function pluralPlace(n) {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'мест';
  if (mod10 === 1) return 'место';
  if (mod10 >= 2 && mod10 <= 4) return 'места';
  return 'мест';
}

/* кнопка «загрузить ещё» */
function loadMore() {
  const btn = document.querySelector('.catalog-load-more .btn');
  if (!btn) return;
  btn.textContent = 'Загрузка...';
  btn.disabled = true;
  setTimeout(() => {
    btn.innerHTML = 'Всё загружено ✓';
    btn.disabled = true;
    btn.style.opacity = '0.5';
  }, 1200);
}

/* избранное */
function toggleFav(btn) {
  const id = btn.dataset.id;
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    btn.classList.remove('active');
    btn.title = 'В избранное';
    showToast('Удалено из избранного');
  } else {
    state.favorites.add(id);
    btn.classList.add('active');
    btn.title = 'В избранном';
    showToast('Добавлено в избранное ♥');
    // анимация сердечка
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => { btn.style.transform = ''; }, 300);
  }
}

/* всплывающее уведомление */
let toastTimeout;
function showToast(message) {
  let toast = document.getElementById('dg-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dg-toast';
    toast.style.cssText = `position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--anthracite);color:white;padding:12px 24px;border-radius:50px;font-size:14px;font-weight:600;font-family:'Montserrat',sans-serif;z-index:9999;opacity:0;transition:opacity .25s ease,transform .25s ease;white-space:nowrap;box-shadow:0 4px 20px rgba(0,0,0,.25);pointer-events:none;`;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
  }, 2200);
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

/* плитки интересов — минимум одна должна быть выбрана */
function initInterestTiles() {
  document.querySelectorAll('.interest-tile').forEach(tile => {
    tile.addEventListener('change', () => {
      const checked = document.querySelectorAll('.interest-tile input:checked');
      if (checked.length === 0) tile.querySelector('input').checked = true;
    });
  });
}

/* точки старта — управляются через css :checked */
function initStartPoints() {}

/* эффект параллакса на главном экране */
function initParallax() {
  const heroBg = document.querySelector('.hero__bg img');
  if (!heroBg) return;
  window.addEventListener('scroll', () => {
    heroBg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
  }, { passive: true });
}

console.log('DonGuide инициализирован');

/* ==========================================================================
   CONNECT HEALTH — WORKSPACE HUB INTERACTIVITY
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  initClockAndGreeting();
  initSearchAndFilter();
  initThemeToggle();
  initERPWarning();
});

/* --------------------------------------------------------------------------
   1. Real-time Clock, Date & Dynamic Greeting
   -------------------------------------------------------------------------- */
function initClockAndGreeting() {
  const timeEl = document.getElementById('live-time');
  const dateEl = document.getElementById('live-date');
  const greetingEl = document.getElementById('greeting-text');
  const yearEl = document.getElementById('current-year');

  function update() {
    const now = new Date();

    // Time: HH:MM:SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    if (timeEl) timeEl.textContent = `${hours}:${minutes}:${seconds}`;

    // Date formatted in Brazilian Portuguese
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString('pt-BR', options);
    }

    if (yearEl) {
      yearEl.textContent = now.getFullYear();
    }

    // Dynamic greeting based on current hour
    if (greetingEl) {
      const currentHour = now.getHours();
      let greeting = 'Olá, equipe Connect Health!';
      if (currentHour >= 5 && currentHour < 12) {
        greeting = '☀️ Bom dia, equipe Connect Health!';
      } else if (currentHour >= 12 && currentHour < 18) {
        greeting = '🌤️ Boa tarde, equipe Connect Health!';
      } else {
        greeting = '🌙 Boa noite, equipe Connect Health!';
      }
      greetingEl.textContent = greeting;
    }
  }

  update();
  setInterval(update, 1000);
}

/* --------------------------------------------------------------------------
   2. Search & Category Filtering
   -------------------------------------------------------------------------- */
function initSearchAndFilter() {
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.system-card');
  const noResults = document.getElementById('no-results');
  const resetBtn = document.getElementById('reset-filter-btn');

  let currentCategory = 'all';
  let searchTerm = '';

  function applyFilters() {
    let visibleCount = 0;

    cards.forEach(card => {
      const category = card.getAttribute('data-category');
      const searchData = (card.getAttribute('data-title') || '').toLowerCase();
      const cardTitle = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
      const cardDesc = (card.querySelector('.card-desc')?.textContent || '').toLowerCase();

      const combinedText = `${searchData} ${cardTitle} ${cardDesc}`;
      const matchesCategory = currentCategory === 'all' || category === currentCategory;
      const matchesSearch = !searchTerm || combinedText.includes(searchTerm);

      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResults) {
      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    if (clearBtn) {
      clearBtn.style.display = searchTerm.length > 0 ? 'flex' : 'none';
    }
  }

  // Search input event
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim().toLowerCase();
      applyFilters();
    });

    // Keyboard shortcut '/' to focus search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }

  // Clear search button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchTerm = '';
        applyFilters();
        searchInput.focus();
      }
    });
  }

  // Category filter tabs
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter');
      applyFilters();
    });
  });

  // Reset button in empty state
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchTerm = '';
      currentCategory = 'all';
      filterBtns.forEach(b => {
        if (b.getAttribute('data-filter') === 'all') {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      applyFilters();
    });
  }
}

/* --------------------------------------------------------------------------
   3. Copy Link to Clipboard & Toast
   -------------------------------------------------------------------------- */
let toastTimeout;

function copyLink(url, systemName) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(() => {
      showToast('Link Copiado!', `O link do ${systemName} foi copiado para a área de transferência.`);
    }).catch(() => {
      fallbackCopy(url, systemName);
    });
  } else {
    fallbackCopy(url, systemName);
  }
}

function fallbackCopy(url, systemName) {
  const tempInput = document.createElement('input');
  tempInput.value = url;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand('copy');
  document.body.removeChild(tempInput);
  showToast('Link Copiado!', `O link do ${systemName} foi copiado com sucesso.`);
}

function showToast(title, message) {
  const toast = document.getElementById('toast');
  const titleEl = document.getElementById('toast-title');
  const msgEl = document.getElementById('toast-msg');

  if (!toast) return;

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;

  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* --------------------------------------------------------------------------
   4. Theme Toggle (Dark / Light)
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  // Check saved theme
  const savedTheme = localStorage.getItem('ch_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    updateThemeIcon(true);
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.body.classList.toggle('light-theme');
      localStorage.setItem('ch_theme', isLight ? 'light' : 'dark');
      updateThemeIcon(isLight);
    });
  }

  function updateThemeIcon(isLight) {
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', isLight ? 'sun' : 'moon');
      if (window.lucide) window.lucide.createIcons();
    }
  }
}

/* --------------------------------------------------------------------------
   5. Modal & ERP Warning
   -------------------------------------------------------------------------- */
function initERPWarning() {
  const devButtons = document.querySelectorAll('.btn-warning-prompt');
  
  devButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetUrl = btn.getAttribute('href');
      
      openModal({
        icon: 'alert-triangle',
        iconClass: 'icon-amber',
        title: 'ERP Connect — Ambiente em Construção',
        bodyHTML: `
          <p>O <strong>ERP Connect</strong> ainda está em fase de desenvolvimento e homologação interna.</p>
          <div style="background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; padding: 0.75rem 1rem; border-radius: 6px; margin: 1rem 0; font-size: 0.85rem; color: #fbbf24;">
            <strong>Aviso de Instabilidade:</strong> Alguns módulos podem estar indisponíveis ou apresentar dados de teste.
          </div>
          <p>Deseja prosseguir para a versão preliminar de testes?</p>
        `,
        actionsHTML: `
          <button class="btn-outline" onclick="closeModal()">Voltar</button>
          <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary btn-amber" onclick="closeModal()">
            <span>Acessar Mesmo Assim</span>
            <i data-lucide="external-link"></i>
          </a>
        `
      });
    });
  });
}

function openHelpModal() {
  openModal({
    icon: 'help-circle',
    iconClass: 'icon-cyan',
    title: 'Central de Suporte & Informações',
    bodyHTML: `
      <p>Este portal centraliza os sistemas oficiais utilizados pela equipe <strong>Connect Health</strong>.</p>
      <ul style="margin: 1rem 0 1rem 1.25rem; font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7;">
        <li><strong>Simulador de Preço:</strong> Para simulações e cálculos de propostas comerciais.</li>
        <li><strong>Gerador de Proposta:</strong> Para gerar PDFs e propostas formais para clientes.</li>
        <li><strong>ERP Connect:</strong> Módulo operacional e financeiro em fase de desenvolvimento.</li>
      </ul>
      <p style="font-size: 0.85rem; color: var(--text-muted);">Para dúvidas, sugestões ou suporte técnico, entre em contato com o administrador do sistema.</p>
    `,
    actionsHTML: `
      <button class="btn-primary btn-cyan" onclick="closeModal()">Entendido</button>
    `
  });
}

function openModal({ icon, iconClass, title, bodyHTML, actionsHTML }) {
  const modal = document.getElementById('info-modal');
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const actionsEl = document.getElementById('modal-actions');
  const iconContainer = document.getElementById('modal-icon-container');

  if (titleEl) titleEl.textContent = title;
  if (bodyEl) bodyEl.innerHTML = bodyHTML;
  if (actionsEl) actionsEl.innerHTML = actionsHTML;

  if (iconContainer) {
    iconContainer.className = `modal-icon-wrapper ${iconClass || ''}`;
    iconContainer.innerHTML = `<i data-lucide="${icon || 'info'}"></i>`;
  }

  if (window.lucide) window.lucide.createIcons();

  if (modal) modal.classList.add('open');
}

function closeModal() {
  const modal = document.getElementById('info-modal');
  if (modal) modal.classList.remove('open');
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  const modal = document.getElementById('info-modal');
  if (e.target === modal) {
    closeModal();
  }
});

// Close modal with ESC key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
});

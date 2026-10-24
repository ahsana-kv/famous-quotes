// Famous Quotes Application Logic
document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const quoteCard = document.getElementById('quoteCard');
  const quoteText = document.getElementById('quoteText');
  const quoteAuthor = document.getElementById('quoteAuthor');
  const quoteCategory = document.getElementById('quoteCategory');
  const quoteId = document.getElementById('quoteId');
  const newQuoteBtn = document.getElementById('newQuoteBtn');
  const copyBtn = document.getElementById('copyBtn');
  const copyBtnText = document.getElementById('copyBtnText');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const categoryPillsContainer = document.getElementById('categoryPills');
  const resultsSection = document.getElementById('resultsSection');
  const resultsTitle = document.getElementById('resultsTitle');
  const resultsCount = document.getElementById('resultsCount');
  const quotesGrid = document.getElementById('quotesGrid');
  const toast = document.getElementById('toast');
  const statsBadge = document.getElementById('statsBadge');

  // State
  let currentQuote = null;
  let selectedCategory = '';
  let searchQuery = '';
  let searchDebounceTimer = null;
  let toastTimer = null;

  // Initialize
  init();

  async function init() {
    await fetchCategories();
    await fetchRandomQuote();
    setupEventListeners();
  }

  // 1. Fetch Categories
  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const categories = await res.json();
      renderCategoryPills(categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  function renderCategoryPills(categories) {
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'pill';
      btn.textContent = cat;
      btn.dataset.category = cat;
      categoryPillsContainer.appendChild(btn);
    });
  }

  // 2. Fetch Random Quote
  async function fetchRandomQuote() {
    const spinIcon = newQuoteBtn.querySelector('.spin-icon');
    if (spinIcon) spinIcon.classList.add('spinning');

    try {
      let url = '/api/quotes/random';
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (searchQuery) params.append('author', searchQuery);

      if ([...params].length > 0) {
        url += '?' + params.toString();
      }

      const res = await fetch(url);
      if (!res.ok) {
        // If filtered category has no match, fetch any random quote
        const fallbackRes = await fetch('/api/quotes/random');
        const fallbackData = await fallbackRes.json();
        displayQuote(fallbackData);
        return;
      }
      const data = await res.json();
      displayQuote(data);
    } catch (err) {
      console.error('Error fetching random quote:', err);
    } finally {
      if (spinIcon) {
        setTimeout(() => spinIcon.classList.remove('spinning'), 600);
      }
    }
  }

  function displayQuote(quote) {
    currentQuote = quote;
    
    // Quick fade transition
    quoteText.style.opacity = '0';
    quoteText.style.transform = 'translateY(6px)';

    setTimeout(() => {
      quoteText.textContent = quote.quote;
      quoteAuthor.textContent = quote.author;
      quoteCategory.textContent = quote.category;
      quoteId.textContent = `#${quote.id}`;

      quoteText.style.opacity = '1';
      quoteText.style.transform = 'translateY(0)';
    }, 150);
  }

  // 3. Search and Filter Quotes
  async function performSearch() {
    const hasSearch = searchQuery.trim().length > 0;
    const hasCategory = selectedCategory.trim().length > 0;

    if (!hasSearch && !hasCategory) {
      resultsSection.classList.add('hidden');
      return;
    }

    resultsSection.classList.remove('hidden');

    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);

      const res = await fetch(`/api/quotes?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      renderSearchResults(data.quotes);
    } catch (err) {
      console.error('Error searching quotes:', err);
      quotesGrid.innerHTML = `
        <div class="empty-state">
          <h3>Error loading quotes</h3>
          <p>Please try again.</p>
        </div>
      `;
    }
  }

  function renderSearchResults(quotes) {
    resultsCount.textContent = `${quotes.length} ${quotes.length === 1 ? 'quote' : 'quotes'} found`;

    if (searchQuery && selectedCategory) {
      resultsTitle.textContent = `Results in "${selectedCategory}" matching "${searchQuery}"`;
    } else if (searchQuery) {
      resultsTitle.textContent = `Results for "${searchQuery}"`;
    } else if (selectedCategory) {
      resultsTitle.textContent = `All "${selectedCategory}" Quotes`;
    } else {
      resultsTitle.textContent = 'Search Results';
    }

    if (quotes.length === 0) {
      quotesGrid.innerHTML = `
        <div class="empty-state">
          <h3>No matching quotes found</h3>
          <p>Try searching for a different author, keyword, or clear category filters.</p>
        </div>
      `;
      return;
    }

    quotesGrid.innerHTML = quotes.map(q => `
      <div class="grid-card" data-id="${q.id}">
        <p class="grid-card-text">"${escapeHtml(q.quote)}"</p>
        <div class="grid-card-footer">
          <span class="grid-author">— ${escapeHtml(q.author)}</span>
          <span class="grid-category">${escapeHtml(q.category)}</span>
        </div>
      </div>
    `).join('');

    // Clicking a grid card promotes it to the Hero Quote card
    quotesGrid.querySelectorAll('.grid-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id, 10);
        const selected = quotes.find(q => q.id === id);
        if (selected) {
          displayQuote(selected);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          showToast(`Loaded quote #${selected.id}`);
        }
      });
    });
  }

  // 4. Copy to Clipboard
  function copyCurrentQuote() {
    if (!currentQuote) return;
    const textToCopy = `"${currentQuote.quote}" — ${currentQuote.author}`;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Quote copied to clipboard!');
      }).catch(() => {
        fallbackCopyText(textToCopy);
      });
    } else {
      fallbackCopyText(textToCopy);
    }
  }

  function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('Quote copied to clipboard!');
    } catch (e) {
      showToast('Failed to copy');
    }
    document.body.removeChild(textArea);
  }

  function showToast(message) {
    if (toastTimer) clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.remove('hidden');

    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2400);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 5. Event Listeners
  function setupEventListeners() {
    // New Quote button
    newQuoteBtn.addEventListener('click', fetchRandomQuote);

    // Copy Quote button
    copyBtn.addEventListener('click', copyCurrentQuote);

    // Search input debounced
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchQuery.trim().length > 0) {
        clearSearchBtn.classList.remove('hidden');
      } else {
        clearSearchBtn.classList.add('hidden');
      }

      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        performSearch();
      }, 250);
    });

    // Clear search button
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearSearchBtn.classList.add('hidden');
      performSearch();
    });

    // Category pills container delegation
    categoryPillsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill');
      if (!btn) return;

      categoryPillsContainer.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');

      selectedCategory = btn.dataset.category || '';
      performSearch();
    });
  }
});

/**
 * Main application -- wires filters, API, and DOM together.
 */
(async function () {
  const tagSelect = document.getElementById("tag-filter");
  const authorSelect = document.getElementById("author-filter");
  const clearBtn = document.getElementById("clear-filters");
  const newQuoteBtn = document.getElementById("new-quote");
  const quoteText = document.querySelector("#quote-text p");
  const quoteAuthor = document.getElementById("quote-author");
  const quoteSource = document.getElementById("quote-source");
  const quoteTags = document.getElementById("quote-tags");
  const quoteDisplay = document.querySelector(".quote-display");
  const activeFilters = document.getElementById("active-filters");

  // -- Populate filter dropdowns ----------------------------------------

  const [tags, authors] = await Promise.all([
    QuotesAPI.getTags(),
    QuotesAPI.getAuthors(),
  ]);

  tags
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.tagId;
      opt.textContent = t.name;
      tagSelect.appendChild(opt);
    });

  authors
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((a) => {
      const opt = document.createElement("option");
      opt.value = a.authorId;
      opt.textContent = a.name;
      authorSelect.appendChild(opt);
    });

  // -- Restore saved filters from cookies -------------------------------

  Filters.load();
  tagSelect.value = Filters.getTagId();
  authorSelect.value = Filters.getAuthorId();

  // -- Render helpers ---------------------------------------------------

  function renderQuote(q) {
    if (!q) {
      quoteText.textContent = "No quotes found for the selected filters.";
      quoteAuthor.textContent = "";
      quoteSource.textContent = "";
      quoteTags.innerHTML = "";
      return;
    }

    quoteText.textContent = q.quote;
    quoteAuthor.textContent = q.author;
    quoteSource.textContent = q.source ? `(${q.source})` : "";

    quoteTags.innerHTML = "";
    (q.tags || []).forEach((name) => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = name;
      span.addEventListener("click", () => {
        const tag = tags.find((t) => t.name === name);
        if (tag) {
          tagSelect.value = tag.tagId;
          tagSelect.dispatchEvent(new Event("change"));
        }
      });
      quoteTags.appendChild(span);
    });
  }

  function updateActiveFiltersLabel() {
    const parts = [];
    if (Filters.getTagId()) {
      const t = tags.find((t) => t.tagId === Filters.getTagId());
      if (t) parts.push(`tag: ${t.name}`);
    }
    if (Filters.getAuthorId()) {
      const a = authors.find((a) => a.authorId === Filters.getAuthorId());
      if (a) parts.push(`author: ${a.name}`);
    }
    activeFilters.textContent = parts.length
      ? `Filtering by ${parts.join(" + ")}`
      : "";
  }

  async function fetchAndRender() {
    quoteDisplay.classList.add("loading");
    try {
      const q = await QuotesAPI.getRandomQuote(Filters.toParams());
      renderQuote(q);
    } finally {
      quoteDisplay.classList.remove("loading");
    }
  }

  // -- Event listeners --------------------------------------------------

  tagSelect.addEventListener("change", () => {
    Filters.setTagId(tagSelect.value);
    updateActiveFiltersLabel();
    fetchAndRender();
  });

  authorSelect.addEventListener("change", () => {
    Filters.setAuthorId(authorSelect.value);
    updateActiveFiltersLabel();
    fetchAndRender();
  });

  clearBtn.addEventListener("click", () => {
    Filters.clear();
    tagSelect.value = "";
    authorSelect.value = "";
    updateActiveFiltersLabel();
    fetchAndRender();
  });

  newQuoteBtn.addEventListener("click", () => {
    fetchAndRender();
  });

  // -- Initial load -----------------------------------------------------

  updateActiveFiltersLabel();
  fetchAndRender();
})();
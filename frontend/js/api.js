/**
 * API client for the quotes backend.
 *
 * In production, set QuotesAPI.baseUrl to the Lambda API Gateway endpoint.
 * When no baseUrl is configured, the module falls back to built-in sample
 * data so the frontend can be developed and tested without a running backend.
 */
const QuotesAPI = (() => {
  // Configure this once the Lambda API is deployed.
  let baseUrl = "";

  // -- Sample data used when no backend is available --------------------
  const sampleTags = [
    { tagId: "1", name: "education" },
    { tagId: "2", name: "philosophy" },
    { tagId: "3", name: "life-philosophy" },
    { tagId: "4", name: "humor" },
    { tagId: "5", name: "science" },
    { tagId: "6", name: "inspiration" },
    { tagId: "7", name: "literature" },
    { tagId: "8", name: "wisdom" },
  ];

  const sampleAuthors = [
    { authorId: "1", name: "William Shakespeare" },
    { authorId: "2", name: "Homer Simpson" },
    { authorId: "3", name: "Albert Einstein" },
    { authorId: "4", name: "Oscar Wilde" },
    { authorId: "5", name: "Mark Twain" },
    { authorId: "6", name: "Maya Angelou" },
    { authorId: "7", name: "Friedrich Nietzsche" },
  ];

  const sampleQuotes = [
    { quoteId: "1", quote: "To be or not to be, that is the question.", author: "William Shakespeare", authorId: "1", source: "Hamlet", tagIds: ["1", "2"] },
    { quoteId: "2", quote: "Trying is the first step to failure.", author: "Homer Simpson", authorId: "2", source: "", tagIds: ["3", "4"] },
    { quoteId: "3", quote: "Imagination is more important than knowledge.", author: "Albert Einstein", authorId: "3", source: "", tagIds: ["5", "6"] },
    { quoteId: "4", quote: "Be yourself; everyone else is already taken.", author: "Oscar Wilde", authorId: "4", source: "", tagIds: ["6", "8"] },
    { quoteId: "5", quote: "The only way to do great work is to love what you do.", author: "Albert Einstein", authorId: "3", source: "", tagIds: ["6"] },
    { quoteId: "6", quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", authorId: "3", source: "", tagIds: ["6", "8"] },
    { quoteId: "7", quote: "The reports of my death are greatly exaggerated.", author: "Mark Twain", authorId: "5", source: "", tagIds: ["4"] },
    { quoteId: "8", quote: "If you tell the truth, you don't have to remember anything.", author: "Mark Twain", authorId: "5", source: "", tagIds: ["8", "2"] },
    { quoteId: "9", quote: "There is no greater agony than bearing an untold story inside you.", author: "Maya Angelou", authorId: "6", source: "I Know Why the Caged Bird Sings", tagIds: ["7", "6"] },
    { quoteId: "10", quote: "We love life, not because we are used to living but because we are used to loving.", author: "Friedrich Nietzsche", authorId: "7", source: "", tagIds: ["2", "3"] },
    { quoteId: "11", quote: "All the world's a stage, and all the men and women merely players.", author: "William Shakespeare", authorId: "1", source: "As You Like It", tagIds: ["7", "2"] },
    { quoteId: "12", quote: "To live is the rarest thing in the world. Most people exist, that is all.", author: "Oscar Wilde", authorId: "4", source: "", tagIds: ["3", "8"] },
    { quoteId: "13", quote: "He who has a why to live can bear almost any how.", author: "Friedrich Nietzsche", authorId: "7", source: "", tagIds: ["2", "8"] },
    { quoteId: "14", quote: "Education is what survives when what has been learned has been forgotten.", author: "Albert Einstein", authorId: "3", source: "", tagIds: ["1", "5"] },
    { quoteId: "15", quote: "Do'h!", author: "Homer Simpson", authorId: "2", source: "The Simpsons", tagIds: ["4"] },
  ];
  // --------------------------------------------------------------------

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function tagNamesForQuote(q) {
    return q.tagIds
      .map((id) => sampleTags.find((t) => t.tagId === id))
      .filter(Boolean)
      .map((t) => t.name);
  }

  // -- Public methods ---------------------------------------------------

  async function getTags() {
    if (baseUrl) {
      const res = await fetch(`${baseUrl}/tags`);
      return res.json();
    }
    return sampleTags;
  }

  async function getAuthors() {
    if (baseUrl) {
      const res = await fetch(`${baseUrl}/authors`);
      return res.json();
    }
    return sampleAuthors;
  }

  async function getRandomQuote({ tagId, authorId } = {}) {
    if (baseUrl) {
      const params = new URLSearchParams();
      if (tagId) params.set("tagId", tagId);
      if (authorId) params.set("authorId", authorId);
      const qs = params.toString();
      const res = await fetch(`${baseUrl}/quotes/random${qs ? "?" + qs : ""}`);
      return res.json();
    }

    // Offline filtering against sample data
    let pool = sampleQuotes;
    if (tagId) {
      pool = pool.filter((q) => q.tagIds.includes(tagId));
    }
    if (authorId) {
      pool = pool.filter((q) => q.authorId === authorId);
    }
    if (pool.length === 0) return null;

    const q = pickRandom(pool);
    return { ...q, tags: tagNamesForQuote(q) };
  }

  return { getTags, getAuthors, getRandomQuote, set baseUrl(url) { baseUrl = url; } };
})();
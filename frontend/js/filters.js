/**
 * Filter state management with cookie persistence.
 *
 * Stores the selected tag and author IDs and persists them in cookies
 * so that the user's filter choices survive page reloads (as specified
 * in the project requirements).
 */
const Filters = (() => {
  const COOKIE_TAG = "selectedTag";
  const COOKIE_AUTHOR = "selectedAuthor";
  const COOKIE_DAYS = 30;

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : "";
  }

  function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
  }

  let tagId = "";
  let authorId = "";

  function load() {
    tagId = getCookie(COOKIE_TAG);
    authorId = getCookie(COOKIE_AUTHOR);
  }

  function getTagId() {
    return tagId;
  }

  function getAuthorId() {
    return authorId;
  }

  function setTagId(id) {
    tagId = id;
    if (id) {
      setCookie(COOKIE_TAG, id, COOKIE_DAYS);
    } else {
      deleteCookie(COOKIE_TAG);
    }
  }

  function setAuthorId(id) {
    authorId = id;
    if (id) {
      setCookie(COOKIE_AUTHOR, id, COOKIE_DAYS);
    } else {
      deleteCookie(COOKIE_AUTHOR);
    }
  }

  function clear() {
    setTagId("");
    setAuthorId("");
  }

  function toParams() {
    const params = {};
    if (tagId) params.tagId = tagId;
    if (authorId) params.authorId = authorId;
    return params;
  }

  return { load, getTagId, getAuthorId, setTagId, setAuthorId, clear, toParams };
})();
document.addEventListener('DOMContentLoaded', async () => {
  const CATEGORIES = 'categories';
  await cacheCategories();

  /**
   * Verifies the local storage, requesting the trivia categories from the API
   * if they are are not locally saved already.
   */
  async function cacheCategories() {
    if (localStorage.getItem(CATEGORIES)) return;

    const response = await fetch(`/${CATEGORIES}`);
    const json = await response.json();
    if (json.status !== 200) {
      //! PROCESS UI ERROR
      return;
    }

    localStorage.setItem(CATEGORIES, JSON.stringify(json.data));
  }
});

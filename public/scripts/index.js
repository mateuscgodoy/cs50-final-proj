document.addEventListener('DOMContentLoaded', async () => {
  const CATEGORIES = 'categories';
  const START_MESSAGE =
    "Once you're ready, choose at least 10 Trivia categories below, and let's get started!";
  const messageUI = document.querySelector('p.message');

  await cacheCategories();
  renderCategoriesForm();

  /**
   * Verifies the local storage, requesting the trivia categories from the API
   * if they are are not locally saved already.
   */
  async function cacheCategories() {
    if (localStorage.getItem(CATEGORIES)) return;

    const response = await fetch(`/${CATEGORIES}`);
    const json = await response.json();
    if (json.status !== 200) {
      messageUI.textContent = json.message;
      return;
    }

    localStorage.setItem(CATEGORIES, JSON.stringify(json.data));
  }

  /**
   * Renders the form with all fetched trivia categories and a submit button.
   */
  function renderCategoriesForm() {
    const categories = JSON.parse(localStorage.getItem(CATEGORIES));
    if (!categories) return;

    messageUI.textContent = START_MESSAGE;
    const frag = document.createDocumentFragment();
    const form = document.querySelector('form');
    const submitBtn = document.createElement('button');

    categories.forEach((category) => {
      const checkContainer = renderCategory(category);
      frag.appendChild(checkContainer);
    });

    submitBtn.textContent = 'Start';
    submitBtn.type = 'submit';

    form.appendChild(frag);
    form.appendChild(submitBtn);
  }

  /**
   * Creates a visual container for trivia category, with a label, a checkbox inside it.
   * @param {{id:number, name: string}} category A specific category.
   * @returns Return the complete container for this category.
   */
  function renderCategory(category) {
    const checkbox = document.createElement('input');
    const label = document.createElement('label');
    const divContainer = document.createElement('div');

    checkbox.type = 'checkbox';
    checkbox.classList.add('btn-check');
    checkbox.id = `btn-check-${category.id}`;
    checkbox.autocomplete = 'off';
    checkbox.name = category.id;
    checkbox.value = category.id;

    label.textContent = category.name;
    label.classList.add('btn');
    label.htmlFor = `btn-check-${category.id}`;

    divContainer.classList.add('my-2');
    divContainer.appendChild(checkbox);
    divContainer.appendChild(label);

    return divContainer;
  }
});

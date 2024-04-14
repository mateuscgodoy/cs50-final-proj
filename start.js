const CATEGORIES = 'categories';
const USERS = 'users';
const SELECTED_CATEGORIES = 'selected';
const USER = 'user';
const GAME_URL = `${window.location.origin}/game.html`;

document.addEventListener('DOMContentLoaded', async () => {
  sessionStorage.removeItem(SELECTED_CATEGORIES);
  sessionStorage.removeItem(USER);
  const form = document.querySelector('form');
  form.addEventListener('submit', onSubmitStartForm);
  await cacheCategories();
  configureCategories();
  configureUsers();
});

/**
 * Verifies the local storage, requesting the trivia categories from the API
 * if they are are not currently saved on the localStorage.
 */
async function cacheCategories() {
  let data = localStorage.getItem(CATEGORIES);
  if (!data) {
    data = await getCategories();
    localStorage.setItem(CATEGORIES, JSON.stringify(data));
  } else {
    data = JSON.parse(localStorage.getItem(CATEGORIES));
  }
}

/**
 * Fetches the API for the categories list and formats them.
 * @returns The categories list ready to be used.
 */
async function getCategories() {
  const results = await fetch('https://opentdb.com/api_category.php');
  if (!results) return;

  const json = await results.json();
  return processCategories(json.trivia_categories);
}

/**
 * Normalize the categories names for better printing.
 * @param {{id: number, name: string}[]} categories The trivia categories as received from the API
 * @returns {{id: number, name: string}[]} Categories with names corrected.
 */
function processCategories(categories) {
  return categories.map((category) => {
    const nameSplitted = category.name.split(' ');
    let newName = category.name;

    if (
      nameSplitted[0].toLowerCase() === 'entertainment:' ||
      nameSplitted[0].toLowerCase() === 'science:'
    ) {
      newName = nameSplitted.slice(1).join(' ');
    }

    return { id: category.id, name: newName };
  });
}

/**
 * Create the categories UI elements and place them on the setup form.
 */
function configureCategories() {
  const categories = JSON.parse(localStorage.getItem(CATEGORIES));
  const frag = document.createDocumentFragment();
  const container = document.getElementById('categories');

  container.addEventListener('click', onClickCategory);

  categories.forEach((category) => {
    const checkContainer = configureCategoryUI(category);
    frag.appendChild(checkContainer);
  });
  container.appendChild(frag);
}

/**
 * Process a trivia category selection action, toggling it in and out from session storage.
 * @param {EventTarget} event The category div that was clicked.
 */
function onClickCategory(event) {
  const clickedElement = event.target;

  if (clickedElement.classList.contains('btn-check')) {
    const categories = JSON.parse(localStorage.getItem(CATEGORIES));
    const categoryID = clickedElement.id.split('-')[2];
    const category = categories.find((cat) => cat.id === parseInt(categoryID));
    let selected =
      JSON.parse(sessionStorage.getItem(SELECTED_CATEGORIES)) || [];
    const selectedIndex = selected.findIndex((el) => el.name === category.name);

    if (selectedIndex !== -1) {
      selected.splice(selectedIndex, 1);
    } else {
      selected.push(category);
    }

    sessionStorage.setItem(SELECTED_CATEGORIES, JSON.stringify(selected));
  }
}

/**
 * Creates a visual container for trivia category, with a label, a checkbox inside it.
 * @param {{id:number, name: string}} category A specific category.
 * @returns Return the complete container for this category.
 */
function configureCategoryUI(category) {
  const checkbox = document.createElement('input');
  const label = document.createElement('label');
  const checkContainer = document.createElement('div');

  checkbox.type = 'checkbox';
  checkbox.classList.add('btn-check');
  checkbox.id = `btn-check-${category.id}`;
  checkbox.autocomplete = 'off';
  label.textContent = category.name;
  label.classList.add('btn', 'text-bright');
  label.htmlFor = `btn-check-${category.id}`;
  checkContainer.classList.add('my-2');

  checkContainer.appendChild(checkbox);
  checkContainer.appendChild(label);

  return checkContainer;
}

/**
 * Verify if there's already something stored on the users key in localStorage.
 * Set an empty array as start value if there is not.
 */
function configureUsers() {
  if (localStorage.getItem(USERS)) return;

  localStorage.setItem(USERS, JSON.stringify([]));
}

/**
 * Asynchronously process the form and create a new user for the Trivia game.
 * @param {EventTarget} e The form event target.
 * @returns Early returns if the user has not selected at least 10 trivia categories.
 */
async function onSubmitStartForm(e) {
  e.preventDefault();
  if (!hasAtLeastTenCategories(e.target)) {
    return;
  }
  await createUser(e.target);
  // Workaround for not having a Backend set.
  window.location.href = GAME_URL;
}

/**
 * Verify if the user has chosen at least 10 trivia categories, displaying a UI message if not.
 * @returns {boolean} Whether or not the user selected 10 trivia categories.
 */
function hasAtLeastTenCategories(target) {
  const selected = JSON.parse(sessionStorage.getItem(SELECTED_CATEGORIES));
  if (selected.length < 10) {
    const missing = 10 - selected.length;
    const formText = target.querySelector('#form-text');
    formText.classList.remove('text-white');
    formText.classList.add('text-warning', 'fs-5');
    formText.textContent = `Add at least ${missing} more ${
      missing > 1 ? 'options' : 'option'
    } and try again`;
    return false;
  }
  return true;
}

/**
 * Creates a new user with all the required information.
 */
async function createUser(target) {
  const selected = JSON.parse(sessionStorage.getItem(SELECTED_CATEGORIES));
  const username = target.querySelector('#username').value;
  const tokenData = await fetch(
    'https://opentdb.com/api_token.php?command=request'
  );
  const { token } = await tokenData.json();
  const lifelines = { skip: true, '50:50': true, audience: true, expert: true };
  const user = { username, token, selected, points: 0, lifelines };
  sessionStorage.setItem(USER, JSON.stringify(user));
  const users = JSON.parse(localStorage.getItem(USERS));
  users.push(user);
  localStorage.setItem(USERS, JSON.stringify(users));
  sessionStorage.removeItem(SELECTED_CATEGORIES);
}

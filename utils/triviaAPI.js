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
 * Fetches the list of categories from the Trivia API.
 * @returns {Object} The trivia categories as received from the API.
 * @throws {Error} In case the operation fail or the API is down.
 */
async function fetchTriviaCategories() {
  try {
    const response = await fetch('https://opentdb.com/api_category.php');
    if (!response.ok) {
      throw new Error('Trivia server encountered a problem. Try again later.');
    }
    const { trivia_categories } = await response.json();
    return processCategories(trivia_categories);
  } catch (error) {
    throw error;
  }
}

/**
 * Fetches a usage token from Trivia API, used to avoid repeating questions.
 * @returns {string} The token as received from the Trivia API.
 * @throws {Error} Throws any error that it may encounter.
 */
async function fetchTriviaToken() {
  try {
    const response = await fetch(
      'https://opentdb.com/api_token.php?command=request'
    );
    if (!response.ok) {
      throw new Error('Trivia server encountered a problem. Try again later.');
    }
    const data = await response.json();
    if (data.response_code !== 0) {
      throw new Error(data.response_message);
    }
    return data.token;
  } catch (error) {
    throw error;
  }
}

/**
 * Creates a new user object to control different aspects of the game.
 * @param {string} token The token received from Trivia API.
 * @returns {Object} An object containing all the elements that represent an user.
 */
function createUser(token) {
  return {
    token,
    questionsAnswered: 0,
    lifelines: {
      '50:50': true,
      skip: true,
      audience: true,
      expert: true,
    },
  };
}

module.exports = { fetchTriviaCategories, fetchTriviaToken, createUser };

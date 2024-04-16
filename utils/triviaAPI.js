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
 * Fetches the Trivia API for a question based on the user current information.
 * @param {Object} user The user object as stored on the current session.
 * @returns {Object} A single question object as received directly from the API.
 */
async function fetchTriviaQuestion(user) {
  //* URL EXAMPLE: https://opentdb.com/api.php?amount=1&category=9&difficulty=easy&type=multiple&token=SOMEUSERTOKEN
  const queryUrl = getQuestionQueryURL(user);
  try {
    let code;
    do {
      const response = await fetch(
        `https://opentdb.com/api.php?${queryUrl.toString()}`
      );
      const { response_code, results } = await response.json();
      code = response_code;

      if (code === 5) {
        await delayFunction(3000);
      } else if (code === 0) {
        const question = results[0];
        question.answered = false;
        return question;
      } else {
        throw new Error(
          'Trivia API could not return a question. Please, try again later.'
        );
      }
    } while (code === 5);
  } catch (error) {
    throw error;
  }
}

/**
 * Creates a custom URL parameters query string to be used to retrieve a question.
 * @param {Object} user The user object as stored on the session.
 * @returns {URLSearchParams} The query search parameters.
 */
function getQuestionQueryURL(user) {
  const { token, selectedCategories, questionsAnswered } = user;
  const category = getRandomCategory(selectedCategories);
  const difficulty = getDifficulty(questionsAnswered);
  const params = { amount: 1, type: 'multiple', token, category, difficulty };
  return new URLSearchParams(params);
}

/**
 * Selects a random category among the options chose by the user.
 * @param {number[]} selectedCategories The categories selected by the user.
 * @returns {number} A random category.
 */
function getRandomCategory(selectedCategories) {
  const randomIndex = Math.floor(Math.random() * selectedCategories.length);
  return selectedCategories[randomIndex];
}

/**
 * Determines the difficulty for a question based on how many the user already answered.
 * @param {number} questionsAnswered The current amount of questions answered.
 * @returns {string} The difficulty that the question should be.
 */
function getDifficulty(questionsAnswered) {
  let difficulty = 'easy';
  if (questionsAnswered > 10) {
    difficulty = 'hard';
  } else if (questionsAnswered > 6) {
    difficulty = 'medium';
  }
  return difficulty;
}

/**
 * Creates a new user object to control different aspects of the game.
 * @param {string} token The token received from Trivia API.
 * @returns {Object} An object containing all the elements that represent an user.
 */
function createUser(token, selectedCategories) {
  return {
    token,
    selectedCategories,
    questionsAnswered: 0,
    lifelines: {
      '50:50': true,
      skip: true,
      audience: true,
      expert: true,
    },
  };
}

/**
 * A utility function to pause the execution of a function, to avoid API time constraint.
 * @param {number} delay The delay amount in ms.
 * @returns A promise that will resolve once the delay elapsed.
 */
function delayFunction(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

function getFrontendQuestion(data) {
  const { correct_answer, incorrect_answers, question, answered } = data;
  const size = incorrect_answers.length + 1;
  const randomIndex = Math.floor(Math.random() * size);
  const answers = incorrect_answers.toSpliced(randomIndex, 0, correct_answer);
  return { question, answers, answered };
}

module.exports = {
  fetchTriviaCategories,
  fetchTriviaToken,
  fetchTriviaQuestion,
  createUser,
  getFrontendQuestion,
};

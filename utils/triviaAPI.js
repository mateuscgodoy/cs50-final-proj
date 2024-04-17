const fs = require('fs');
const path = require('path');

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
async function getTriviaCategories() {
  const filePath = path.join(__dirname, '../config/categories.json');

  try {
    const data = await fs.promises.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(
      'Failed to read categories from file. Fetching from URL...',
      error
    );
    try {
      const response = await fetch('https://opentdb.com/api_category.php');
      if (!response.ok) {
        throw new Error('Failed to fetch categories from URL');
      }
      const { trivia_categories } = await response.json();
      const categories = processCategories(trivia_categories);
      await fs.promises.writeFile(filePath, JSON.stringify(categories), 'utf8');
      return categories;
    } catch (fetchError) {
      console.error('Failed to fetch categories from URL:', fetchError);
      throw fetchError;
    }
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
        question.answered = '';
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
 * @param {string[]} selectedCategories The user selected categories
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

/**
 * Transforms the complete question data version to be presented on the frontend.
 * @param {Object} questionData The question object as received from the API
 * @returns {question: string, answers: string[], answered: string}
 */
function getFrontendQuestion(questionData) {
  const { correct_answer, incorrect_answers, question, answered } =
    questionData;
  const size = incorrect_answers.length + 1;
  const randomIndex = Math.floor(Math.random() * size);
  const answers = incorrect_answers.toSpliced(randomIndex, 0, correct_answer);
  return { question, answers, answered };
}

/**
 * Transforms the question data version based on the selected lifeline.
 * @param {string} lifeline The life line selected
 * @param {Object} questionData The server side version of the question object
 */
function processLifeline(lifeline, questionData) {
  switch (lifeline) {
    case '50:50':
      const randomIndex = Math.floor(
        Math.random() * questionData.incorrect_answers.length
      );
      questionData.incorrect_answers = [
        questionData.incorrect_answers[randomIndex],
      ];
      break;
    case 'audience':
      // TODO

      break;
    case 'expert':
      questionData.incorrect_answers.length = 0;
      break;
    case 'skip':
      return null;
    default:
      throw new Error('Invalid lifeline provided.');
  }

  return questionData;
}

module.exports = {
  getTriviaCategories,
  fetchTriviaToken,
  fetchTriviaQuestion,
  createUser,
  getFrontendQuestion,
  processLifeline,
};

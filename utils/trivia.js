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

async function fetchTriviaCategories() {
  try {
    const response = await fetch('https://opentdb.com/api_category.php');
    if (!response.ok) {
      throw new Error(
        'Categories server encountered a problem. Try again later.'
      );
    }
    const { trivia_categories } = await response.json();
    return processCategories(trivia_categories);
  } catch (error) {
    throw error;
  }
}

module.exports = { fetchTriviaCategories };

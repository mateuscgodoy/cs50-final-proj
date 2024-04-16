document.addEventListener('DOMContentLoaded', async () => {
  const answersContainer = document.getElementById('answers');
  const answersInputs = Array.from(answersContainer.querySelectorAll('input'));
  const labels = Array.from(answersContainer.querySelectorAll('label'));
  const questionText = document.getElementById('question');

  const question = await getQuestion();

  if (question.answered === 'X') {
    questionText.textContent = '';
    printMessage(
      "Unfortunately, that's not the right answer 😟. Go again!",
      'alert-danger'
    );
    disableAllButtons();
  } else if (question.answered) {
    printMessage('Your answer is correct! Keep going! 👏', 'alert-success');
    disableAllButtons();
    await delayFunction(2000);
    location.reload();
  } else {
    setQuestionUI(question);
  }

  /**
   * Prints a message to the user, also style it accordingly
   * @param {string} message The message to print
   * @param {string} style Optional CSS/Bootstrap class
   */
  function printMessage(message, style = null) {
    const messageBox = document.querySelector('#message');
    messageBox.textContent = message;
    if (style) {
      messageBox.classList.add(style);
    }
  }

  async function renderSuccessEffect(rightAnswer) {
    const button = answersInputs.find(
      (answer) => answer.innerHTML === rightAnswer
    );
    // TODO
  }

  /**
   * Helper function to disable all buttons once the player answers a question wrong
   */
  function disableAllButtons() {
    const lifelinesInputs = Array.from(
      document.querySelector('#lifeline').querySelectorAll('input')
    );
    const submitBtn = document.querySelector('#confirm');

    lifelinesInputs.forEach((input) => (input.disabled = true));
    answersInputs.forEach((input) => (input.disabled = true));
    submitBtn.disabled = true;
  }

  /**
   * Fetches a question from the backend.
   * @returns {Object} The question returned from the backend.
   */
  async function getQuestion() {
    const response = await fetch('/question');
    const data = await response.json();
    return data;
  }

  /**
   * Renders a given question to the page form.
   * @param {{question:string, answers: string[]}} Data The question text and answers.
   */
  function setQuestionUI({ question, answers }) {
    questionText.innerHTML = question;

    answers.forEach((answer, i) => {
      answersInputs[i].value = answer;
      labels[i].innerHTML = answer;
    });
  }

  /**
   * A utility function to pause the execution of a function, to avoid API time constraint.
   * @param {number} delay The delay amount in ms.
   * @returns A promise that will resolve once the delay elapsed.
   */
  function delayFunction(delay) {
    return new Promise((resolve) => setTimeout(resolve, delay));
  }
});

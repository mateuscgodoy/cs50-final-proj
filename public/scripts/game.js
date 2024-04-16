document.addEventListener('DOMContentLoaded', async () => {
  const answersContainer = document.getElementById('answers');
  const answersInputs = Array.from(answersContainer.querySelectorAll('input'));
  const labels = Array.from(answersContainer.querySelectorAll('label'));
  const question = await getQuestion();

  if (!question.answered) {
    setQuestionUI(question);
  } else if (question.answered === 'X') {
    printMessage(
      "Unfortunately, that's not the right answer 😟. Go again!",
      'alert-danger'
    );
    disableAllButtons();
  } else {
    printMessage('Your answer is correct! Keep going! 👏', 'alert-success');
    // Set flashing green effect on the write answer

    // Print congratulations message
    // After the time period just refresh the page
    // the backend should be on the correct state to delivery a new question
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
    const questionText = document.getElementById('question');
    questionText.innerHTML = question;

    answers.forEach((answer, i) => {
      answersInputs[i].value = answer;
      labels[i].innerHTML = answer;
    });
  }
});

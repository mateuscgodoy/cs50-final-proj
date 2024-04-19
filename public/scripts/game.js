document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('form');

  form.addEventListener('submit', onSubmitAnswer);

  await fetchAndRenderQuestion();

  /**
   * Checks whether the answer selected by the user is correct,
   * dispatching the result on an Event called 'answerResult'
   * @param {EventTarget} event
   */
  async function onSubmitAnswer(event) {
    event.preventDefault();
    const selectedAnswer = document.querySelector(
      'input[name="answer"]:checked'
    );

    if (!selectedAnswer) return;

    try {
      const response = await fetch('/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer: selectedAnswer.value }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await response.json();
      const answerResultEvent = new CustomEvent('answerResult', {
        detail: { isCorrect: data.isCorrect },
      });
      document.dispatchEvent(answerResultEvent);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  }
});

document.addEventListener('answerResult', async (event) => {
  const { bgColor, message, style } = getAnswerUIInformation(
    event.detail.isCorrect
  );
  const selectedAnswer = document.querySelector('input[name="answer"]:checked');
  const answersContainer = document.getElementById('answers');
  const answersInputs = Array.from(answersContainer.querySelectorAll('input'));
  const submitBtn = document.querySelector('#confirm');
  const messageBox = document.querySelector('#message');

  toggleButtonsDisableState();
  printMessage(message, style);

  await renderAnswerLabelEffect();
  if (event.detail.isCorrect) {
    await fetchAndRenderQuestion();
    toggleButtonsDisableState();
    resetUI();
  } else {
    messageBox.innerHTML += "<a class='link' href='/'>Go again!</a>";
  }

  /**
   * Prints a message to the user, also style it accordingly
   * @param {string} message The message to print
   * @param {string} style Optional CSS/Bootstrap class
   */
  function printMessage(message, style = null) {
    messageBox.textContent = message;
    if (style) {
      messageBox.classList.add(style);
    }
  }

  async function renderAnswerLabelEffect() {
    let index = 0;
    const flash = setInterval(() => {
      selectedAnswer.parentNode.style.backgroundColor = bgColor[index];
      index = (index + 1) % bgColor.length;
    }, 500);
    await delayFunction(4000);
    clearInterval(flash);
    selectedAnswer.parentNode.style.backgroundColor = 'transparent';
  }

  function getAnswerUIInformation(isCorrect) {
    return {
      bgColor: isCorrect ? ['lightgreen', 'green'] : ['crimson', 'lightcoral'],
      message: isCorrect
        ? 'Your answer is correct! Keep going! 👏'
        : "Unfortunately, that's not the right answer 😟.",
      style: isCorrect ? 'alert-success' : 'alert-danger',
    };
  }

  /**
   * Helper function to disable all buttons once the player answers a question wrong
   */
  function toggleButtonsDisableState() {
    answersInputs.forEach((input) => (input.disabled = !input.disabled));
    submitBtn.disabled = !submitBtn.disabled;
  }

  function resetUI() {
    // Only called in a correct answer scenario.
    const { style } = getAnswerUIInformation(true);
    messageBox.textContent = '';
    messageBox.classList.remove(style);
    answersInputs.forEach((input) => (input.checked = false));
  }
});

async function fetchAndRenderQuestion() {
  const question = await getQuestion();
  setQuestionUI(question);
  startTimer(90);

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
    const answersContainer = document.getElementById('answers');
    const labels = Array.from(answersContainer.querySelectorAll('label'));
    const answersInputs = Array.from(
      answersContainer.querySelectorAll('input')
    );
    const questionText = document.getElementById('question');

    questionText.innerHTML = question;

    answers.forEach((answer, i) => {
      answersInputs[i].value = answer;
      labels[i].innerHTML = answer;
    });
  }

  function startTimer(duration) {
    const timerBar = document.querySelector('.timer-bar');
    const timerCounter = document.querySelector('.timer-counter');
    const timerIcon = document.querySelector('.timer-icon');

    let timeLeft = duration;
    const interval = 1000; // Update interval in milliseconds

    const timerInterval = setInterval(() => {
      timeLeft -= interval / 1000; // Convert milliseconds to seconds

      // Calculate width of timer bar
      const timerWidth = (timeLeft / duration) * 100;
      timerBar.style.width = timerWidth + '%';

      // Update timer counter
      const minutes = Math.floor(timeLeft / 60);
      const seconds = Math.floor(timeLeft % 60);
      timerCounter.textContent = `${minutes}:${
        seconds < 10 ? '0' : ''
      }${seconds}`;

      // Stop timer when time runs out
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerCounter.textContent = "time's up!";
        timerIcon.textContent = '⏰'; // Optionally change icon when time runs out
      }
    }, interval);
  }
}

/**
 * A utility function to pause the execution of a function, to avoid API time constraint.
 * @param {number} delay The delay amount in ms.
 * @returns A promise that will resolve once the delay elapsed.
 */
function delayFunction(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

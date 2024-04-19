'use strict';
const EVENTS = {
  result: 'answerResult',
  correct: 'answerIsCorrect',
  wrong: 'answerIsWrong',
  stopTimer: 'stopTimer',
  timesUp: 'timesUp',
  DOMLoaded: 'DOMContentLoaded',
};
const TIMER = 45;
const submitBtn = document.querySelector('#confirm');
const answersInputs = Array.from(
  document.querySelectorAll('.answer-div>input')
);

document.addEventListener(EVENTS.DOMLoaded, async () => {
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
      const answerResultEvent = new CustomEvent(EVENTS.result, {
        result: { isCorrect: data.isCorrect },
      });
      document.dispatchEvent(answerResultEvent);
      const resultEvent = data.isCorrect
        ? new CustomEvent(EVENTS.correct)
        : new CustomEvent(EVENTS.wrong);

      document.dispatchEvent(resultEvent);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  }
});

document.addEventListener(EVENTS.correct, async () => {
  const selectedAnswer = document.querySelector('input[name="answer"]:checked');

  toggleButtonsDisableState();
  const stopTimerEvent = new CustomEvent(EVENTS.stopTimer);
  document.dispatchEvent(stopTimerEvent);
  printMessage('Your answer is correct! Keep going! 👏', 'alert-success');
  await checkedAnswerEffect(selectedAnswer.parentElement, [
    'lightgreen',
    'green',
  ]);
  resetTimer();
  resetUI();
  fetchAndRenderQuestion();
  toggleButtonsDisableState();

  function resetUI() {
    const messageBox = document.querySelector('#message');
    messageBox.textContent = '';
    messageBox.classList.remove('alert-success');
    answersInputs.forEach((input) => (input.checked = false));
  }
});

document.addEventListener(EVENTS.wrong, () => {
  const selectedAnswer = document.querySelector('input[name="answer"]:checked');

  toggleButtonsDisableState();
  const stopTimerEvent = new CustomEvent(EVENTS.stopTimer);
  document.dispatchEvent(stopTimerEvent);
  printMessage(
    "Unfortunately, that's not the right answer 😟. <a class='link' href='/'>Go again!</a>",
    'alert-danger'
  );
  checkedAnswerEffect(selectedAnswer.parentElement, ['lightcoral', 'crimson']);
});

document.addEventListener(EVENTS.timesUp, (event) => {
  toggleButtonsDisableState();
  printMessage(
    "Unfortunately you ran out of time! 😟 <a class='link' href='/'>Go again!</a>",
    'alert-danger'
  );
});

/**
 * Fetches a new question and renders it to the page, also starting the timer
 */
async function fetchAndRenderQuestion() {
  const question = await getQuestion();
  setQuestionUI(question);
  startTimer(TIMER);

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
   * @param {{question:string, answers: string[], questionsAnswered: number}} Data The question text and answers.
   */
  function setQuestionUI({ question, answers, questionsAnswered }) {
    const answersContainer = document.getElementById('answers');
    const labels = Array.from(answersContainer.querySelectorAll('label'));
    const answersInputs = Array.from(
      answersContainer.querySelectorAll('input')
    );
    const questionText = document.getElementById('question');
    const levelText = document.querySelector('h5.featured');
    levelText.textContent = `Level ${questionsAnswered + 1}`;

    questionText.innerHTML = question;

    answers.forEach((answer, i) => {
      answersInputs[i].value = answer;
      labels[i].innerHTML = answer;
    });
  }

  /**
   * Starts the timer bar visual effect updating the timer counter, bar width and icons
   * @param {number} duration The timer counter value in ms.
   */
  function startTimer(duration) {
    const timerBar = document.querySelector('.timer-bar');
    const timerCounter = document.querySelector('.timer-counter');
    const timerIcon = document.querySelector('.timer-icon');

    let timeLeft = duration;
    const interval = 1000;

    const timerInterval = setInterval(() => {
      timeLeft -= interval / 1000;

      const timerWidth = (timeLeft / duration) * 100;
      timerBar.style.width = timerWidth + '%';

      const minutes = Math.floor(timeLeft / 60);
      const seconds = Math.floor(timeLeft % 60);
      timerCounter.textContent = `${minutes}:${
        seconds < 10 ? '0' : ''
      }${seconds}`;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        timerCounter.textContent = "time's up!";
        timerIcon.textContent = '❌';
        const timesUpEvent = new CustomEvent(EVENTS.timesUp);
        document.dispatchEvent(timesUpEvent);
      }
    }, interval);

    document.addEventListener(EVENTS.stopTimer, () => {
      clearInterval(timerInterval);
    });
  }
}

/**
 * Prints a message to the user, also style it accordingly
 * @param {string} message The message to print
 * @param {string} style Optional CSS/Bootstrap class
 */
function printMessage(message, style = null) {
  const messageBox = document.querySelector('#message');
  messageBox.innerHTML = message;
  if (style) {
    messageBox.classList.add(style);
  }
}

/**
 * Helper function to disable all buttons once the player answers a question wrong
 */
function toggleButtonsDisableState() {
  answersInputs.forEach((input) => (input.disabled = !input.disabled));
  submitBtn.disabled = !submitBtn.disabled;
}

/**
 * Side effect event that will flash the desired target background color.
 * @param {HTMLElement | null} element The target element
 * @param {string[]} bgColors An array of color names
 */
async function checkedAnswerEffect(element, bgColors) {
  let index = 0;
  const starterColor = element.style.backgroundColor || 'transparent';
  const flash = setInterval(() => {
    element.style.backgroundColor = bgColors[index];
    index = (index + 1) % bgColors.length;
  }, 500);
  await delayFunction(4000);
  clearInterval(flash);
  element.style.backgroundColor = starterColor;
}

/**
 * Helper function to reset the timer elements to it's initial state values.
 */
function resetTimer() {
  const timerBar = document.querySelector('.timer-bar');
  const timerCounter = document.querySelector('.timer-counter');
  const timerIcon = document.querySelector('.timer-icon');

  timerIcon.textContent = '⌛';
  timerCounter.textContent = '';
  timerBar.style.width = '100%';
}

/**
 * A utility function to pause the execution of a function, to avoid API time constraint.
 * @param {number} delay The delay amount in ms.
 * @returns A promise that will resolve once the delay elapsed.
 */
function delayFunction(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay));
}

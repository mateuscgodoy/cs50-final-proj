document.addEventListener('DOMContentLoaded', async () => {
  const question = await getQuestion();
  console.log(question);
  if (!question.answered) {
    setQuestionUI(question);
  } else if (question.answered === 'X') {
    // Process wrong
    // Disable all buttons
    // Print message in red
  } else {
    // Process correct
    // Set flashing green effect on the write answer
    // Print congratulations message
    // After the time period just refresh the page
    // the backend should be on the correct state to delivery a new question
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

    const answersContainer = document.getElementById('answers');
    const inputs = Array.from(answersContainer.querySelectorAll('input'));
    const labels = Array.from(answersContainer.querySelectorAll('label'));
    answers.forEach((answer, i) => {
      inputs[i].value = answer;
      labels[i].innerHTML = answer;
    });
  }
});

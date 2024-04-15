document.addEventListener('DOMContentLoaded', async () => {
  const question = await getQuestion();
  setQuestionUI(question);

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
      labels[i].textContent = answer;
    });
  }
});

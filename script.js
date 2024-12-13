const apiURL = "https://opentdb.com/api.php?amount=50&category=18&difficulty=medium&type=multiple"; 
let questions = [];
let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;
let timerInterval;
let timeRemaining = 30; // 30 seconds timer for each question

const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const checkBtn = document.getElementById("check-btn");
const nextBtn = document.getElementById("next-btn");
const scoreDisplay = document.getElementById("score");
const answerKey = document.getElementById("answer-key");
const answerList = document.getElementById("answer-list");
const timerDisplay = document.getElementById("timer");

// Fetch questions from the API
async function fetchQuestions() {
  try {
    const response = await fetch(apiURL);
    const data = await response.json();
    questions = data.results.map((item) => ({
      question: decodeHTML(item.question),
      correct_answer: decodeHTML(item.correct_answer),
      incorrect_answers: item.incorrect_answers.map(decodeHTML),
      correctAnswerCopy: decodeHTML(item.correct_answer),
      options: shuffleAnswers(item.incorrect_answers.map(decodeHTML), decodeHTML(item.correct_answer))
    }));
    loadQuestion();
  } catch (error) {
    console.error("Error fetching questions:", error);
    questionText.textContent = "Failed to load questions. Please try again later.";
  }
}

// Decode HTML entities in API responses
function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// Shuffle the answers so that the correct answer is mixed with the incorrect answers
function shuffleAnswers(incorrectAnswers, correctAnswer) {
  const answers = [...incorrectAnswers, correctAnswer]; // Add the correct answer to the array of incorrect answers
  return shuffleOptions(answers);
}

// Shuffle an array randomly using Fisher-Yates shuffle algorithm
function shuffleOptions(options) {
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]]; // Swap elements
  }
  return options;
}

// Load a question onto the page
function loadQuestion() {
  if (currentQuestion >= questions.length) {
    showAnswerKey();
    return;
  }

  const question = questions[currentQuestion];
  questionText.textContent = question.question;

  // Clear previous options
  optionsContainer.innerHTML = "";
  selectedAnswer = null; // Reset selected answer

  // Add each option as a button in a Bootstrap column
  question.options.forEach((option, index) => {
    const col = document.createElement("div");
    col.className = "col-md-6"; // Two options per row (adjust grid size as needed)

    const btn = document.createElement("button");
    btn.className = "btn btn-outline-primary option-btn";
    btn.textContent = option;
    btn.onclick = () => selectAnswer(btn, index);

    col.appendChild(btn);
    optionsContainer.appendChild(col);
  });

  // Enable "Check" button
  checkBtn.disabled = false;
  nextBtn.disabled = true;

  startTimer();
}

// Handle answer selection
function selectAnswer(button, index) {
  // Highlight selected answer
  const buttons = optionsContainer.querySelectorAll("button");
  buttons.forEach((btn) => btn.classList.remove("btn-primary", "active"));
  button.classList.add("btn-primary", "active");

  selectedAnswer = index; // Store the selected answer index
  checkBtn.disabled = false; // Enable the "Check" button
}

// Evaluate the selected answer and update the score
function checkAnswer() {
  if (selectedAnswer === null) return; // No answer selected

  const correctAnswer = questions[currentQuestion].options.indexOf(questions[currentQuestion].correctAnswerCopy);

  if (selectedAnswer === correctAnswer) {
    score++;
    scoreDisplay.textContent = `Score: ${score}`;
  }

  // Highlight correct and wrong answers
  const buttons = optionsContainer.querySelectorAll("button");
  buttons.forEach((btn, index) => {
    btn.disabled = true;
    if (index === correctAnswer) {
      btn.classList.add("btn-success");
    } else if (index === selectedAnswer) {
      btn.classList.add("btn-danger");
    }
  });

  nextBtn.disabled = false; // Enable "Next" button after checking the answer
  stopTimer(); // Stop the timer when answer is checked
}

// Move to the next question
function nextQuestion() {
  currentQuestion++;
  loadQuestion();
  resetTimer();
}

// Show the answer key at the end of the quiz
function showAnswerKey() {
  questionText.textContent = "Quiz Completed!";
  optionsContainer.style.display = "none";
  checkBtn.style.display = "none";
  nextBtn.style.display = "none";

  answerKey.style.display = "block";
  questions.forEach((question, index) => {
    const li = document.createElement("li");
    li.className = "answer-item";
    li.textContent = `${index + 1}. ${question.question} - Correct Answer: ${
      question.correctAnswerCopy
    }`;
    answerList.appendChild(li);
  });
}

// Timer functions
function startTimer() {
  timeRemaining = 30; // Reset the timer to 30 seconds for each question
  timerDisplay.textContent = formatTime(timeRemaining);

  timerInterval = setInterval(() => {
    timeRemaining--;
    timerDisplay.textContent = formatTime(timeRemaining);

    if (timeRemaining <= 0) {
      stopTimer();
      nextQuestion();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function resetTimer() {
  stopTimer();
  startTimer();
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

// Initialize the quiz
fetchQuestions();

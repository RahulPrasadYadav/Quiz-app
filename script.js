 // JavaScript Code
 let currentQuestion = 0;
 let score = 0;
 let timeLeft = 300;
 let timerId;
 let questions = [];
 let streak = 0;
 let powerups = {
     doublePoints: 1,
     timeFreeze: 2
 };

 // Theme Toggle
 function toggleTheme() {
     document.body.classList.toggle('light-theme');
     const themeToggle = document.querySelector('.theme-toggle');
     themeToggle.textContent = document.body.classList.contains('light-theme') ? '🌞' : '🌙';
     localStorage.setItem('quizTheme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
 }

 // Initialize Theme
 function initializeTheme() {
     const savedTheme = localStorage.getItem('quizTheme');
     if (savedTheme === 'light') {
         document.body.classList.add('light-theme');
         document.querySelector('.theme-toggle').textContent = '🌞';
     }
 }

 // Power-up System
 function usePowerup(type) {
     switch (type) {
         case 'doublePoints':
             if (powerups.doublePoints > 0) {
                 powerups.doublePoints--;
                 const originalMultiplier = 2;
                 const duration = 10000;

                 const powerupElement = document.querySelector(`.powerup[onclick*="${type}"]`);
                 powerupElement.style.opacity = '0.5';
                 powerupElement.style.pointerEvents = 'none';

                 const originalScore = score;
                 const doublePointsEffect = setInterval(() => {
                     score = originalScore + (score - originalScore) * 2;
                 }, 100);

                 setTimeout(() => {
                     clearInterval(doublePointsEffect);
                     powerupElement.style.opacity = '1';
                     powerupElement.style.pointerEvents = 'all';
                     showFeedback('Double Points Ended!');
                 }, duration);

                 showFeedback('Double Points Activated! ✨');
             }
             break;

         case 'timeFreeze':
             if (powerups.timeFreeze > 0) {
                 powerups.timeFreeze--;
                 timeLeft += 30;
                 document.getElementById('timer').textContent =
                     `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

                 const powerupElement = document.querySelector(`.powerup[onclick*="${type}"]`);
                 powerupElement.style.opacity = '0.5';
                 powerupElement.style.pointerEvents = 'none';

                 setTimeout(() => {
                     powerupElement.style.opacity = '1';
                     powerupElement.style.pointerEvents = 'all';
                     showFeedback('Time Freeze Available Again!');
                 }, 30000);

                 showFeedback('+30 Seconds Added! ⏱️');
             }
             break;  
     }
 }

 // Rest of the JavaScript code remains the same
 // ... [Previous JavaScript Code Here] ...

 // Initialize theme on load
 async function fetchQuestions() {
const apiUrl = "https://opentdb.com/api.php?amount=10&type=multiple";
try {
 const response = await fetch(apiUrl);
 const data = await response.json();
 questions = data.results.map(q => ({
     question: decodeHTML(q.question),
     options: [...q.incorrect_answers.map(decodeHTML), 
             decodeHTML(q.correct_answer)].sort(() => Math.random() - 0.5),
     correct: decodeHTML(q.correct_answer)
 }));
} catch (error) {
 console.error("Error fetching questions:", error);
}
}

function decodeHTML(html) {
const txt = document.createElement('textarea');
txt.innerHTML = html;
return txt.value;
}

async function startGame() {
await fetchQuestions();
document.getElementById('startScreen').classList.add('hidden');
document.getElementById('quizHeader').classList.remove('hidden');
document.getElementById('quizCard').classList.remove('hidden');
startTimer();
showQuestion();
}

function startTimer() {
timerId = setInterval(() => {
 timeLeft--;
 document.getElementById('timer').textContent = 
     `${Math.floor(timeLeft/60).toString().padStart(2,'0')}:${(timeLeft%60).toString().padStart(2,'0')}`;
 
 if(timeLeft <= 0) endQuiz();
}, 1000);
}

function showQuestion() {
const question = questions[currentQuestion];
document.getElementById('question').textContent = question.question;

const optionsHtml = question.options.map((option, index) => `
 <label class="option-label">
     <input type="radio" name="answer" value="${option}">
     <span class="radio-input"></span>
     <span>${option}</span>
 </label>
`).join('');

document.getElementById('options').innerHTML = optionsHtml;
updateProgress();
updateButtons();
}

function validateAnswer() {
const selected = document.querySelector('input[name="answer"]:checked');
if (!selected) return false;

const options = document.querySelectorAll('.option-label');
const correct = questions[currentQuestion].correct;

options.forEach(option => {
 const value = option.querySelector('span:last-child').textContent;
 if (value === correct) {
     option.classList.add('correct');
 } else if (value === selected.value) {
     option.classList.add('wrong');
 }
 option.style.pointerEvents = 'none';
});

if (selected.value === correct) {
 score += 100;
 document.getElementById('score').textContent = score;
}

return true;
}

function updateProgress() {
const progress = ((currentQuestion + 1) / questions.length) * 100;
document.getElementById('progressBar').style.width = `${progress}%`;
}

function nextQuestion() {
if (!validateAnswer()) return;

if(currentQuestion < questions.length - 1) {
 currentQuestion++;
 showQuestion();
} else {
 endQuiz();
}
}

function previousQuestion() {
if(currentQuestion > 0) {
 currentQuestion--;
 showQuestion();
}
}

function updateButtons() {
document.getElementById('prevBtn').disabled = currentQuestion === 0;
document.getElementById('nextBtn').textContent = 
 currentQuestion === questions.length - 1 ? 'Submit Final Answer' : 'Next Question';
}

function endQuiz() {
clearInterval(timerId);
document.getElementById('quizCard').classList.add('hidden');
document.getElementById('resultContainer').classList.remove('hidden');
document.getElementById('finalScore').textContent = score;
createConfetti();
}

function createConfetti() {
for(let i = 0; i < 100; i++) {
 const confetti = document.createElement('div');
 confetti.className = 'confetti';
 confetti.style.left = Math.random() * 100 + 'vw';
 confetti.style.background = `hsl(${Math.random() * 360}, 70%, 50%)`;
 confetti.style.animationDelay = Math.random() * 2 + 's';
 document.body.appendChild(confetti);
}
}

function restartQuiz() {
currentQuestion = 0;
score = 0;
timeLeft = 300;
document.getElementById('resultContainer').classList.add('hidden');
document.getElementById('quizCard').classList.remove('hidden');
document.getElementById('score').textContent = '0';
document.querySelectorAll('.confetti').forEach(c => c.remove());
startTimer();
showQuestion();
}
 initializeTheme();
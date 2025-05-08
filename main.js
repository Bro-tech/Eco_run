// 🚗 Emission Rates
const emissionRates = {
  car: 0.21,
  motorbike: 0.11,
  bus: 0.089,
  train: 0.041,
  scooter: 0.035,
  airplane: 0.25,
  walking: 0.0
};

// Elements
const form = document.getElementById('ecoForm');
const result = document.getElementById('result');
const tips = document.getElementById('tips');
const badge = document.getElementById('badge');
const shareBtn = document.getElementById('shareBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const backToTop = document.getElementById('backToTop');
const leaderboardList = document.getElementById('leaderboardList');
const ctx = document.getElementById('impactChart').getContext('2d');
const postForm = document.getElementById('postForm');
const postList = document.getElementById('postList');
const ecoTipsSection = document.getElementById('ecoTips');

// Chart instance
let chart;

// 🌑 Theme Persistence
const currentTheme = localStorage.getItem('theme');
if (currentTheme === 'dark') document.body.classList.add('dark');
darkModeToggle.checked = currentTheme === 'dark';
darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark');
  const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
});

// 🌑 Dark Mode Text Color Toggle
darkModeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark');
  const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);

  // Toggle text color
  const textColor = theme === 'dark' ? 'black' : '';
  document.body.style.color = textColor;
});

// 🧮 Main Form Logic
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const weight = parseFloat(document.getElementById('weight').value);
  const distance = parseFloat(document.getElementById('distance').value);
  const time = parseFloat(document.getElementById('time').value);
  const vehicle = document.getElementById('vehicle').value;

  const co2Saved = emissionRates[vehicle] * distance;
  const speed = distance / (time / 60); // km/h
  const caloriesBurned = (0.035 * weight + (Math.pow(speed, 2) / 1800) * 0.029 * weight) * time;

  // 🖼️ Display Result
  result.innerHTML = `
    <h3>Results for ${name} 🌿</h3>
    <p><strong>CO₂ Saved:</strong> ${co2Saved.toFixed(2)} kg</p>
    <p><strong>Calories Burned:</strong> ${caloriesBurned.toFixed(0)} kcal</p>
  `;

  showTip(vehicle);
  handleBadge(co2Saved);
  setupShareButton(name, co2Saved, caloriesBurned);
  updateLeaderboard(name, co2Saved);
  updateImpactChart(co2Saved);

  // Update "Your Impact" section
  updateYourImpact(distance, co2Saved);

  // Update Progress (simple: assume 10kg CO₂ goal)
  updateProgressBar(Math.min((co2Saved / 10) * 100, 100));
});

// 🌟 Eco Tip
function showTip(vehicle) {
  const ecoTip = {
    car: "Try biking short distances instead of driving! 🚲",
    motorbike: "Switch to public transport! 🚌",
    bus: "Great! Trains are even better. 🚆",
    train: "Awesome! Trains rock. 🚄",
    scooter: "Scootering is light, walking is lighter! 🚶",
    airplane: "Choose rail travel when possible. 🚂",
    walking: "Walking is already perfect! 🌱"
  };
  tips.innerHTML = `<p>🌟 Tip: ${ecoTip[vehicle]}</p>`;
}

// 🏅 Badge System
function handleBadge(co2Saved) {
  if (co2Saved > 5) {
    badge.innerHTML = `🏆 Eco Champion: 5kg CO₂ Saved!`;
  } else if (co2Saved > 1) {
    badge.innerHTML = `🏅 Achievement: 1kg CO₂ Saved!`;
  } else {
    badge.innerHTML = '';
  }
}

// 📤 Share Achievement
function setupShareButton(name, co2Saved, caloriesBurned) {
  shareBtn.style.display = 'block';
  shareBtn.onclick = () => {
    const text = `${name} saved ${co2Saved.toFixed(2)}kg CO₂ and burned ${caloriesBurned.toFixed(0)}kcal with EcoRun! 🌍`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
      showToast('Copied to clipboard! 📋');
    }
  };
}

// 📈 Chart Update
function updateImpactChart(co2Saved) {
  const data = {
    labels: ['CO₂ Emitted', 'CO₂ Saved'],
    datasets: [{
      label: 'CO₂ Impact (kg)',
      data: [0, co2Saved], // Corrected the data order
      backgroundColor: ['#ff6b6b', '#4caf50']
    }]
  };

  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    }
  });
}

// 🏆 Leaderboard
function updateLeaderboard(name, co2Saved) {
  const listItem = document.createElement('li');
  listItem.textContent = `${name}: ${co2Saved.toFixed(2)} kg CO₂ saved`;
  leaderboardList.appendChild(listItem);

  const entries = leaderboardList.querySelectorAll('li');
  if (entries.length > 25) {
    leaderboardList.removeChild(entries[0]);
  }
}

// ✍️ Posts
postForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const content = document.getElementById('postContent').value;
  createPost(content);
  postForm.reset();
});

// Create Post
function createPost(content) {
  const postItem = document.createElement('li');
  postItem.classList.add('post');

  const postContent = document.createElement('div');
  postContent.classList.add('post-content');
  postContent.textContent = content;

  const postActions = document.createElement('div');
  postActions.classList.add('post-actions');

  let likes = 0;
  const likeCount = document.createElement('span');
  likeCount.textContent = `❤️ ${likes}`;

  const likeBtn = document.createElement('button');
  likeBtn.textContent = 'Like';
  likeBtn.addEventListener('click', () => {
    likes++;
    likeCount.textContent = `❤️ ${likes}`;
  });

  postActions.appendChild(likeCount);
  postActions.appendChild(likeBtn);

  postItem.appendChild(postContent);
  postItem.appendChild(postActions);

  postList.appendChild(postItem);
}

// 🍞 Toast Notifications
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast show';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  }, 3000);
}

// 📈 Progress Bar
function updateProgressBar(percent) {
  const progressBar = document.querySelector('.progress-bar');
  progressBar.style.width = percent + '%';
}

// ⬆️ Back to Top
window.addEventListener('scroll', () => {
  backToTop.style.display = window.scrollY > 300 ? 'block' : 'none';
});

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 🌍 Eco Tips Toggle
document.getElementById('showTips').addEventListener('click', () => {
  const ecoTipsSection = document.getElementById('ecoTips');
  if (ecoTipsSection.style.display === 'none' || !ecoTipsSection.style.display) {
    ecoTipsSection.style.display = 'block';
    ecoTipsSection.innerHTML = `
      <h4>🌱 15 Ways to Help the Environment</h4>
      <ul>
        <li>Walk or bike for short distances</li>
        <li>Turn off lights when not needed</li>
        <li>Use reusable water bottles</li>
        <li>Recycle paper, plastic, and glass</li>
        <li>Unplug devices</li>
        <li>Plant trees</li>
        <li>Support local produce</li>
        <li>Use public transport</li>
        <li>Take shorter showers</li>
        <li>Compost kitchen waste</li>
        <li>Switch to LEDs</li>
        <li>Use cloth shopping bags</li>
        <li>Eat more plants</li>
        <li>Buy second-hand goods</li>
        <li>Educate your friends 🌍</li>
      </ul>
    `;
  } else {
    ecoTipsSection.style.display = 'none';
  }
});

// Eco Calendar Data
const ecoDays = [
  { date: 'April 22', event: '🌍 Earth Day' },
  { date: 'March 21', event: '🌳 International Day of Forests' },
  { date: 'June 5', event: '🌱 World Environment Day' },
  { date: 'September 16', event: '🛡️ World Ozone Day' },
  { date: 'December 5', event: '🌾 World Soil Day' }
];

// Render Events
const ecoEventsList = document.getElementById('ecoEvents');

ecoDays.forEach(day => {
  const li = document.createElement('li');
  li.textContent = `${day.date} - ${day.event}`;
  ecoEventsList.appendChild(li);
});


// 🌑 Dark Mode Fix & Persistence
// Apply saved theme on load
if (currentTheme === 'dark') {
  document.body.classList.add('dark');
}

// Toggle theme & save preference
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
  localStorage.setItem('theme', theme);
});


// Back to Top Button Logic
window.onscroll = function () {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    backToTop.style.display = "block";
  } else {
    backToTop.style.display = "none";
  }
};

backToTop.addEventListener("click", function () {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Show Toast Notification
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 4000);
}


// Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function () {
  // Create the container
  const container = document.createElement('div');
  container.className = 'floating-buttons';
  container.style.position = 'fixed';
  container.style.top = '100px';
  container.style.right = '24px';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '12px';
  container.style.zIndex = '1000';

  // Common button style
  const buttonStyle = `
    padding: 14px 20px;
    background: linear-gradient(135deg, #4caf50, #2e7d32);
    color: #fff;
    font-weight: 600;
    font-size: 15px;
    border: none;
    border-radius: 12px;
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    transition: all 0.3s ease;
    text-align: center;
    text-decoration: none;
    display: inline-block;
  `;

  // Create Live Emission Site link button
  const linkBtn = document.createElement('a');
  linkBtn.href = 'https://app.electricitymaps.com/map/72h/hourly';
  linkBtn.target = '_blank';
  linkBtn.rel = 'noopener noreferrer';
  linkBtn.innerText = 'Live Emission Site';
  linkBtn.style.cssText = buttonStyle;

  // Add hover effect
  linkBtn.addEventListener('mouseover', () => {
    linkBtn.style.background = 'linear-gradient(135deg, #2e7d32, #1b5e20)';
    linkBtn.style.transform = 'translateY(-2px) scale(1.05)';
  });

  linkBtn.addEventListener('mouseout', () => {
    linkBtn.style.background = 'linear-gradient(135deg, #4caf50, #2e7d32)';
    linkBtn.style.transform = 'none';
  });

  // Add the button to the container
  container.appendChild(linkBtn);

  // Append the container to the body
  document.body.appendChild(container);
});

// Streak System
// Initialize streak count
function updateStreak() {
  const lastDate = localStorage.getItem('lastSubmissionDate');
  const streak = parseInt(localStorage.getItem('streak') || '0');
  const today = new Date().toLocaleDateString();

  if (lastDate === today) return; // Already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toLocaleDateString();

  const newStreak = lastDate === yesterdayStr ? streak + 1 : 1;

  localStorage.setItem('lastSubmissionDate', today);
  localStorage.setItem('streak', newStreak);
  document.getElementById('streakCount').textContent = newStreak;
}

// Call after form submission
form.addEventListener('submit', (e) => {
  e.preventDefault();
  updateStreak();
});


// Avatar Selection
const avatarStyle = document.getElementById('avatarStyle');
const avatarPreview = document.createElement('img');
avatarPreview.id = 'avatarPreview';
document.querySelector('.avatar-builder').appendChild(avatarPreview);

const avatarImages = {
  runner: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExaDI0NWwzMzBtamZ3ZmdqMGp5MHhpOHVvZTA0aXZ1NHN6cGk1ajl5eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/7O2cJd5JOz6Fv5omkk/giphy.gif',
  biker: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYTd4Y2hpNmx5MHNzbjZoeDI5eWlvMjF3OGp2YTRndWM5a3BybTcyayZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XqKH6GqYatE63lmD2D/giphy.gif',
  walker: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGttM3FmeXRlcnBpbXl6dDc5cmhvaGI4bXdzcHF1ZXIzMXUwajhhNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/N7RnbJdubuA8Wza1Qb/giphy.gif',
  ecoHero: 'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeXBucXNoa2t0d3l6Y29zMWwwcXBzN2lneW90czl1NmNhcXJvcDRrNiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/UBBJYj7kgrRpOOdwrv/giphy.gif',
  hiker: 'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExYm45Mjk0MGdrcjU1ZGp1MG16NW1lMW9nanFncmRmZW8zN2dqd2JkaiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/xT0BKGMJhmhF28DYCk/giphy.gif'
};

avatarStyle.addEventListener('change', () => {
  const selected = avatarStyle.value;
  avatarPreview.src = avatarImages[selected];
  localStorage.setItem('avatarStyle', selected);
});

// Set default avatar if not stored
const savedAvatar = localStorage.getItem('avatarStyle') || 'runner';
avatarStyle.value = savedAvatar;
avatarPreview.src = avatarImages[savedAvatar];

// Update avatar image when dropdown changes
avatarStyle.addEventListener('change', () => {
  const selected = avatarStyle.value;
  avatarPreview.src = avatarImages[selected];
  localStorage.setItem('avatarStyle', selected);
});

// Progress Bar Logic
document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.getElementById("progressBar");
  const currentProgress = document.getElementById("currentProgress");
  const userProgressInput = document.getElementById("userProgress");
  const updateProgressButton = document.getElementById("updateProgress");

  // Weekly goal in kilometers
  const weeklyGoal = 20;

  // Update progress bar based on user input
  updateProgressButton.addEventListener("click", () => {
    const userProgress = parseFloat(userProgressInput.value);

    // Validate input
    if (isNaN(userProgress) || userProgress < 0 || userProgress > weeklyGoal) {
      alert("Please enter a valid number between 0 and 20.");
      return;
    }

    // Calculate progress percentage
    const progressPercentage = (userProgress / weeklyGoal) * 100;

    // Update progress bar and text
    progressBar.style.width = `${progressPercentage}%`;
    currentProgress.textContent = userProgress;

    // Clear input field
    userProgressInput.value = "";
  });
});

// Ensure the website opens in light mode by default
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('dark'); // Remove dark mode class
  document.body.classList.add('light'); // Add light mode class
});

// Update the "Your Impact" section dynamically
function updateYourImpact(distance, co2Saved) {
  const totalDistanceElement = document.getElementById('totalDistance');
  const co2SavedElement = document.getElementById('co2Saved');
  const treesEquivalentElement = document.getElementById('treesEquivalent');

  // Update total distance
  const currentDistance = parseFloat(totalDistanceElement.textContent) || 0;
  const newDistance = currentDistance + distance;
  totalDistanceElement.textContent = newDistance.toFixed(2);

  // Update CO₂ saved
  const currentCo2Saved = parseFloat(co2SavedElement.textContent) || 0;
  const newCo2Saved = currentCo2Saved + co2Saved;
  co2SavedElement.textContent = newCo2Saved.toFixed(2);

  // Update trees equivalent (1 tree = 21kg CO₂ saved)
  const treesEquivalent = newCo2Saved / 21;
  treesEquivalentElement.textContent = treesEquivalent.toFixed(2);
}

// Eco Trivia Game Logic
const ecoTriviaQuestions = [
  {
    question: "What is the most eco-friendly mode of transportation?",
    answers: ["Car", "Bicycle", "Airplane", "Train"],
    correct: 1
  },
  {
    question: "How much CO₂ does a tree absorb per year on average?",
    answers: ["10kg", "21kg", "50kg", "100kg"],
    correct: 1
  },
  {
    question: "Which of these is a renewable energy source?",
    answers: ["Coal", "Solar", "Natural Gas", "Oil"],
    correct: 1
  }
];

let currentQuestionIndex = 0;
let score = 0;

const startGameButton = document.getElementById("startGame");
const gameContainer = document.getElementById("gameContainer");
const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");
const nextQuestionButton = document.getElementById("nextQuestion");
const scoreElement = document.getElementById("score");

startGameButton.addEventListener("click", () => {
  startGameButton.style.display = "none";
  gameContainer.style.display = "block";
  loadQuestion();
});

function loadQuestion() {
  const currentQuestion = ecoTriviaQuestions[currentQuestionIndex];
  questionElement.textContent = currentQuestion.question;
  answersElement.innerHTML = "";

  currentQuestion.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.textContent = answer;
    button.addEventListener("click", () => checkAnswer(index));
    answersElement.appendChild(button);
  });
}

function checkAnswer(selectedIndex) {
  const currentQuestion = ecoTriviaQuestions[currentQuestionIndex];
  if (selectedIndex === currentQuestion.correct) {
    score++;
  }

  currentQuestionIndex++;

  if (currentQuestionIndex < ecoTriviaQuestions.length) {
    loadQuestion();
  } else {
    endGame();
  }
}

function endGame() {
  questionElement.style.display = "none";
  answersElement.style.display = "none";
  nextQuestionButton.style.display = "none";
  scoreElement.style.display = "block";
  scoreElement.textContent = `You scored ${score} out of ${ecoTriviaQuestions.length}!`;
}

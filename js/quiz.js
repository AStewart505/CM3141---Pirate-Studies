const questions = [
  // Section 1 (Q1–Q5)
  { text: "You like working on backend more than frontend", type: "hacker" },
  { text: "You prefer working in a team over working alone", type: "hipster" },
  { text: "You are more interested in building products than in selling them", type: "hustler" },
  { text: "You like to experiment with new technologies", type: "hacker" },
  { text: "You are more interested in design than in functionality", type: "hipster" },

  // Section 2 (Q6–Q10)
  { text: "You are more motivated by money than by passion", type: "hustler" },
  { text: "You are more interested in learning than in teaching", type: "hacker" },
  { text: "You are more interested in the process than in the outcome", type: "hipster" },
  { text: "You are more interested in building than in breaking", type: "hustler" },
  { text: "You are more interested in solving problems than in creating them", type: "hacker" },

  // Section 3 (Q11–Q15)
  { text: "You are always looking into new trends", type: "hipster" },
  { text: "You are more interested in creating than in consuming", type: "hustler" },
  { text: "You are more interested in innovation than in tradition", type: "hacker" },
  { text: "You are more interested in the future than in the past", type: "hipster" },
  { text: "You are more interested in results than in effort", type: "hustler" }
];

const QUESTIONS_PER_PAGE = 5;
const TOTAL_PAGES = Math.ceil(questions.length / QUESTIONS_PER_PAGE);

let currentPage = 0; // 0,1,2

// Store answers 1..5 per question
let answers = new Array(questions.length).fill(null);

const quizContainer = document.getElementById("quiz");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");
const progress = document.getElementById("progress");
const pageIndicator = document.getElementById("pageIndicator"); // optional (exists in your HTML update)

function renderPage() {
  quizContainer.innerHTML = "";

  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, questions.length);

  // Optional page indicator (only works if the element exists)
  if (pageIndicator) {
    pageIndicator.innerText = `Page ${currentPage + 1} of ${TOTAL_PAGES}`;
  }

  // Render 5 questions
  for (let i = startIndex; i < endIndex; i++) {
    const q = questions[i];

    const block = document.createElement("div");
    block.classList.add("questionBlock");

    const qText = document.createElement("h2");
    qText.innerText = q.text || `Question ${i + 1} placeholder...`;

    const options = document.createElement("div");
    options.classList.add("options");

    const scale = document.createElement("div");
    scale.classList.add("scale");

    // Create 5 circles
    for (let value = 1; value <= 5; value++) {
      const circle = document.createElement("div");
      circle.classList.add("circle");
      circle.setAttribute("data-value", value);

      // Restore selection
      if (answers[i] === value) {
        circle.classList.add("selected");
      }

      circle.addEventListener("click", () => {
  answers[i] = value;

  // remove selected from siblings
  const allCircles = scale.querySelectorAll(".circle");
  allCircles.forEach(c => c.classList.remove("selected"));

  // add only to clicked one
  circle.classList.add("selected");
});

      scale.appendChild(circle);
    }

    // Labels under circles (always visible)
    const labels = document.createElement("div");
    labels.classList.add("labels");
    labels.innerHTML = `
      <span>Strongly<br>Disagree</span>
      <span>Disagree</span>
      <span>Neutral</span>
      <span>Agree</span>
      <span>Strongly<br>Agree</span>
    `;

    options.appendChild(scale);
    options.appendChild(labels);

    block.appendChild(qText);
    block.appendChild(options);

    quizContainer.appendChild(block);
  }

  updateProgress();
  updateButtons();
}

function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
}
function updateButtons() {
  backBtn.style.visibility = currentPage === 0 ? "hidden" : "visible";

  const isLastPage = currentPage === TOTAL_PAGES - 1;
  nextBtn.style.display = isLastPage ? "none" : "inline-block";
  submitBtn.style.display = isLastPage ? "inline-block" : "none";
}

function updateProgress() {
  // progress based on pages (3 pages total)
  const percent = ((currentPage + 1) / TOTAL_PAGES) * 100;
  progress.style.width = percent + "%";
}

function pageAnswered(pageIndex) {
  const startIndex = pageIndex * QUESTIONS_PER_PAGE;
  const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, questions.length);

  for (let i = startIndex; i < endIndex; i++) {
    if (answers[i] === null) return false;
  }
  return true;
}

// Next button (go to next page only if current page answered)
nextBtn.addEventListener("click", () => {
  if (!pageAnswered(currentPage)) {
    alert("Please answer all 5 questions before continuing.");
    return;
  }
  currentPage++;
  renderPage();
  scrollToTop();
});

// Back button
backBtn.addEventListener("click", () => {
  currentPage--;
  renderPage();
  scrollToTop();
});

// Submit button (only on last page)
submitBtn.addEventListener("click", () => {
  if (!pageAnswered(currentPage)) {
    alert("Please answer all 5 questions before submitting.");
    return;
  }
  calculateResult();
});

// Helper to display nice names if we ever need it
function titleCase(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function calculateResult() {
  let scores = { hacker: 0, hipster: 0, hustler: 0 };

  answers.forEach((value, index) => {
    const type = questions[index].type;
    scores[type] += value; // value is 1..5
  });

  // Determine the max score and handle ties
  const maxScore = Math.max(scores.hacker, scores.hipster, scores.hustler);
  const topTypes = Object.keys(scores).filter(t => scores[t] === maxScore);

  let finalCharacter = "";
  let description = "";






  // 3-way tie -> Unicorn
  if (topTypes.length === 3) {
    finalCharacter = "Unicorn";
    description = "Which means you are a Hacker, a Hipster, and a Hustler.";
  }
  // 2-way tie -> combos
  else if (topTypes.length === 2) {
    const pair = topTypes.sort().join("+");

    const comboMap = {
      "hacker+hustler": "Growth Hacker",
      "hacker+hipster": "Tech Hipster",
      "hipster+hustler": "Creative Entrepreneur"
    };

    finalCharacter = comboMap[pair] || topTypes.map(titleCase).join(" & ");

    // Add the simple “which means…” line for each combo
    if (pair === "hacker+hustler") {
      description = "Which means you are both a Hacker and a Hustler.";
    } else if (pair === "hacker+hipster") {
      description = "Which means you are both a Hacker and a Hipster.";
    } else if (pair === "hipster+hustler") {
      description = "Which means you are both a Hipster and a Hustler.";
    }
  }
  // Single winner -> base character (keep these explanations)
  else {
    const winner = topTypes[0]; // hacker / hipster / hustler
    finalCharacter = titleCase(winner);

    if (winner === "hacker") {
      description = "You’re analytical and love solving problems by understanding how things work.";
    } else if (winner === "hipster") {
      description = "You’re creative and care about making things feel smooth, unique, and user-friendly.";
    } else {
      description = "You’re action-focused and thrive on getting things done quickly and effectively.";
    }
  }

  // decide which image to show
let imageName = finalCharacter.toLowerCase().replace(/ /g, "-");

// special cases to match file names
if (finalCharacter === "Hacker") imageName = "hacker_img";
if (finalCharacter === "Hipster") imageName = "hipster_img";
if (finalCharacter === "Hustler") imageName = "hustler_img";
if (finalCharacter === "Growth Hacker") imageName = "growth-hacker_img";
if (finalCharacter === "Tech Hipster") imageName = "tech-hipster_img";
if (finalCharacter === "Creative Entrepreneur") imageName = "creative-entrepreneur_img";
if (finalCharacter === "Unicorn") imageName = "unicorn_img";

if(finalCharacter === "Growth Hacker" || finalCharacter === "Tech Hipster" || finalCharacter === "Creative Entrepreneur")
  {
    document.querySelector(".container").innerHTML =
    `<img class="result-image large" src="images/quizResult/${imageName}.jpg" alt="${finalCharacter}">
    <h2>You are a ${finalCharacter}!</h2>
    <p>${description}</p>
    `;
  }
else
  {
    document.querySelector(".container").innerHTML =
    `<img class="result-image" src="images/quizResult/${imageName}.jpg" alt="${finalCharacter}">
    <h2>You are a ${finalCharacter}!</h2>
    <p>${description}</p>
    `;
  }
}

// Initial render
renderPage();
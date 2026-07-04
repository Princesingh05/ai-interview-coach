const roleEl = document.querySelector("#role");
const typeEl = document.querySelector("#interviewType");
const contextEl = document.querySelector("#context");
const startBtn = document.querySelector("#startBtn");
const resetBtn = document.querySelector("#resetBtn");
const evaluateBtn = document.querySelector("#evaluateBtn");
const nextBtn = document.querySelector("#nextBtn");
const voiceBtn = document.querySelector("#voiceBtn");
const downloadBtn = document.querySelector("#downloadBtn");
const questionText = document.querySelector("#questionText");
const questionTag = document.querySelector("#questionTag");
const difficultyTag = document.querySelector("#difficultyTag");
const sessionTitle = document.querySelector("#sessionTitle");
const answerEl = document.querySelector("#answer");
const scoreBadge = document.querySelector("#scoreBadge");
const scoreBars = document.querySelector("#scoreBars");
const strengthsEl = document.querySelector("#strengths");
const improvementsEl = document.querySelector("#improvements");
const sampleAnswerEl = document.querySelector("#sampleAnswer");
const feedbackEmpty = document.querySelector("#feedbackEmpty");
const feedbackContent = document.querySelector("#feedbackContent");
const questionCount = document.querySelector("#questionCount");
const averageScore = document.querySelector("#averageScore");
const timer = document.querySelector("#timer");
const reportStatus = document.querySelector("#reportStatus");
const reportList = document.querySelector("#reportList");

const roleTopics = {
  "Software Engineer": ["DSA", "OOP", "DBMS", "Operating Systems", "Project"],
  "Backend Developer": ["APIs", "Databases", "Authentication", "Caching", "Scalability"],
  "Frontend Developer": ["React", "JavaScript", "Accessibility", "State Management", "Performance"],
  "Data Analyst": ["SQL", "EDA", "Dashboards", "Statistics", "Business Insight"],
  "Java Developer": ["Java", "OOP", "Collections", "Spring Basics", "SQL"],
  "Full Stack Developer": ["Frontend", "Backend", "Database", "Deployment", "System Design"]
};

const baseQuestions = {
  hr: [
    "Tell me about yourself and connect your background to this role.",
    "Describe a time you learned a new technology quickly.",
    "What is your biggest strength as a fresh graduate?",
    "Tell me about a challenge you faced in a project and how you handled it."
  ],
  technical: [
    "Explain the difference between an array and a linked list, and when you would use each.",
    "What are the main principles of object-oriented programming?",
    "How would you design a database schema for a simple interview practice platform?",
    "Explain REST APIs and the meaning of common HTTP status codes."
  ],
  project: [
    "Walk me through your best project from problem statement to final outcome.",
    "What was your specific contribution in the project?",
    "Which technical decision in your project would you improve today?",
    "How did you test or validate your project?"
  ]
};

let state = {
  questions: [],
  index: 0,
  answers: [],
  startedAt: null,
  timerId: null
};

function extractKeywords(text) {
  return [...new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9+#. ]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .filter((word) => !["with", "that", "this", "from", "have", "will", "your"].includes(word))
  )].slice(0, 8);
}

function buildQuestions(role, type, context) {
  const topics = roleTopics[role] || roleTopics["Software Engineer"];
  const keywords = extractKeywords(context);
  const selected = type === "mixed" ? ["hr", "technical", "project"] : [type];
  const questions = [];

  selected.forEach((category) => {
    baseQuestions[category].forEach((question) => {
      questions.push({
        category,
        text: question,
        difficulty: category === "hr" ? "Communication" : "Fresh Graduate Level"
      });
    });
  });

  topics.slice(0, 4).forEach((topic) => {
    questions.push({
      category: "technical",
      text: `Explain a ${topic} concept you know well and give a real example from your learning or project work.`,
      difficulty: "Role Specific"
    });
  });

  keywords.slice(0, 4).forEach((keyword) => {
    questions.push({
      category: "personalized",
      text: `Your profile mentions "${keyword}". How would you explain your experience with it in a job interview?`,
      difficulty: "Personalized"
    });
  });

  return questions.slice(0, 8);
}

function startSession() {
  state = {
    questions: buildQuestions(roleEl.value, typeEl.value, contextEl.value),
    index: 0,
    answers: [],
    startedAt: Date.now(),
    timerId: state.timerId
  };

  clearInterval(state.timerId);
  state.timerId = setInterval(updateTimer, 1000);
  sessionTitle.textContent = `${roleEl.value} mock interview`;
  reportStatus.textContent = "In progress";
  reportList.innerHTML = "";
  showQuestion();
  updateStats();
}

function showQuestion() {
  const current = state.questions[state.index];
  if (!current) {
    finishSession();
    return;
  }

  questionText.textContent = current.text;
  questionTag.textContent = current.category.toUpperCase();
  difficultyTag.textContent = current.difficulty;
  answerEl.value = "";
  scoreBadge.textContent = "--";
  feedbackEmpty.classList.remove("hidden");
  feedbackContent.classList.add("hidden");
  updateStats();
}

function evaluateAnswer() {
  const current = state.questions[state.index];
  const answer = answerEl.value.trim();

  if (!current || answer.length < 20) {
    alert("Write a fuller answer before evaluation. Aim for at least 3 to 4 sentences.");
    return;
  }

  const result = scoreAnswer(answer, current);
  state.answers[state.index] = {
    question: current.text,
    category: current.category,
    answer,
    ...result
  };

  renderFeedback(result);
  renderReport();
  updateStats();
}

function scoreAnswer(answer, question) {
  const words = answer.split(/\s+/).filter(Boolean);
  const lower = answer.toLowerCase();
  const hasExample = /\b(example|project|built|created|implemented|used|worked|developed)\b/.test(lower);
  const hasResult = /\b(result|improved|reduced|increased|learned|achieved|completed|solved)\b/.test(lower);
  const hasStructure = /\b(first|second|finally|because|therefore|however|challenge|action|result)\b/.test(lower);
  const questionWords = extractKeywords(question.text);
  const relevanceHits = questionWords.filter((word) => lower.includes(word)).length;

  const clarity = clamp(Math.round((words.length / 75) * 70 + (hasStructure ? 20 : 0)), 35, 95);
  const relevance = clamp(55 + relevanceHits * 10 + (hasExample ? 10 : 0), 35, 95);
  const structure = clamp(45 + (hasStructure ? 25 : 0) + (hasExample ? 15 : 0) + (hasResult ? 10 : 0), 35, 95);
  const confidence = clamp(50 + (words.length > 55 ? 15 : 0) + (hasResult ? 15 : 0), 35, 92);
  const technicalDepth = clamp(45 + countTechnicalTerms(lower) * 8 + (hasExample ? 10 : 0), 35, 95);
  const overall = Math.round((clarity + relevance + structure + confidence + technicalDepth) / 5);

  return {
    scores: { clarity, relevance, structure, confidence, technicalDepth },
    overall,
    strengths: buildStrengths({ hasExample, hasResult, hasStructure, words, overall }),
    improvements: buildImprovements({ hasExample, hasResult, hasStructure, words, technicalDepth }),
    sample: buildSampleAnswer(question)
  };
}

function countTechnicalTerms(text) {
  const terms = ["api", "database", "sql", "java", "react", "algorithm", "complexity", "authentication", "server", "client", "state", "schema", "testing", "deployment", "cache", "security"];
  return terms.filter((term) => text.includes(term)).length;
}

function buildStrengths(flags) {
  const strengths = [];
  if (flags.hasExample) strengths.push("You supported the answer with practical experience or a project reference.");
  if (flags.hasStructure) strengths.push("Your answer has a readable flow, which helps the interviewer follow your thinking.");
  if (flags.hasResult) strengths.push("You included an outcome, learning, or result instead of stopping at theory.");
  if (flags.words.length > 70) strengths.push("The answer has enough detail for a serious interview response.");
  if (!strengths.length) strengths.push("You made a clear attempt, and the core idea can be improved with more detail.");
  return strengths;
}

function buildImprovements(flags) {
  const improvements = [];
  if (!flags.hasStructure) improvements.push("Use a simple structure: situation, action, technical choice, and result.");
  if (!flags.hasExample) improvements.push("Add one concrete example from your project, internship, lab work, or coursework.");
  if (!flags.hasResult) improvements.push("End with measurable impact, learning, or what you would improve next.");
  if (flags.technicalDepth < 65) improvements.push("Include more technical keywords and explain why your chosen approach works.");
  if (flags.words.length < 60) improvements.push("Expand the answer to at least 60 to 90 words for interview depth.");
  return improvements;
}

function buildSampleAnswer(question) {
  if (question.category === "hr") {
    return "I am a 2025 BE CSE graduate with a strong interest in building practical software projects. During my learning, I focused on core CS subjects, full-stack development, and problem solving. In my projects, I tried to understand the user problem first, then design a simple solution, implement it, test it, and improve it based on feedback. For this role, I can bring quick learning ability, technical fundamentals, and a strong willingness to take ownership.";
  }

  if (question.category === "project") {
    return "In my project, I started by identifying the user problem and converting it into clear features. I designed the frontend for usability, built the backend logic, and stored important session data so the app could provide meaningful results. One key decision was keeping the first version simple and reliable, then planning improvements like authentication, analytics, and API integration. This helped me learn both implementation and product thinking.";
  }

  return "I would explain the concept first, then connect it to a real use case. For example, if the topic is APIs, I would describe how the frontend sends a request, the backend validates it, processes business logic, talks to the database if needed, and returns a structured response. I would also mention error handling, status codes, and security basics. This shows that I understand both the theory and how it is applied in a real application.";
}

function renderFeedback(result) {
  scoreBadge.textContent = `${result.overall}/100`;
  scoreBars.innerHTML = Object.entries(result.scores)
    .map(([label, value]) => `
      <div class="score-row">
        <span>${formatLabel(label)}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${value}%"></div></div>
        <strong>${value}</strong>
      </div>
    `)
    .join("");

  strengthsEl.innerHTML = result.strengths.map((item) => `<li>${item}</li>`).join("");
  improvementsEl.innerHTML = result.improvements.map((item) => `<li>${item}</li>`).join("");
  sampleAnswerEl.textContent = result.sample;
  feedbackEmpty.classList.add("hidden");
  feedbackContent.classList.remove("hidden");
}

function renderReport() {
  const answered = state.answers.filter(Boolean);
  reportList.innerHTML = answered
    .map((item, index) => `
      <article class="report-item">
        <div class="report-score">${item.overall}</div>
        <div>
          <strong>Q${index + 1}. ${item.category.toUpperCase()}</strong>
          <p>${item.question}</p>
          <small>${item.improvements[0]}</small>
        </div>
      </article>
    `)
    .join("");
}

function nextQuestion() {
  if (!state.questions.length) {
    startSession();
    return;
  }

  state.index += 1;
  showQuestion();
}

function finishSession() {
  clearInterval(state.timerId);
  questionText.textContent = "Interview complete. Review your report and download it for your project demo.";
  questionTag.textContent = "Complete";
  difficultyTag.textContent = "Report Ready";
  reportStatus.textContent = "Completed";
  updateStats();
}

function updateStats() {
  const total = state.questions.length;
  const answered = state.answers.filter(Boolean);
  questionCount.textContent = total ? `${Math.min(state.index + 1, total)}/${total}` : "0/0";
  averageScore.textContent = answered.length
    ? Math.round(answered.reduce((sum, item) => sum + item.overall, 0) / answered.length)
    : "--";
}

function updateTimer() {
  if (!state.startedAt) return;
  const seconds = Math.floor((Date.now() - state.startedAt) / 1000);
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remainingSeconds = String(seconds % 60).padStart(2, "0");
  timer.textContent = `${minutes}:${remainingSeconds}`;
}

function downloadReport() {
  const answered = state.answers.filter(Boolean);
  if (!answered.length) {
    alert("Evaluate at least one answer before downloading a report.");
    return;
  }

  const report = [
    "PrepWise AI Interview Coach Report",
    `Role: ${roleEl.value}`,
    `Interview Type: ${typeEl.options[typeEl.selectedIndex].text}`,
    `Average Score: ${averageScore.textContent}/100`,
    "",
    ...answered.flatMap((item, index) => [
      `Q${index + 1}: ${item.question}`,
      `Score: ${item.overall}/100`,
      `Answer: ${item.answer}`,
      `Improve: ${item.improvements.join(" ")}`,
      ""
    ])
  ].join("\n");

  const blob = new Blob([report], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "prepwise-interview-report.txt";
  link.click();
  URL.revokeObjectURL(url);
}

function startVoiceInput() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Voice input is not supported in this browser. You can type your answer instead.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    answerEl.value = `${answerEl.value} ${event.results[0][0].transcript}`.trim();
  };
  recognition.start();
}

function resetSession() {
  clearInterval(state.timerId);
  state = { questions: [], index: 0, answers: [], startedAt: null, timerId: null };
  timer.textContent = "00:00";
  questionText.textContent = "Choose your target role, paste context, and start your mock interview.";
  questionTag.textContent = "Ready";
  difficultyTag.textContent = "Fresh Graduate Level";
  sessionTitle.textContent = "Prepare smarter for your first role";
  answerEl.value = "";
  reportList.innerHTML = "";
  reportStatus.textContent = "Not started";
  scoreBadge.textContent = "--";
  feedbackEmpty.classList.remove("hidden");
  feedbackContent.classList.add("hidden");
  updateStats();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function formatLabel(label) {
  return label.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

startBtn.addEventListener("click", startSession);
resetBtn.addEventListener("click", resetSession);
evaluateBtn.addEventListener("click", evaluateAnswer);
nextBtn.addEventListener("click", nextQuestion);
voiceBtn.addEventListener("click", startVoiceInput);
downloadBtn.addEventListener("click", downloadReport);

resetSession();

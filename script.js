/* ==============================================
   SCRIPT.JS — EnglishSpeaks Educational Site
   Grade 12 · Expressing Opinion in English
   ============================================== */

/* ------------------------------------------------
   1. NAVBAR — Scroll shrink + mobile hamburger
------------------------------------------------ */

const navbar    = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

// Add 'scrolled' class to navbar after scrolling 50px
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  backTopBtn.classList.toggle('visible', window.scrollY > 400);
});

// Toggle mobile nav
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.innerHTML = navLinks.classList.contains('open')
    ? '<i class="ri-close-line"></i>'
    : '<i class="ri-menu-3-line"></i>';
});

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.innerHTML = '<i class="ri-menu-3-line"></i>';
  });
});


/* ------------------------------------------------
   2. BACK TO TOP BUTTON
------------------------------------------------ */

const backTopBtn = document.getElementById('backTop');

backTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ------------------------------------------------
   3. SCROLL REVEAL — Intersection Observer
------------------------------------------------ */

const revealElements = document.querySelectorAll(
  '.vocab-card, .expr-card, .reflection-card, .obj-highlight-card, .prompt-card, .bubble'
);

// Add reveal class to target elements
revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger the reveal delay slightly for card grids
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, (i % 6) * 80); // stagger within viewport batch
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(el => revealObserver.observe(el));


/* ------------------------------------------------
   4. VOCABULARY CARDS — Toggle expand on click
------------------------------------------------ */

const vocabCards = document.querySelectorAll('.vocab-card');

vocabCards.forEach(card => {
  // Click toggles the card open/closed
  card.addEventListener('click', (e) => {
    // Don't toggle if the pronounce button was clicked
    if (e.target.closest('.pronounce-btn')) return;
    card.classList.toggle('open');
  });

  // Keyboard accessibility: Enter/Space also toggles
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      card.classList.toggle('open');
    }
  });
});


/* ------------------------------------------------
   5. PRONUNCIATION — Web Speech API
------------------------------------------------ */

const pronounceBtns = document.querySelectorAll('.pronounce-btn');

pronounceBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent card toggle
    const word = btn.getAttribute('data-text');
    speakWord(word);
  });
});

/**
 * Uses the browser's SpeechSynthesis API to speak a word aloud.
 * Falls back silently if the API is unavailable.
 * @param {string} text - The word or phrase to pronounce
 */
function speakWord(text) {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }
  // Cancel any current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang  = 'en-US';
  utterance.rate  = 0.85; // slightly slower for clarity
  utterance.pitch = 1.0;

  // Prefer a natural-sounding English voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Google'));
  if (preferred) utterance.voice = preferred;

  window.speechSynthesis.speak(utterance);
}

// Voices may load asynchronously — trigger on voiceschanged
window.speechSynthesis.addEventListener('voiceschanged', () => {});


/* ------------------------------------------------
   6. EXPRESSION TABS — Switch active panel
------------------------------------------------ */

const exprTabs   = document.querySelectorAll('.expr-tab');
const exprPanels = document.querySelectorAll('.expr-panel');

exprTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-tab');

    // Update tab active states
    exprTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Show/hide panels
    exprPanels.forEach(panel => {
      panel.classList.remove('active');
      if (panel.id === `tab-${target}`) {
        panel.classList.add('active');
      }
    });
  });
});


/* ------------------------------------------------
   7. INTERACTIVE QUIZ — Build, validate, score
------------------------------------------------ */

/** Quiz question data */
const quizData = [
  {
    question: "Which expression is used to give your personal opinion?",
    options: [
      "I agree because…",
      "In my opinion…",
      "I disagree with…",
      "That is a fact."
    ],
    answer: 1
  },
  {
    question: "A student says: 'I think homework should be reduced.' Which response best AGREES?",
    options: [
      "I see it differently.",
      "I'm not sure I agree with that.",
      "You're absolutely right, it causes a lot of stress.",
      "From my perspective, that is wrong."
    ],
    answer: 2
  },
  {
    question: "Which word means 'a personal view or judgment about something'?",
    options: ["Argument", "Confidence", "Opinion", "Perspective"],
    answer: 2
  },
  {
    question: "What is the most polite way to DISAGREE in a formal discussion?",
    options: [
      "You're wrong!",
      "I see it differently; from my perspective…",
      "No way, that makes no sense.",
      "Stop talking, I disagree."
    ],
    answer: 1
  },
  {
    question: "Complete the sentence: '______ my perspective, online learning has many benefits.'",
    options: ["In", "With", "From", "At"],
    answer: 2
  }
];

const quizForm        = document.getElementById('quizForm');
const submitQuizBtn   = document.getElementById('submitQuiz');
const quizResult      = document.getElementById('quizResult');
const quizProgressFill = document.getElementById('quizProgressFill');

/** Build quiz HTML dynamically */
function buildQuiz() {
  quizForm.innerHTML = '';

  quizData.forEach((q, qi) => {
    const questionDiv = document.createElement('div');
    questionDiv.className = 'quiz-question reveal';
    questionDiv.id = `question-${qi}`;

    const optionsHTML = q.options.map((opt, oi) => `
      <label class="quiz-option">
        <input type="radio" name="q${qi}" value="${oi}" />
        ${opt}
      </label>
    `).join('');

    questionDiv.innerHTML = `
      <div class="quiz-q-label">Question ${qi + 1} of ${quizData.length}</div>
      <p class="quiz-q-text">${q.question}</p>
      <div class="quiz-options" id="options-${qi}">
        ${optionsHTML}
      </div>
    `;

    quizForm.appendChild(questionDiv);
  });

  // Observe newly created elements for reveal
  document.querySelectorAll('.quiz-question.reveal').forEach(el => {
    revealObserver.observe(el);
  });

  // Track progress as user answers
  quizForm.addEventListener('change', updateProgress);
  updateProgress();
}

/** Update progress bar based on answered questions */
function updateProgress() {
  let answered = 0;
  quizData.forEach((_, qi) => {
    if (quizForm.querySelector(`input[name="q${qi}"]:checked`)) answered++;
  });
  const pct = (answered / quizData.length) * 100;
  quizProgressFill.style.width = `${pct}%`;
}

/** Handle quiz submission */
submitQuizBtn.addEventListener('click', () => {
  let score = 0;
  let allAnswered = true;

  quizData.forEach((q, qi) => {
    const selected = quizForm.querySelector(`input[name="q${qi}"]:checked`);

    if (!selected) {
      allAnswered = false;
      return;
    }

    const optionLabels = document.querySelectorAll(`#options-${qi} .quiz-option`);

    // Disable further changes
    quizForm.querySelectorAll(`input[name="q${qi}"]`).forEach(r => r.disabled = true);

    const chosen = parseInt(selected.value);

    // Highlight correct and incorrect answers
    optionLabels.forEach((label, idx) => {
      if (idx === q.answer) {
        label.classList.add('correct');
      } else if (idx === chosen && chosen !== q.answer) {
        label.classList.add('incorrect');
      }
    });

    if (chosen === q.answer) score++;
  });

  // Ask to complete unanswered questions
  if (!allAnswered) {
    alert('Please answer all questions before submitting.');
    return;
  }

  // Show result
  showQuizResult(score);

  // Disable submit button
  submitQuizBtn.disabled = true;
  submitQuizBtn.style.opacity = '0.5';
});

/** Display the quiz score and feedback message */
function showQuizResult(score) {
  const total   = quizData.length;
  const pct     = Math.round((score / total) * 100);
  const pass    = score >= 3;

  const messages = {
    5: "🌟 Perfect Score! You've mastered expressing opinions!",
    4: "🎉 Excellent! Almost flawless!",
    3: "👍 Good job! You passed — keep practicing!",
    2: "📘 Keep studying — review the expressions again.",
    1: "💪 Don't give up! Review the lesson and try again.",
    0: "📖 Let's go back to basics — review the vocabulary and expressions."
  };

  quizResult.className = `quiz-result show ${pass ? 'pass' : 'fail'}`;
  quizResult.innerHTML = `
    <span class="score-num">${pct}%</span>
    <div class="score-msg">${messages[score] || 'Quiz complete!'}</div>
    <div class="score-detail">You got <strong>${score} out of ${total}</strong> questions correct.</div>
    <button class="btn btn-ghost btn-retry" id="retryQuiz">
      <i class="ri-refresh-line"></i> Try Again
    </button>
  `;

  quizResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Retry button
  document.getElementById('retryQuiz').addEventListener('click', resetQuiz);
}

/** Reset the quiz to its initial state */
function resetQuiz() {
  submitQuizBtn.disabled = false;
  submitQuizBtn.style.opacity = '1';
  quizResult.className = 'quiz-result';
  quizResult.innerHTML = '';
  buildQuiz();
}

// Initialize the quiz on page load
buildQuiz();


/* ------------------------------------------------
   8. SPEAKING PRACTICE — Text input + voice sim
------------------------------------------------ */

const prompts = [
  '"Should students be allowed to use smartphones during school hours?"',
  '"Is social media more harmful than beneficial for teenagers?"',
  '"Should homework be abolished in high school?"',
  '"Are school uniforms necessary in the modern era?"',
  '"Should physical education be a compulsory subject every day?"',
  '"Is it important to learn a foreign language in high school?"',
];

const practicePromptEl = document.getElementById('practicePrompt');
const changePromptBtn  = document.getElementById('changePrompt');
const opinionInput     = document.getElementById('opinionInput');
const charCount        = document.getElementById('charCount');
const submitOpinionBtn = document.getElementById('submitOpinion');
const practiceFeedback = document.getElementById('practiceFeedback');

let currentPromptIndex = 0;

/** Cycle to the next discussion prompt */
changePromptBtn.addEventListener('click', () => {
  currentPromptIndex = (currentPromptIndex + 1) % prompts.length;
  practicePromptEl.textContent = prompts[currentPromptIndex];

  // Animate the change
  practicePromptEl.style.opacity = '0';
  practicePromptEl.style.transform = 'translateY(8px)';
  setTimeout(() => {
    practicePromptEl.style.opacity = '1';
    practicePromptEl.style.transform = 'translateY(0)';
    practicePromptEl.style.transition = 'opacity .3s, transform .3s';
  }, 50);

  // Clear previous response and feedback
  opinionInput.value = '';
  charCount.textContent = '0';
  hideFeedback();
});

/** Update character count on input */
opinionInput.addEventListener('input', () => {
  const len = opinionInput.value.length;
  charCount.textContent = len;

  // Warn if approaching limit
  charCount.style.color = len > 480 ? 'var(--disagree-red)' : 'var(--gray-400)';

  // Max 500 chars
  if (len > 500) {
    opinionInput.value = opinionInput.value.slice(0, 500);
    charCount.textContent = '500';
  }
});

/** Evaluate and provide feedback on submitted opinion */
submitOpinionBtn.addEventListener('click', () => {
  const text = opinionInput.value.trim();

  if (!text) {
    showFeedback('warning', '⚠️ Please type your opinion before submitting!');
    return;
  }

  if (text.length < 20) {
    showFeedback('warning', '💬 Try to write a bit more — express your full opinion!');
    return;
  }

  // Check for use of learned expressions
  const expressionPatterns = [
    /in my opinion/i,
    /i think/i,
    /i believe/i,
    /i agree/i,
    /i disagree/i,
    /from my perspective/i,
    /from my point of view/i,
    /i see it differently/i,
    /that('s| is) a good point/i,
    /you('re| are) (absolutely )?right/i,
    /i('m| am) not sure i agree/i,
  ];

  const usedExpression = expressionPatterns.some(pat => pat.test(text));

  if (usedExpression) {
    showFeedback('success',
      '✅ Excellent! Great response! You used opinion expressions correctly. Well done!'
    );
  } else {
    showFeedback('warning',
      '📝 Good try! Remember to start with an opinion expression like "In my opinion…" or "I think that…"'
    );
  }
});

function showFeedback(type, message) {
  practiceFeedback.textContent = message;
  practiceFeedback.className   = `practice-feedback show ${type}`;
}

function hideFeedback() {
  practiceFeedback.className = 'practice-feedback';
  practiceFeedback.textContent = '';
}


/* ------------------------------------------------
   9. VOICE RECORDER — Simulated UI
   (Uses MediaRecorder if available, else simulates)
------------------------------------------------ */

const recordBtn      = document.getElementById('recordBtn');
const recordIcon     = document.getElementById('recordIcon');
const recorderStatus = document.getElementById('recorderStatus');
const soundWave      = document.getElementById('soundWave');

let isRecording   = false;
let recordTimer   = null;
let mediaRecorder = null;
let recordSeconds = 0;

recordBtn.addEventListener('click', () => {
  if (!isRecording) {
    startRecording();
  } else {
    stopRecording();
  }
});

/** Start the recording (real or simulated) */
async function startRecording() {
  isRecording = true;
  recordBtn.classList.add('recording');
  recordIcon.className = 'ri-stop-line';
  soundWave.classList.add('active');
  recordSeconds = 0;

  // Try to access the microphone
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();

      // Stop automatically after 30 seconds
      recordTimer = setInterval(() => {
        recordSeconds++;
        recorderStatus.textContent = `Recording… ${recordSeconds}s`;
        if (recordSeconds >= 30) stopRecording();
      }, 1000);

      recorderStatus.textContent = 'Recording… 0s';

    } catch (err) {
      // Microphone not available — simulate
      simulateRecording();
    }
  } else {
    // Browser doesn't support getUserMedia — simulate
    simulateRecording();
  }
}

/** Simulate recording when mic access is not available */
function simulateRecording() {
  recorderStatus.textContent = 'Recording… (simulated)';
  recordTimer = setInterval(() => {
    recordSeconds++;
    recorderStatus.textContent = `Recording… ${recordSeconds}s (simulated)`;
    if (recordSeconds >= 10) stopRecording();
  }, 1000);
}

/** Stop recording and reset UI */
function stopRecording() {
  isRecording = false;
  clearInterval(recordTimer);

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
    mediaRecorder = null;
  }

  recordBtn.classList.remove('recording');
  recordIcon.className = 'ri-mic-line';
  soundWave.classList.remove('active');
  recorderStatus.textContent = `Recorded (${recordSeconds}s) ✓`;

  // Reset status text after a few seconds
  setTimeout(() => {
    recorderStatus.textContent = 'Press to record';
    recordSeconds = 0;
  }, 4000);
}


/* ------------------------------------------------
   10. REFLECTION — Save responses with feedback
------------------------------------------------ */

const saveReflectionsBtn = document.getElementById('saveReflections');
const saveMsg            = document.getElementById('saveMsg');
const reflectInputs      = document.querySelectorAll('.reflect-input');

saveReflectionsBtn.addEventListener('click', () => {
  // Check if at least one reflection has been written
  const hasContent = Array.from(reflectInputs).some(inp => inp.value.trim().length > 0);

  if (!hasContent) {
    saveMsg.textContent = '⚠️ Please write at least one reflection before saving.';
    saveMsg.style.color = '#854d0e';
    saveMsg.classList.add('show');
    setTimeout(() => saveMsg.classList.remove('show'), 3000);
    return;
  }

  // Simulate saving (in a real app, this would POST to a server)
  saveReflectionsBtn.disabled = true;
  saveReflectionsBtn.innerHTML = '<i class="ri-loader-4-line"></i> <span>Saving…</span>';

  setTimeout(() => {
    saveMsg.textContent = '✅ Reflections saved! Great work today.';
    saveMsg.style.color = 'var(--agree-green)';
    saveMsg.classList.add('show');

    saveReflectionsBtn.innerHTML = '<i class="ri-check-line"></i> <span>Saved!</span>';
    saveReflectionsBtn.disabled  = false;

    // Log to console for demonstration
    reflectInputs.forEach((inp, i) => {
      if (inp.value.trim()) {
        console.log(`Reflection ${i + 1}: ${inp.value.trim()}`);
      }
    });
  }, 1200);
});


/* ------------------------------------------------
   11. SMOOTH ACTIVE NAV LINK on scroll
------------------------------------------------ */

const sections   = document.querySelectorAll('section[id]');
const allNavLinks = document.querySelectorAll('.nav-links a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      allNavLinks.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach(sec => navObserver.observe(sec));


/* ------------------------------------------------
   12. PAGE LOAD — Animate hero elements
------------------------------------------------ */

// The hero animations run via CSS animation-delay,
// so no extra JS is needed — just ensure the page is ready.
document.addEventListener('DOMContentLoaded', () => {
  console.log('EnglishSpeaks — Grade 12 Speaking Skills Module Loaded ✓');
});

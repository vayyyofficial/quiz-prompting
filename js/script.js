/**
 * ============================================================================
 * QUIZ COMPETITION — MOKLET MENGAJAR
 * Client-Side Application Logic (Pure Vanilla JavaScript)
 * ============================================================================
 */

(function () {
  "use strict";

  /* --------------------------------------------------------------------------
   * 1. Application State
   * -------------------------------------------------------------------------- */
  const AppState = {
    status: "start", // 'start' | 'playing' | 'feedback' | 'finished'
    teamName: "",
    currentIndex: 0,
    answersRecord: [], // { questionId, type, selected, earnedPoints, maxPoints, isFullyCorrect }
    totalScore: 0,
    maxPossibleScore: 0,
    soundEnabled: true,
    audioCtx: null,
    isExporting: false,
    sessionTimestamp: null,
    sessionId: "",
    timerInterval: null,
    timerStartTime: 0,
    timerTotalMs: 0
  };

  /* --------------------------------------------------------------------------
   * 2. DOM Elements Cache
   * -------------------------------------------------------------------------- */
  const DOM = {
    // Header
    headerCompTitle: document.getElementById("header-comp-title"),
    btnToggleSound: document.getElementById("btn-toggle-sound"),
    iconSoundOn: document.getElementById("icon-sound-on"),
    iconSoundOff: document.getElementById("icon-sound-off"),
    soundStatusLabel: document.getElementById("sound-status-label"),

    // Views
    viewStart: document.getElementById("view-start"),
    viewQuiz: document.getElementById("view-quiz"),
    viewResult: document.getElementById("view-result"),

    // Start Screen
    startCompTitle: document.getElementById("start-comp-title"),
    startCompDesc: document.getElementById("start-comp-desc"),
    formStartQuiz: document.getElementById("form-start-quiz"),
    inputTeamName: document.getElementById("input-team-name"),
    startValidationMsg: document.getElementById("start-validation-msg"),
    btnStartQuiz: document.getElementById("btn-start-quiz"),

    // Quiz HUD
    currentTeamDisplay: document.getElementById("current-team-display"),
    progressText: document.getElementById("progress-text"),
    progressPercent: document.getElementById("progress-percent"),
    progressBarFill: document.getElementById("progress-bar-fill"),

    // Question Card
    questionCard: document.getElementById("question-card"),
    questionTypeBadge: document.getElementById("question-type-badge"),
    questionPointsBadge: document.getElementById("question-points-badge"),
    questionTimerBadge: document.getElementById("question-timer-badge"),
    timerText: document.getElementById("timer-text"),
    questionText: document.getElementById("question-text"),
    questionInstruction: document.getElementById("question-instruction"),
    optionsContainer: document.getElementById("options-container"),

    // Multiple Answer Action Bar
    multipleVerifyBar: document.getElementById("multiple-verify-bar"),
    multipleSelectedCount: document.getElementById("multiple-selected-count"),
    btnVerifyMultiple: document.getElementById("btn-verify-multiple"),

    // Feedback Box
    feedbackBox: document.getElementById("feedback-box"),
    feedbackStatus: document.getElementById("feedback-status"),
    feedbackIcon: document.getElementById("feedback-icon"),
    feedbackTitle: document.getElementById("feedback-title"),
    feedbackScorePill: document.getElementById("feedback-score-pill"),
    feedbackExplanation: document.getElementById("feedback-explanation"),

    // Footer Next Button
    btnNextQuestion: document.getElementById("btn-next-question"),
    btnNextLabel: document.getElementById("btn-next-label"),

    // Result Card
    resultCard: document.getElementById("result-card"),
    resultCompName: document.getElementById("result-comp-name"),
    resultTeamDisplay: document.getElementById("result-team-display"),
    resultTotalScore: document.getElementById("result-total-score"),
    resultMaxScore: document.getElementById("result-max-score"),
    resultPercentageBadge: document.getElementById("result-percentage-badge"),
    statTotalQuestions: document.getElementById("stat-total-questions"),
    statCorrectCount: document.getElementById("stat-correct-count"),
    statIncorrectCount: document.getElementById("stat-incorrect-count"),
    statTimestamp: document.getElementById("stat-timestamp"),
    resultSerialId: document.getElementById("result-serial-id"),

    // Result Actions
    btnPrintResult: document.getElementById("btn-print-result"),
    btnPrintText: document.getElementById("btn-print-text"),
    btnRestartQuiz: document.getElementById("btn-restart-quiz"),
    exportStatus: document.getElementById("export-status"),
    exportStatusText: document.getElementById("export-status-text"),
    exportSpinner: document.getElementById("export-spinner"),

    // Modal
    modalRestart: document.getElementById("modal-restart"),
    btnModalCancel: document.getElementById("btn-modal-cancel"),
    btnModalConfirm: document.getElementById("btn-modal-confirm")
  };

  /* --------------------------------------------------------------------------
   * 3. Web Audio API Sound Synthesizer (Zero Assets, 100% Offline Reliable)
   * -------------------------------------------------------------------------- */
  const SoundFX = {
    initContext() {
      if (!AppState.audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          try {
            AppState.audioCtx = new AudioContextClass();
          } catch (e) {
            console.warn("AudioContext init error:", e);
          }
        }
      }
      if (AppState.audioCtx && AppState.audioCtx.state === "suspended") {
        AppState.audioCtx.resume().catch(() => {});
      }
    },

    playTone(frequency, type, duration, startTimeOffset, gainLevel) {
      if (!AppState.soundEnabled || !AppState.audioCtx) return;
      try {
        const osc = AppState.audioCtx.createOscillator();
        const gainNode = AppState.audioCtx.createGain();

        osc.type = type || "sine";
        osc.frequency.setValueAtTime(frequency, AppState.audioCtx.currentTime + startTimeOffset);

        gainNode.gain.setValueAtTime(gainLevel || 0.12, AppState.audioCtx.currentTime + startTimeOffset);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, AppState.audioCtx.currentTime + startTimeOffset + duration);

        osc.connect(gainNode);
        gainNode.connect(AppState.audioCtx.destination);

        osc.start(AppState.audioCtx.currentTime + startTimeOffset);
        osc.stop(AppState.audioCtx.currentTime + startTimeOffset + duration);
      } catch (err) {
        // Fail silently without interrupting quiz logic
      }
    },

    playCorrect() {
      this.initContext();
      // Melodic major triad chime (C5 -> E5 -> G5)
      this.playTone(523.25, "sine", 0.18, 0, 0.15);
      this.playTone(659.25, "sine", 0.20, 0.08, 0.15);
      this.playTone(783.99, "sine", 0.35, 0.16, 0.18);
    },

    playIncorrect() {
      this.initContext();
      // Low dual tone bump
      this.playTone(280, "sawtooth", 0.16, 0, 0.10);
      this.playTone(220, "sawtooth", 0.26, 0.12, 0.10);
    },

    playClick() {
      this.initContext();
      this.playTone(750, "sine", 0.04, 0, 0.05);
    }
  };

  /* --------------------------------------------------------------------------
   * 4. View Management
   * -------------------------------------------------------------------------- */
  function showView(viewName) {
    DOM.viewStart.classList.remove("active");
    DOM.viewQuiz.classList.remove("active");
    DOM.viewResult.classList.remove("active");

    if (viewName === "start") {
      DOM.viewStart.classList.add("active");
      AppState.status = "start";
      DOM.inputTeamName.focus();
    } else if (viewName === "quiz") {
      DOM.viewQuiz.classList.add("active");
      AppState.status = "playing";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (viewName === "result") {
      DOM.viewResult.classList.add("active");
      AppState.status = "finished";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  /* --------------------------------------------------------------------------
   * 5. Initialization
   * -------------------------------------------------------------------------- */
  function initApp() {
    // 1. Validate configuration
    if (typeof QUIZ_CONFIG === "undefined" || !QUIZ_CONFIG) {
      alert("Error: File js/questions.js tidak termuat dengan benar.");
      return;
    }

    const validation = validateQuizConfig(QUIZ_CONFIG);
    if (!validation.isValid) {
      console.error("Quiz Config Errors:", validation.errors);
      alert("Konfigurasi soal memiliki kesalahan:\n" + validation.errors.join("\n"));
      return;
    }

    // 2. Set Config Titles
    if (QUIZ_CONFIG.competitionTitle) {
      DOM.headerCompTitle.textContent = QUIZ_CONFIG.competitionTitle;
      DOM.startCompTitle.textContent = QUIZ_CONFIG.competitionTitle;
      DOM.resultCompName.textContent = QUIZ_CONFIG.competitionTitle;
      document.title = `${QUIZ_CONFIG.competitionTitle} — Quiz Competition`;
    }

    if (QUIZ_CONFIG.competitionDescription) {
      DOM.startCompDesc.textContent = QUIZ_CONFIG.competitionDescription;
    }

    // 3. Setup Sound Default
    AppState.soundEnabled = QUIZ_CONFIG.soundEnabledDefault !== false;
    updateSoundUI();

    // 4. Calculate Max Possible Score
    AppState.maxPossibleScore = QUIZ_CONFIG.questions.reduce((sum, q) => sum + (q.points || 100), 0);

    // 5. Setup Listeners
    setupEventListeners();

    // Show Start View
    showView("start");
  }

  /* --------------------------------------------------------------------------
   * 6. Sound Toggle
   * -------------------------------------------------------------------------- */
  function updateSoundUI() {
    if (AppState.soundEnabled) {
      DOM.iconSoundOn.classList.remove("is-hidden");
      DOM.iconSoundOff.classList.add("is-hidden");
      DOM.soundStatusLabel.textContent = "Sound: ON";
      DOM.btnToggleSound.setAttribute("aria-label", "Matikan suara");
    } else {
      DOM.iconSoundOn.classList.add("is-hidden");
      DOM.iconSoundOff.classList.remove("is-hidden");
      DOM.soundStatusLabel.textContent = "Sound: OFF";
      DOM.btnToggleSound.setAttribute("aria-label", "Aktifkan suara");
    }
  }

  function toggleSound() {
    AppState.soundEnabled = !AppState.soundEnabled;
    updateSoundUI();
    if (AppState.soundEnabled) {
      SoundFX.initContext();
      SoundFX.playTone(600, "sine", 0.08, 0, 0.08);
    }
  }

  /* --------------------------------------------------------------------------
   * 7. Start Quiz Form Handler
   * -------------------------------------------------------------------------- */
  function handleStartFormSubmit(e) {
    e.preventDefault();

    const rawName = DOM.inputTeamName.value;
    const cleanName = rawName.trim();

    // Validation
    if (!cleanName || cleanName.length < 2) {
      showStartError("Mohon masukkan nama tim yang valid (minimal 2 karakter).");
      DOM.inputTeamName.focus();
      return;
    }

    // Check for weird symbols only
    if (/^[^\w\s\d]+$/.test(cleanName)) {
      showStartError("Nama tim harus mengandung huruf atau angka.");
      DOM.inputTeamName.focus();
      return;
    }

    // Clear error
    clearStartError();

    // Set Team Name
    AppState.teamName = cleanName;
    DOM.currentTeamDisplay.textContent = cleanName;
    DOM.resultTeamDisplay.textContent = cleanName;

    // Reset Quiz State
    AppState.currentIndex = 0;
    AppState.answersRecord = [];
    AppState.totalScore = 0;
    AppState.sessionId = "CERT-MMQ-" + Math.floor(1000 + Math.random() * 9000);

    // Play click sound
    SoundFX.playClick();

    // Move to Quiz View
    showView("quiz");
    renderCurrentQuestion();
  }

  function showStartError(msg) {
    DOM.startValidationMsg.textContent = msg;
    DOM.startValidationMsg.classList.add("active");
    DOM.inputTeamName.classList.add("input-invalid");
  }

  function clearStartError() {
    DOM.startValidationMsg.textContent = "";
    DOM.startValidationMsg.classList.remove("active");
    DOM.inputTeamName.classList.remove("input-invalid");
  }

  /* --------------------------------------------------------------------------
   * 8. Question Timer System (15s Single / 30s Multiple)
   * -------------------------------------------------------------------------- */
  function startQuestionTimer(durationSeconds) {
    stopQuestionTimer();

    if (!DOM.questionTimerBadge || !DOM.timerText) return;

    AppState.timerTotalMs = durationSeconds * 1000;
    AppState.timerStartTime = Date.now();

    // Reset visual classes
    DOM.questionTimerBadge.classList.remove("timer-warning", "timer-urgent");
    DOM.timerText.textContent = `${durationSeconds}s`;

    AppState.timerInterval = setInterval(() => {
      if (AppState.status !== "playing") {
        stopQuestionTimer();
        return;
      }

      const elapsed = Date.now() - AppState.timerStartTime;
      const remainingMs = Math.max(0, AppState.timerTotalMs - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);

      DOM.timerText.textContent = `${remainingSec}s`;

      if (remainingSec <= 5 && remainingSec > 2) {
        DOM.questionTimerBadge.classList.add("timer-warning");
        DOM.questionTimerBadge.classList.remove("timer-urgent");
      } else if (remainingSec <= 2) {
        DOM.questionTimerBadge.classList.add("timer-urgent");
        DOM.questionTimerBadge.classList.remove("timer-warning");
      } else {
        DOM.questionTimerBadge.classList.remove("timer-warning", "timer-urgent");
      }

      if (remainingMs <= 0) {
        stopQuestionTimer();
        handleQuestionTimeout();
      }
    }, 100);
  }

  function stopQuestionTimer() {
    if (AppState.timerInterval) {
      clearInterval(AppState.timerInterval);
      AppState.timerInterval = null;
    }
    if (DOM.questionTimerBadge) {
      DOM.questionTimerBadge.classList.remove("timer-warning", "timer-urgent");
    }
  }

  function handleQuestionTimeout() {
    if (AppState.status !== "playing") return;
    AppState.status = "feedback";

    const q = QUIZ_CONFIG.questions[AppState.currentIndex];
    const maxPoints = q.points || 100;
    const timeLimit = q.timeLimit || (q.type === "single" ? 15 : 30);

    // 1. Lock all options & controls
    lockAllOptions();
    if (DOM.btnVerifyMultiple) {
      DOM.btnVerifyMultiple.disabled = true;
    }

    // 2. Highlight correct answer(s)
    const items = DOM.optionsContainer.querySelectorAll(".option-item");
    items.forEach((item) => {
      const itemId = item.id.replace("opt-", "");
      if (q.correctAnswers.includes(itemId)) {
        item.classList.add("is-correct");
      }
    });

    // 3. Record answer as 0 points / timeout
    AppState.answersRecord.push({
      questionId: q.id,
      type: q.type,
      selected: [],
      earnedPoints: 0,
      maxPoints: maxPoints,
      isFullyCorrect: false,
      isTimeout: true
    });

    // 4. Display timeout feedback box
    DOM.feedbackBox.classList.remove("is-hidden", "feedback-correct", "feedback-partial", "feedback-incorrect");
    DOM.feedbackBox.classList.add("feedback-incorrect");

    DOM.feedbackIcon.textContent = "⏰";
    DOM.feedbackTitle.textContent = "Time's Up!";
    DOM.feedbackScorePill.textContent = `0 / ${maxPoints} Poin`;

    let explanationHTML = `<p>Waktu menjawab telah habis (${timeLimit} detik). Jawaban tidak sempat dikonfirmasi.</p>`;
    if (q.explanation) {
      explanationHTML += `<p>${escapeHtml(q.explanation)}</p>`;
    }
    const correctStr = q.correctAnswers.join(", ");
    explanationHTML += `<div class="feedback-key-hint">Kunci Jawaban yang Benar: <strong>${correctStr}</strong></div>`;

    DOM.feedbackExplanation.innerHTML = explanationHTML;

    // 5. Play error audio
    SoundFX.playIncorrect();

    // 6. Setup Next Button
    setupNextButton();
  }

  /* --------------------------------------------------------------------------
   * 9. Quiz Rendering & Interaction
   * -------------------------------------------------------------------------- */
  // Temp selection for active question
  let singleSelectedOption = null;
  let multiSelectedOptions = new Set();

  function renderCurrentQuestion() {
    // Stop any running timer from previous question
    stopQuestionTimer();

    AppState.status = "playing";
    const qList = QUIZ_CONFIG.questions;
    const q = qList[AppState.currentIndex];

    // Reset state for this question
    singleSelectedOption = null;
    multiSelectedOptions.clear();

    // Update HUD
    const qNumber = AppState.currentIndex + 1;
    const totalQ = qList.length;
    DOM.progressText.textContent = `Question ${qNumber} of ${totalQ}`;
    
    const percent = Math.round((AppState.currentIndex / totalQ) * 100);
    DOM.progressPercent.textContent = `${percent}%`;
    DOM.progressBarFill.style.width = `${Math.max(8, percent)}%`;

    // Question Meta
    const isSingle = q.type === "single";
    DOM.questionTypeBadge.textContent = isSingle ? "Single Answer" : "Multiple Answer";
    DOM.questionPointsBadge.textContent = `${q.points || 100} Points`;

    DOM.questionText.textContent = q.question;
    DOM.questionInstruction.textContent = isSingle
      ? "Klik pilihan jawaban, lalu tekan tombol konfirmasi yang muncul."
      : "Pilih semua jawaban yang benar, lalu tekan tombol Verifikasi Jawaban.";

    // Hide Feedback & Next Button
    DOM.feedbackBox.className = "feedback-box is-hidden";
    DOM.btnNextQuestion.classList.add("is-hidden");

    // Multiple Answer verify bar visibility
    if (isSingle) {
      DOM.multipleVerifyBar.classList.add("is-hidden");
    } else {
      DOM.multipleVerifyBar.classList.remove("is-hidden");
      updateMultiVerifyBar();
    }

    // Render Options
    DOM.optionsContainer.innerHTML = "";

    q.options.forEach((opt) => {
      const optionEl = document.createElement("div");
      optionEl.className = "option-item";
      optionEl.id = `opt-${opt.id}`;
      optionEl.setAttribute("tabindex", "0");
      optionEl.setAttribute("role", isSingle ? "radio" : "checkbox");
      optionEl.setAttribute("aria-checked", "false");

      if (isSingle) {
        // Single Answer markup: letter + text + inline confirm button
        optionEl.innerHTML = `
          <div class="option-main-content">
            <span class="option-key">${opt.id}</span>
            <span class="option-text">${escapeHtml(opt.text)}</span>
          </div>
          <button type="button" class="option-confirm-trigger" data-opt="${opt.id}" aria-label="Konfirmasi jawaban ${opt.id}">
            <span>Confirm</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
        `;

        // 1st click = select, 2nd click = confirm
        optionEl.addEventListener("click", (evt) => {
          if (AppState.status !== "playing") return;

          // If click was directly on confirm trigger
          if (evt.target.closest(".option-confirm-trigger")) {
            evt.stopPropagation();
            submitSingleAnswer(opt.id);
            return;
          }

          // If option was ALREADY selected and clicked again: confirm it!
          if (singleSelectedOption === opt.id) {
            submitSingleAnswer(opt.id);
            return;
          }

          // First click on this option: Select it
          selectSingleOption(opt.id);
        });

        // Keyboard navigation (Enter / Space)
        optionEl.addEventListener("keydown", (evt) => {
          if (AppState.status !== "playing") return;
          if (evt.key === "Enter" || evt.key === " ") {
            evt.preventDefault();
            if (singleSelectedOption === opt.id) {
              submitSingleAnswer(opt.id);
            } else {
              selectSingleOption(opt.id);
            }
          }
        });

      } else {
        // Multiple Answer markup: Checkbox indicator + letter + text
        optionEl.innerHTML = `
          <div class="option-main-content">
            <div class="option-checkbox-indicator" aria-hidden="true">
              <svg class="check-icon is-hidden" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span class="option-key">${opt.id}</span>
            <span class="option-text">${escapeHtml(opt.text)}</span>
          </div>
        `;

        optionEl.addEventListener("click", () => {
          if (AppState.status !== "playing") return;
          toggleMultiOption(opt.id);
        });

        optionEl.addEventListener("keydown", (evt) => {
          if (AppState.status !== "playing") return;
          if (evt.key === "Enter" || evt.key === " ") {
            evt.preventDefault();
            toggleMultiOption(opt.id);
          }
        });
      }

      DOM.optionsContainer.appendChild(optionEl);
    });

    // Start Question Timer based on question type / configuration
    const timeLimit = q.timeLimit || (q.type === "single" ? 15 : 30);
    startQuestionTimer(timeLimit);
  }

  /* --------------------------------------------------------------------------
   * 10. Single Answer Selection & Verification Logic
   * -------------------------------------------------------------------------- */
  function selectSingleOption(optId) {
    singleSelectedOption = optId;
    SoundFX.playClick();

    const items = DOM.optionsContainer.querySelectorAll(".option-item");
    items.forEach((item) => {
      const isThis = item.id === `opt-${optId}`;
      item.classList.toggle("selected", isThis);
      item.setAttribute("aria-checked", isThis ? "true" : "false");
    });
  }

  function submitSingleAnswer(optId) {
    if (AppState.status !== "playing") return;

    // Stop timer immediately upon confirmation
    stopQuestionTimer();

    AppState.status = "feedback";

    const q = QUIZ_CONFIG.questions[AppState.currentIndex];
    const maxPoints = q.points || 100;
    const isCorrect = q.correctAnswers.length === 1 && q.correctAnswers[0] === optId;
    const earnedPoints = isCorrect ? maxPoints : 0;

    // Lock all options immediately
    lockAllOptions();

    // Mark visual states on options
    const items = DOM.optionsContainer.querySelectorAll(".option-item");
    items.forEach((item) => {
      const itemId = item.id.replace("opt-", "");
      if (itemId === q.correctAnswers[0]) {
        item.classList.add("is-correct");
      } else if (itemId === optId && !isCorrect) {
        item.classList.add("is-incorrect");
      }
    });

    // Record answer
    AppState.answersRecord.push({
      questionId: q.id,
      type: "single",
      selected: [optId],
      earnedPoints: earnedPoints,
      maxPoints: maxPoints,
      isFullyCorrect: isCorrect
    });
    AppState.totalScore += earnedPoints;

    // Show Feedback Box
    displayFeedback(isCorrect, isCorrect ? "correct" : "incorrect", earnedPoints, maxPoints, q);

    // Audio Cue
    if (isCorrect) {
      SoundFX.playCorrect();
    } else {
      SoundFX.playIncorrect();
    }

    // Show Next Button
    setupNextButton();
  }

  /* --------------------------------------------------------------------------
   * 10. Multiple Answer Selection & Verification Logic
   * -------------------------------------------------------------------------- */
  function toggleMultiOption(optId) {
    SoundFX.playClick();

    if (multiSelectedOptions.has(optId)) {
      multiSelectedOptions.delete(optId);
    } else {
      multiSelectedOptions.add(optId);
    }

    const item = document.getElementById(`opt-${optId}`);
    if (item) {
      const isChecked = multiSelectedOptions.has(optId);
      item.classList.toggle("multi-checked", isChecked);
      item.setAttribute("aria-checked", isChecked ? "true" : "false");

      const checkIcon = item.querySelector(".check-icon");
      if (checkIcon) {
        checkIcon.classList.toggle("is-hidden", !isChecked);
      }
    }

    updateMultiVerifyBar();
  }

  function updateMultiVerifyBar() {
    const count = multiSelectedOptions.size;
    DOM.multipleSelectedCount.textContent = `${count} opsi dipilih`;

    if (count > 0) {
      DOM.btnVerifyMultiple.disabled = false;
    } else {
      DOM.btnVerifyMultiple.disabled = true;
    }
  }

  function submitMultipleAnswer() {
    if (AppState.status !== "playing") return;
    if (multiSelectedOptions.size === 0) return;

    // Stop timer immediately upon confirmation
    stopQuestionTimer();

    AppState.status = "feedback";
    const q = QUIZ_CONFIG.questions[AppState.currentIndex];
    const maxPoints = q.points || 100;
    const selectedArr = Array.from(multiSelectedOptions);
    const correctArr = q.correctAnswers;

    // Lock options
    lockAllOptions();
    DOM.btnVerifyMultiple.disabled = true;

    // Calculate partial score strictly by formula:
    // Skor = max(0, Poin Maksimal × (Benar Dipilih − Salah Dipilih) / Total Jawaban Benar)
    let correctSelected = 0;
    let incorrectSelected = 0;

    selectedArr.forEach((optId) => {
      if (correctArr.includes(optId)) {
        correctSelected++;
      } else {
        incorrectSelected++;
      }
    });

    const totalCorrectOptions = correctArr.length;
    let earnedPoints = 0;

    if (totalCorrectOptions > 0) {
      const rawPoints = (maxPoints * (correctSelected - incorrectSelected)) / totalCorrectOptions;
      earnedPoints = Math.max(0, Math.round(rawPoints));
    }

    // Determine state
    const isFullyCorrect = correctSelected === totalCorrectOptions && incorrectSelected === 0;
    let feedbackType = "incorrect";
    if (isFullyCorrect) {
      feedbackType = "correct";
    } else if (earnedPoints > 0) {
      feedbackType = "partial";
    }

    // Highlight options visually
    const items = DOM.optionsContainer.querySelectorAll(".option-item");
    items.forEach((item) => {
      const itemId = item.id.replace("opt-", "");
      if (correctArr.includes(itemId)) {
        item.classList.add("is-correct");
      } else if (selectedArr.includes(itemId) && !correctArr.includes(itemId)) {
        item.classList.add("is-incorrect");
      }
    });

    // Record answer
    AppState.answersRecord.push({
      questionId: q.id,
      type: "multiple",
      selected: selectedArr,
      earnedPoints: earnedPoints,
      maxPoints: maxPoints,
      isFullyCorrect: isFullyCorrect
    });
    AppState.totalScore += earnedPoints;

    // Show Feedback Box
    displayFeedback(isFullyCorrect, feedbackType, earnedPoints, maxPoints, q);

    // Audio cue
    if (isFullyCorrect) {
      SoundFX.playCorrect();
    } else {
      SoundFX.playIncorrect();
    }

    // Show Next Button
    setupNextButton();
  }

  function lockAllOptions() {
    const items = DOM.optionsContainer.querySelectorAll(".option-item");
    items.forEach((item) => {
      item.classList.add("locked");
      item.removeAttribute("tabindex");
      const confirmTrigger = item.querySelector(".option-confirm-trigger");
      if (confirmTrigger) {
        confirmTrigger.style.display = "none";
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 11. Feedback Display & Next Step
   * -------------------------------------------------------------------------- */
  function displayFeedback(isFullyCorrect, feedbackType, earnedPoints, maxPoints, q) {
    DOM.feedbackBox.classList.remove("is-hidden", "feedback-correct", "feedback-partial", "feedback-incorrect");

    let titleText = "";
    let iconText = "";

    if (feedbackType === "correct") {
      DOM.feedbackBox.classList.add("feedback-correct");
      titleText = "Correct Answer! 🎉";
      iconText = "✓";
      DOM.feedbackScorePill.textContent = `+${earnedPoints} Poin`;
    } else if (feedbackType === "partial") {
      DOM.feedbackBox.classList.add("feedback-partial");
      titleText = "Jawaban Parsial";
      iconText = "⚖️";
      DOM.feedbackScorePill.textContent = `+${earnedPoints} / ${maxPoints} Poin`;
    } else {
      DOM.feedbackBox.classList.add("feedback-incorrect");
      titleText = "Incorrect Answer";
      iconText = "✕";
      DOM.feedbackScorePill.textContent = `0 / ${maxPoints} Poin`;
    }

    DOM.feedbackIcon.textContent = iconText;
    DOM.feedbackTitle.textContent = titleText;

    // Body content: explanation + correct key hint if not fully correct
    let explanationHTML = "";
    if (q.explanation) {
      explanationHTML += `<p>${escapeHtml(q.explanation)}</p>`;
    }

    if (!isFullyCorrect) {
      const correctStr = q.correctAnswers.join(", ");
      explanationHTML += `<div class="feedback-key-hint">Kunci Jawaban yang Benar: <strong>${correctStr}</strong></div>`;
    }

    DOM.feedbackExplanation.innerHTML = explanationHTML || "<p>Jawaban Anda telah dicatat oleh sistem.</p>";
  }

  function setupNextButton() {
    DOM.btnNextQuestion.classList.remove("is-hidden");
    const isLast = AppState.currentIndex === QUIZ_CONFIG.questions.length - 1;

    if (isLast) {
      DOM.btnNextLabel.textContent = "Finish Quiz";
    } else {
      DOM.btnNextLabel.textContent = "Next Question";
    }

    DOM.btnNextQuestion.focus();
  }

  function handleNextQuestion() {
    SoundFX.playClick();
    const isLast = AppState.currentIndex === QUIZ_CONFIG.questions.length - 1;

    if (isLast) {
      finishQuiz();
    } else {
      AppState.currentIndex++;
      renderCurrentQuestion();
    }
  }

  /* --------------------------------------------------------------------------
   * 12. Quiz Completion & Results Presentation
   * -------------------------------------------------------------------------- */
  function finishQuiz() {
    stopQuestionTimer();
    AppState.status = "finished";
    AppState.sessionTimestamp = new Date();

    // 100% Progress fill on HUD
    DOM.progressBarFill.style.width = "100%";
    DOM.progressPercent.textContent = "100%";

    // Calculate Statistics
    const totalQ = QUIZ_CONFIG.questions.length;
    const fullyCorrectCount = AppState.answersRecord.filter((r) => r.isFullyCorrect).length;
    const incorrectOrPartialCount = totalQ - fullyCorrectCount;
    const percentage = Math.round((AppState.totalScore / AppState.maxPossibleScore) * 100);

    // Populate Official Score Card
    DOM.resultTeamDisplay.textContent = AppState.teamName;
    DOM.resultTotalScore.textContent = AppState.totalScore.toLocaleString("id-ID");
    DOM.resultMaxScore.textContent = `/ ${AppState.maxPossibleScore.toLocaleString("id-ID")} Points`;
    DOM.resultPercentageBadge.textContent = `${percentage}% Accuracy`;

    DOM.statTotalQuestions.textContent = totalQ;
    DOM.statCorrectCount.textContent = fullyCorrectCount;
    DOM.statIncorrectCount.textContent = incorrectOrPartialCount;

    // Format Timestamp in Indonesian (e.g., 25 Okt 2026, 15:45 WIB)
    const formattedDate = formatIndonesianDate(AppState.sessionTimestamp);
    DOM.statTimestamp.textContent = formattedDate;

    // Serial Code
    DOM.resultSerialId.textContent = AppState.sessionId;

    // Show Result View
    showView("result");
  }

  function formatIndonesianDate(date) {
    if (!date) return "-";
    const months = [
      "Jan", "Feb", "Mar", "Apr", "Mei", "Jun",
      "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
    ];
    const d = date.getDate();
    const m = months[date.getMonth()];
    const y = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${d} ${m} ${y}, ${hh}:${mm} WIB`;
  }

  /* --------------------------------------------------------------------------
   * 13. PRINT RESULT (EXPORT HIGH RESOLUTION PNG) — HIGHEST PRIORITY
   * -------------------------------------------------------------------------- */
  async function handlePrintResult() {
    if (AppState.isExporting) return;
    AppState.isExporting = true;

    // UI state loading
    DOM.btnPrintResult.disabled = true;
    DOM.btnPrintText.textContent = "Generating PNG...";
    DOM.exportStatus.classList.remove("is-hidden");
    DOM.exportSpinner.classList.remove("is-hidden");
    DOM.exportStatusText.textContent = "Memproses gambar hasil beresolusi tinggi...";

    try {
      // Ensure html2canvas is loaded
      if (typeof window.html2canvas !== "function") {
        throw new Error("Library html2canvas tidak ditemukan di js/html2canvas.min.js.");
      }

      // Wait a tick to guarantee full font and layout stabilization
      await new Promise((resolve) => setTimeout(resolve, 150));

      const card = DOM.resultCard;

      // Render element to high quality canvas (scale: 2 for retina sharpness)
      const canvas = await window.html2canvas(card, {
        scale: 2,
        backgroundColor: "#FFFFFF",
        useCORS: true,
        logging: false,
        onclone: (clonedDoc) => {
          // Guarantee cloned result-card has crisp white background
          const clonedCard = clonedDoc.getElementById("result-card");
          if (clonedCard) {
            clonedCard.style.boxShadow = "none";
            clonedCard.style.margin = "0 auto";
          }
        }
      });

      // Prepare filename with sanitized team name
      const sanitizedTeam = AppState.teamName
        .replace(/[^a-zA-Z0-9_\-\s]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      const filename = `quiz-result-${sanitizedTeam || "team"}.png`;

      // Export canvas as Blob & Download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Gagal mengonversi canvas ke format PNG.");
        }

        const downloadUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement("a");
        downloadLink.href = downloadUrl;
        downloadLink.download = filename;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Revoke object URL after slight delay
        setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);

        // Feedback toast success
        DOM.exportSpinner.classList.add("is-hidden");
        DOM.exportStatusText.textContent = `✓ Berhasil diunduh: ${filename}`;

        setTimeout(() => {
          DOM.exportStatus.classList.add("is-hidden");
        }, 4500);
      }, "image/png");

    } catch (err) {
      console.error("Export Error:", err);
      DOM.exportSpinner.classList.add("is-hidden");
      DOM.exportStatusText.textContent = "Gagal membuat gambar hasil. Silakan klik coba lagi.";
      alert("Terjadi kendala saat mengekspor gambar:\n" + err.message);
    } finally {
      AppState.isExporting = false;
      DOM.btnPrintResult.disabled = false;
      DOM.btnPrintText.textContent = "Print Result (Download PNG)";
    }
  }

  /* --------------------------------------------------------------------------
   * 14. Restart Quiz Confirmation
   * -------------------------------------------------------------------------- */
  function openRestartModal() {
    DOM.modalRestart.classList.remove("is-hidden");
  }

  function closeRestartModal() {
    DOM.modalRestart.classList.add("is-hidden");
  }

  function confirmRestart() {
    stopQuestionTimer();
    closeRestartModal();
    DOM.inputTeamName.value = "";
    showView("start");
  }

  /* --------------------------------------------------------------------------
   * 15. Event Listeners Setup
   * -------------------------------------------------------------------------- */
  function setupEventListeners() {
    // Sound Toggle
    DOM.btnToggleSound.addEventListener("click", toggleSound);

    // Form Start Quiz
    DOM.formStartQuiz.addEventListener("submit", handleStartFormSubmit);

    // Verify Multiple Button
    DOM.btnVerifyMultiple.addEventListener("click", submitMultipleAnswer);

    // Next Question Button
    DOM.btnNextQuestion.addEventListener("click", handleNextQuestion);

    // Print Result (PNG Export)
    DOM.btnPrintResult.addEventListener("click", handlePrintResult);

    // Restart Modal Buttons
    DOM.btnRestartQuiz.addEventListener("click", openRestartModal);
    DOM.btnModalCancel.addEventListener("click", closeRestartModal);
    DOM.btnModalConfirm.addEventListener("click", confirmRestart);

    // Close modal on escape
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !DOM.modalRestart.classList.contains("is-hidden")) {
        closeRestartModal();
      }
    });

    // Prevent accidental page unload while quiz is in progress
    window.addEventListener("beforeunload", (e) => {
      if (AppState.status === "playing" || AppState.status === "feedback") {
        e.preventDefault();
        e.returnValue = "Quiz sedang berlangsung. Anda yakin ingin meninggalkan halaman?";
        return e.returnValue;
      }
    });
  }

  /* --------------------------------------------------------------------------
   * 16. Utility Helpers
   * -------------------------------------------------------------------------- */
  function escapeHtml(str) {
    if (!str) return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Self-Start on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }

})();

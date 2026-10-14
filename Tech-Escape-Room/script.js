// ════════════════════════════════════════════════════════════════════
// TECH ESCAPE ROOM — GAME LOGIC
// ════════════════════════════════════════════════════════════════════

// ── Disqualification lock (set in sessionStorage) ────────────────
if (sessionStorage.getItem("escapeGameLocked") === "true") {

    document.addEventListener("DOMContentLoaded", function () {

        document.body.innerHTML = `
            <div class="container">

                <div class="lock">🚫</div>

                <h1>GAME OVER</h1>

                <p class="warning">
                    SECURITY VIOLATION DETECTED
                </p>

                <p class="message">
                    This game session has been locked.
                    <br><br>
                    CONTACT THE EVENT COORDINATOR
                </p>

            </div>
        `;

    });

}

// ── DOM References ───────────────────────────────────────────────
const startBtn = document.getElementById("startBtn");

const resumeBtn = document.getElementById("resumeBtn");
const resumeMessage = document.getElementById("resumeMessage");
const startScreen = document.getElementById("startScreen");

const level1 = document.getElementById("level1");
const level2 = document.getElementById("level2");

const level3 = document.getElementById("level3");

const level4 = document.getElementById("level4");

const level5 = document.getElementById("level5");

const finalLevel = document.getElementById("finalLevel");
const successScreen = document.getElementById("successScreen");

const timerBox = document.getElementById("timerBox");
const timerDisplay = document.getElementById("timer");

const teamNameInput = document.getElementById("teamNameInput");
const teamInputWrap = document.getElementById("teamInputWrap");
const teamNameError = document.getElementById("teamNameError");
const teamSection = document.getElementById("teamSection");
const teamNameDisplay = document.getElementById("teamNameDisplay");

// ── Game State ───────────────────────────────────────────────────
let teamName = "";
let timeLeft = 30 * 60;
let timerInterval;

const totalGameTime = 30 * 60;
let hintsRemaining = 2;
let hintsUsed = 0;
const penaltyPerHint = 5 * 60;
let gameStarted = false;
let gameCompleted = false;
let currentLevel = 0;

// ── Question Bank System ─────────────────────────────────────────

// The 5 picked questions for the current game (filled on new/resume)
var pickedQuestions = {};  // { level1: questionObj, level2: questionObj, ... }

/**
 * Validate that all 5 question banks exist and are non-empty.
 * Returns an error string or null if everything is OK.
 */
function validateBanks() {
    if (!window.QUESTION_BANK) {
        return "QUESTION_BANK is not defined. Are the question bank scripts loaded?";
    }
    for (var i = 1; i <= 5; i++) {
        var key = "level" + i;
        var bank = window.QUESTION_BANK[key];
        if (!bank || !Array.isArray(bank) || bank.length === 0) {
            return "Question bank for " + key + " is missing or empty. Check questions/" + key + ".js";
        }
    }
    return null;
}

/**
 * Pick one random question from a bank, avoiding `avoidId` when possible.
 */
function pickFromBank(bank, avoidId) {
    if (bank.length === 1) return bank[0];
    // Filter out the one to avoid
    var filtered = bank.filter(function (q) { return q.id !== avoidId; });
    if (filtered.length === 0) filtered = bank;
    return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Pick fresh questions for all 5 levels.
 * Tries to avoid the same question as the previous game when possible.
 */
function pickAllQuestions() {
    var previousIds = {};
    try {
        var saved = localStorage.getItem("techEscapeRoomSave");
        if (saved) {
            var parsed = JSON.parse(saved);
            if (parsed.pickedIds) previousIds = parsed.pickedIds;
        }
    } catch (e) { /* ignore */ }

    var picked = {};
    for (var i = 1; i <= 5; i++) {
        var key = "level" + i;
        picked[key] = pickFromBank(window.QUESTION_BANK[key], previousIds[key] || null);
    }
    return picked;
}

/**
 * Restore picked questions from saved ids.
 * Falls back to a fresh random pick if a saved id no longer exists.
 */
function restoreQuestions(savedIds) {
    var picked = {};
    for (var i = 1; i <= 5; i++) {
        var key = "level" + i;
        var bank = window.QUESTION_BANK[key];
        var found = null;
        if (savedIds && savedIds[key]) {
            for (var j = 0; j < bank.length; j++) {
                if (bank[j].id === savedIds[key]) {
                    found = bank[j];
                    break;
                }
            }
        }
        // Fallback: pick randomly if saved id not found
        if (!found) {
            found = bank[Math.floor(Math.random() * bank.length)];
        }
        picked[key] = found;
    }
    return picked;
}

/**
 * Render a single level's question into the DOM.
 * Uses textContent to safely display code with angle brackets, etc.
 */
function renderLevel(levelNum) {
    var key = "level" + levelNum;
    var q = pickedQuestions[key];
    if (!q) return;

    // Title
    var titleEl = document.getElementById(key + "-title");
    if (titleEl) titleEl.textContent = q.title;

    // Message
    var msgEl = document.getElementById(key + "-message");
    if (msgEl) msgEl.textContent = q.message;

    // Display area
    var displayEl = document.getElementById(key + "-display");
    if (displayEl) {
        displayEl.innerHTML = ""; // clear previous
        if (q.displayType === "code") {
            var codeBox = document.createElement("div");
            codeBox.className = "code-box";
            var pre = document.createElement("pre");
            pre.textContent = q.display;
            codeBox.appendChild(pre);
            displayEl.appendChild(codeBox);
        } else {
            // "heading" — render as <h2>
            var h2 = document.createElement("h2");
            h2.textContent = q.display;
            displayEl.appendChild(h2);
        }
    }

    // Footer message (optional extra paragraph after display)
    var footerEl = document.getElementById(key + "-footer");
    if (footerEl) {
        if (q.footerMessage) {
            // Split on newlines to create separate lines with <br>
            footerEl.textContent = "";
            var lines = q.footerMessage.split("\n");
            for (var k = 0; k < lines.length; k++) {
                if (k > 0) footerEl.appendChild(document.createElement("br"));
                footerEl.appendChild(document.createTextNode(lines[k]));
            }
            footerEl.style.display = "";
        } else {
            footerEl.textContent = "";
            footerEl.style.display = "none";
        }
    }

    // Input placeholder and maxLength
    var input = document.getElementById("answer" + levelNum);
    if (input) {
        input.placeholder = q.placeholder || "Enter answer";
        if (q.maxLength) {
            input.maxLength = q.maxLength;
        } else {
            input.removeAttribute("maxlength");
        }
        input.value = "";
    }
}

/**
 * Render all 5 levels + build the final level clues.
 */
function renderAllLevels() {
    for (var i = 1; i <= 5; i++) {
        renderLevel(i);
    }
    renderFinalClues();
}

/**
 * Build the final decryption clues from the picked questions.
 */
function renderFinalClues() {
    var romanNumerals = ["I", "II", "III", "IV", "V"];
    var lines = [];
    for (var i = 1; i <= 5; i++) {
        var key = "level" + i;
        var q = pickedQuestions[key];
        var numeral = romanNumerals[i - 1] + ".";
        // Pad the numeral to align: "I.  ", "II. ", "III."
        while (numeral.length < 4) numeral += " ";
        lines.push(numeral + " " + q.finalClue);
    }
    lines.push("");
    lines.push("Combine the five digits in order.");

    var pre = document.getElementById("finalCluesDisplay");
    if (pre) {
        pre.textContent = lines.join("\n");
    }
}

/**
 * Get the dynamically computed final exit code from picked questions.
 */
function getFinalExitCode() {
    var code = "";
    for (var i = 1; i <= 5; i++) {
        code += pickedQuestions["level" + i].finalDigit;
    }
    return code;
}

/**
 * Get the picked question ids as a simple object for saving.
 */
function getPickedIds() {
    var ids = {};
    for (var i = 1; i <= 5; i++) {
        var key = "level" + i;
        ids[key] = pickedQuestions[key].id;
    }
    return ids;
}

/**
 * Show a fatal error message to the player (bank missing / empty).
 */
function showBankError(errorMsg) {
    document.body.innerHTML = '<div class="container">' +
        '<div class="lock">⚠</div>' +
        '<h1>CONFIGURATION ERROR</h1>' +
        '<p class="warning">QUESTION BANK FAILURE</p>' +
        '<p class="message">' + errorMsg + '</p>' +
        '</div>';
}

// ── Validate banks on load ───────────────────────────────────────
var bankError = validateBanks();
if (bankError) {
    showBankError(bankError);
}

// ── Save / Resume ────────────────────────────────────────────────

function saveGame() {

    if (!gameStarted || gameCompleted) {
        return;
    }

    var gameData = {
        teamName: teamName,
        currentLevel: currentLevel,
        timeLeft: timeLeft,
        hintsRemaining: hintsRemaining,
        hintsUsed: hintsUsed,
        pickedIds: getPickedIds()
    };

    localStorage.setItem(
        "techEscapeRoomSave",
        JSON.stringify(gameData)
    );
}

function checkSavedGame() {

    var savedGameStr = localStorage.getItem("techEscapeRoomSave");

    var securityLocked =
        sessionStorage.getItem("escapeGameLocked") === "true";

    if (savedGameStr && !securityLocked) {
        resumeBtn.style.display = "inline-block";
        resumeMessage.style.display = "block";
        startBtn.style.display = "none";
        if (teamSection) {
            teamSection.style.display = "none";
        }

        try {
            var savedGame = JSON.parse(savedGameStr);
            if (savedGame && savedGame.teamName) {
                resumeMessage.textContent = "";
                var line1 = document.createTextNode("⚡ SAVED GAME DETECTED");
                var br1 = document.createElement("br");
                var teamSpan = document.createElement("span");
                teamSpan.style.color = "var(--accent)";
                teamSpan.style.fontWeight = "700";
                teamSpan.textContent = "TEAM: " + savedGame.teamName.toUpperCase();
                var br2 = document.createElement("br");
                var line2 = document.createTextNode("Previous session was interrupted.");
                resumeMessage.appendChild(line1);
                resumeMessage.appendChild(br1);
                resumeMessage.appendChild(teamSpan);
                resumeMessage.appendChild(br2);
                resumeMessage.appendChild(line2);
            }
        } catch (e) { /* ignore */ }
    }
}

checkSavedGame();

resumeBtn.addEventListener(

    "click", function () {

    var savedGame = JSON.parse(
        localStorage.getItem("techEscapeRoomSave")
    );

    if (!savedGame) {
        return;
    }

    // Restore saved values
    teamName = savedGame.teamName || "ANONYMOUS";
    currentLevel = savedGame.currentLevel;
    timeLeft = savedGame.timeLeft;
    hintsRemaining = savedGame.hintsRemaining;
    hintsUsed = savedGame.hintsUsed;

    // Restore (or fallback-pick) the same questions
    pickedQuestions = restoreQuestions(savedGame.pickedIds || null);
    renderAllLevels();

    gameStarted = true;
    gameCompleted = false;

    // Hide start screen
    startScreen.style.display = "none";

    // Hide all game levels first
    level1.style.display = "none";
    level2.style.display = "none";
    level3.style.display = "none";
    level4.style.display = "none";
    level5.style.display = "none";
    finalLevel.style.display = "none";

    // Open saved level
    if (currentLevel === 1) {
        level1.style.display = "block";
    }
    else if (currentLevel === 2) {
        level2.style.display = "block";
    }
    else if (currentLevel === 3) {
        level3.style.display = "block";
    }
    else if (currentLevel === 4) {
        level4.style.display = "block";
    }
    else if (currentLevel === 5) {
        level5.style.display = "block";
    }
    else if (currentLevel === 6) {
        finalLevel.style.display = "block";
    }

    // Show timer
    timerBox.style.display = "block";

    // Restore timer display immediately
    var minutes = Math.floor(timeLeft / 60);
    var seconds = timeLeft % 60;

    timerDisplay.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

    // Enter fullscreen again
    document.documentElement.requestFullscreen();

    // Continue timer
    startTimer();
});

if (teamNameInput) {
    teamNameInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
            startBtn.click();
        }
    });

    teamNameInput.addEventListener("input", function () {
        if (teamNameError) teamNameError.textContent = "";
        if (teamInputWrap) teamInputWrap.classList.remove("input-shake");
    });
}

// Global Enter key support for the start screen (when input is not focused or when resuming)
document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !gameStarted) {
        var startScreenEl = document.getElementById("startScreen");
        if (startScreenEl && startScreenEl.style.display !== "none") {
            if (resumeBtn && resumeBtn.style.display !== "none") {
                e.preventDefault();
                resumeBtn.click();
            } else if (startBtn && startBtn.style.display !== "none") {
                e.preventDefault();
                startBtn.click();
            }
        }
    }
});

startBtn.addEventListener("click", function () {
    // NEW GAME — pick fresh questions
    if (bankError) { showBankError(bankError); return; }

    var enteredName = teamNameInput ? teamNameInput.value.trim() : "";
    if (!enteredName) {
        if (teamNameError) {
            teamNameError.textContent = "⚠ TEAM NAME REQUIRED TO INITIATE PROTOCOL";
        }
        if (teamInputWrap) {
            teamInputWrap.classList.remove("input-shake");
            void teamInputWrap.offsetWidth;
            teamInputWrap.classList.add("input-shake");
        }
        if (teamNameInput) {
            teamNameInput.focus();
        }
        return;
    }

    teamName = enteredName;
    if (teamNameError) teamNameError.textContent = "";

    pickedQuestions = pickAllQuestions();
    renderAllLevels();

    // Fresh 30 minutes
    timeLeft = 30 * 60;
    gameStarted = true;
    gameCompleted = false;
    currentLevel = 1;
    startScreen.style.display = "none";
    level1.style.display = "block";

    timerBox.style.display = "block";
    if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(function () { /* ignore if blocked */ });
    }
    startTimer();

});


// ════════════════════════════════════════════════════════════════
// LEVEL ANSWER CHECKING (generic)
// ════════════════════════════════════════════════════════════════

/**
 * Check the player's answer for a given level.
 * Uses the picked question's `answers` array.
 */
function checkAnswer(levelNum, successMsg, failMsg, nextLevelNum) {

    var answer = document.getElementById("answer" + levelNum).value.trim().toLowerCase();
    var result = document.getElementById("result" + levelNum);

    var q = pickedQuestions["level" + levelNum];
    var correct = false;

    for (var i = 0; i < q.answers.length; i++) {
        if (answer === q.answers[i].trim().toLowerCase()) {
            correct = true;
            break;
        }
    }

    if (correct) {

        result.textContent = successMsg;
        result.style.color = "#00ff88";

        setTimeout(function () {

            document.getElementById("level" + levelNum).style.display = "none";
            currentLevel = nextLevelNum;

            if (nextLevelNum <= 5) {
                document.getElementById("level" + nextLevelNum).style.display = "block";
            } else {
                // nextLevelNum === 6 → final level
                finalLevel.style.display = "block";
            }

            saveGame();

        }, 1000);

    } else {

        result.textContent = failMsg;
        result.style.color = "#ff3b3b";

    }

}

// LEVEL 1

var submit1 = document.getElementById("submit1");

submit1.addEventListener("click", function () {
    checkAnswer(1, "ACCESS GRANTED ✓", "ACCESS DENIED ✕", 2);
});

document.getElementById("answer1").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); submit1.click(); }
});

// LEVEL 2 - BUG HUNTER

var submit2 = document.getElementById("submit2");

submit2.addEventListener("click", function () {
    checkAnswer(2, "BUG FIXED — ACCESS GRANTED ✓", "BUG STILL EXISTS — ACCESS DENIED ✕", 3);
});

document.getElementById("answer2").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); submit2.click(); }
});

// LEVEL 3 - BINARY VAULT

var submit3 = document.getElementById("submit3");

submit3.addEventListener("click", function () {
    checkAnswer(3, "VAULT UNLOCKED — ACCESS GRANTED ✓", "INVALID SECURITY KEY — ACCESS DENIED ✕", 4);
});

document.getElementById("answer3").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); submit3.click(); }
});

// LEVEL 4 - SECURITY LOOP

var submit4 = document.getElementById("submit4");

submit4.addEventListener("click", function () {
    checkAnswer(4, "KEY RECOVERED — ACCESS GRANTED ✓", "INVALID KEY — ACCESS DENIED ✕", 5);
});

document.getElementById("answer4").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); submit4.click(); }
});

// LEVEL 5 - FIND THE IMPOSTORS

var submit5 = document.getElementById("submit5");

submit5.addEventListener("click", function () {
    checkAnswer(5, "IMPOSTORS DETECTED — ACCESS GRANTED ✓", "SECURITY KEY INVALID — ACCESS DENIED ✕", 6);
});

document.getElementById("answer5").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); submit5.click(); }
});

// ════════════════════════════════════════════════════════════════
// FINAL EXIT CODE (dynamic)
// ════════════════════════════════════════════════════════════════

var finalBtn = document.getElementById("finalBtn");

document.getElementById("finalCode").addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); finalBtn.click(); }
});

finalBtn.addEventListener("click", function () {

    var code = document
        .getElementById("finalCode")
        .value
        .trim();

    var result = document.getElementById("finalResult");

    var correctCode = getFinalExitCode();

    if (code === correctCode) {
        gameCompleted = true;

        clearInterval(timerInterval);
timerBox.style.display = "none";
var timeUsed = totalGameTime - timeLeft;

var usedMinutes = Math.floor(timeUsed / 60);
var usedSeconds = timeUsed % 60;

var formattedTime =
    String(usedMinutes).padStart(2, "0") +
    ":" +
    String(usedSeconds).padStart(2, "0");

document.getElementById("escapeTime").textContent =
    "⏱ ESCAPE TIME: " + formattedTime;

// CALCULATE HINT PENALTY

var totalPenalty = hintsUsed * penaltyPerHint;

var penaltyMinutes = Math.floor(totalPenalty / 60);
var penaltySeconds = totalPenalty % 60;


// CALCULATE FINAL COMPETITION TIME

var finalTimeInSeconds = timeUsed + totalPenalty;

var finalMinutes = Math.floor(finalTimeInSeconds / 60);
var finalSeconds = finalTimeInSeconds % 60;

var formattedFinalTime =
    String(finalMinutes).padStart(2, "0") +
    ":" +
    String(finalSeconds).padStart(2, "0");


// DISPLAY RESULTS

if (teamNameDisplay) {
    teamNameDisplay.textContent = "TEAM: " + (teamName ? teamName.toUpperCase() : "ANONYMOUS");
}

document.getElementById("hintsUsedDisplay").textContent =
    "💡 HINTS USED: " + hintsUsed + " / 2";

document.getElementById("penaltyDisplay").textContent =
    "⚠ PENALTY: +" +
    String(penaltyMinutes).padStart(2, "0") +
    ":" +
    String(penaltySeconds).padStart(2, "0");

document.getElementById("finalTime").textContent =
    "🏆 FINAL TIME: " + formattedFinalTime;
        result.textContent = "EXIT CODE ACCEPTED ✓";
        result.style.color = "#00ff88";

        // Clear saved game on success
        localStorage.removeItem("techEscapeRoomSave");

        setTimeout(function () {
            finalLevel.style.display = "none";
            successScreen.style.display = "block";
        }, 1000);

    } else {

        result.textContent = "INVALID EXIT CODE — SYSTEM REMAINS LOCKED ✕";
        result.style.color = "#ff3b3b";

    }

});

function startTimer() {

    timerInterval = setInterval(function () {

        timeLeft--;
        saveGame();

        var minutes = Math.floor(timeLeft / 60);
        var seconds = timeLeft % 60;

        timerDisplay.textContent =
            String(minutes).padStart(2, "0") +
            ":" +
            String(seconds).padStart(2, "0");

            // LAST 5 MINUTES WARNING
if (timeLeft <= 5 * 60) {
    timerBox.classList.add("timer-warning");
}

        if (timeLeft <= 0) {

            clearInterval(timerInterval);

            var safeTeam = (teamName ? teamName : "UNKNOWN").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            document.body.innerHTML = `
                <div class="container">
                    <div class="lock">🔒</div>

                    <h1>TIME OVER</h1>

                    <p class="warning">
                        SYSTEM PERMANENTLY LOCKED
                    </p>

                    <h2 id="teamNameDisplay">TEAM: ${safeTeam.toUpperCase()}</h2>

                    <p class="message">
                        You failed to escape within the time limit.
                    </p>
                </div>
            `;
        }

    }, 1000);
}

// ==========================
// HINT SYSTEM
// ==========================

function useHint(level) {

    var button = document.getElementById("hint" + level);
    var text = document.getElementById("hintText" + level);

    // Already used this level's hint
    if (button.disabled) {
        return;
    }

    // No hints remaining
    if (hintsRemaining === 0) {
        text.textContent = "⚠ NO HINTS REMAINING";
        text.style.color = "#ff3b3b";
        return;
    }

    hintsRemaining--;
    hintsUsed++;

    // Get the hint from the picked question
    var q = pickedQuestions["level" + level];
    var hintMsg = q ? q.hint : "No hint available.";

    text.textContent = "";
    text.appendChild(document.createTextNode("💡 HINT: " + hintMsg));
    text.appendChild(document.createElement("br"));
    text.appendChild(document.createElement("br"));
    text.appendChild(document.createTextNode("⚠ PENALTY ADDED: +5 MINUTES"));
    text.appendChild(document.createElement("br"));
    text.appendChild(document.createTextNode("HINTS REMAINING: " + hintsRemaining));

    text.style.color = "#ffd700";

    button.disabled = true;
    button.textContent = "HINT USED ✓";

    saveGame();
}


// HINT BUTTONS

document.getElementById("hint1").addEventListener("click", function () {
    useHint(1);
});

document.getElementById("hint2").addEventListener("click", function () {
    useHint(2);
});

document.getElementById("hint3").addEventListener("click", function () {
    useHint(3);
});

document.getElementById("hint4").addEventListener("click", function () {
    useHint(4);
});

document.getElementById("hint5").addEventListener("click", function () {
    useHint(5);
});

// ==========================
// FULLSCREEN SECURITY
// ==========================

document.addEventListener("fullscreenchange", function () {

    if (gameStarted && !gameCompleted && !document.fullscreenElement) {
        sessionStorage.setItem("escapeGameLocked", "true");
       clearInterval(timerInterval);

        document.body.innerHTML = `
            <div class="container">

                <div class="lock">🚫</div>

                <h1>GAME OVER</h1>

                <p class="warning">
                    SECURITY VIOLATION DETECTED
                </p>

                <p class="message">
                    Fullscreen mode was exited.
                    <br><br>
                    SYSTEM LOCKED
                </p>

            </div>
        `;
    }

});

// ==========================
// ORGANIZER SECRET RESET
// ==========================

document.addEventListener("keydown", function (event) {

  if (
    event.ctrlKey &&
    event.altKey &&
    event.shiftKey &&
    event.key.toLowerCase() === "k"
) {

        sessionStorage.removeItem("escapeGameLocked");
localStorage.removeItem("techEscapeRoomSave");
        location.reload();
    }

});
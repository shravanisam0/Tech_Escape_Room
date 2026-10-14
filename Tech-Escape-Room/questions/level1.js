/*
 * ─── QUESTION BANK: LEVEL 1 ────────────────────────────────────────
 *
 * Schema for each question object:
 *   id            — unique identifier, never reuse across any level
 *   title         — the <h1> heading for the level
 *   message       — introductory paragraph shown below the heading
 *   display       — the main question content (string or template literal)
 *   displayType   — "heading" renders as <h2>, "code" renders inside <pre>
 *   footerMessage — optional extra paragraph after the display block
 *   placeholder   — input placeholder text
 *   maxLength     — optional input maxlength (null = no limit)
 *   answers       — array of accepted answers (compared after trim + toLowerCase)
 *   hint          — the hint text shown when the player uses a hint
 *   finalClue     — the clue sentence shown on the final decryption level
 *   finalDigit    — the single digit this question contributes to the exit code
 *
 * IMPORTANT: finalClue and finalDigit must agree with the answer.
 *            If you change the answer, update both.
 */

window.QUESTION_BANK = window.QUESTION_BANK || {};
window.QUESTION_BANK.level1 = [
    {
        id: "l1-q1",
        title: "LOGIC LOCK",
        message: "Crack the sequence to unlock the next level.",
        display: "2, 6, 12, 20, 30, ?",
        displayType: "heading",
        footerMessage: "",
        placeholder: "Enter answer",
        maxLength: null,
        answers: ["42"],
        hint: "Look carefully at how the difference between consecutive numbers changes.",
        finalClue: "From the first lock, keep what stands at the beginning.",
        finalDigit: "4"
    },
    {
        id: "l1-q2",
        title: "NUMBER LOCK",
        message: "Find the missing number in the sequence.",
        display: "3, 8, 15, 24, 35, ?",
        displayType: "heading",
        footerMessage: "",
        placeholder: "Enter answer",
        maxLength: null,
        answers: ["48"],
        hint: "Look at how much is added each time.",
        finalClue: "From this lock, keep the digit that stands at the beginning.",
        finalDigit: "4"
    },
    {
        id: "l1-q3",
        title: "SEQUENCE LOCK",
        message: "Complete the sequence.",
        display: "4, 8, 14, 22, 32, ?",
        displayType: "heading",
        footerMessage: "",
        placeholder: "Enter answer",
        maxLength: null,
        answers: ["44"],
        hint: "Look at how the difference between consecutive numbers changes.",
        finalClue: "From this lock, keep what stands at the beginning.",
        finalDigit: "4"
    },
    {
        id: "l1-q4",
        title: "PATTERN LOCK",
        message: "Find the missing number.",
        display: "4, 9, 16, 25, 36, 49, ?",
        displayType: "heading",
        footerMessage: "",
        placeholder: "Enter answer",
        maxLength: null,
        answers: ["64"],
        hint: "Think about the relationship between each number and its position.",
        finalClue: "From this lock, keep what stands in the second position.",
        finalDigit: "4"
    },
    {
        id: "l1-q5",
        title: "PATTERN LOCK",
        message: "Find the missing number.",
        display: "3, 7, 13, 21, 31, ?",
        displayType: "heading",
        footerMessage: "",
        placeholder: "Enter answer",
        maxLength: null,
        answers: ["43"],
        hint: "Look at the differences between consecutive numbers.",
        finalClue: "From this lock, keep what stands in the second position.",
        finalDigit: "4"
    }

];

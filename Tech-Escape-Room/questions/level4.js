/*
 * ─── QUESTION BANK: LEVEL 4 ────────────────────────────────────────
 *
 * Schema: see questions/level1.js for full documentation.
 *
 * IMPORTANT: finalClue and finalDigit must agree with the answer.
 *            If you change the answer, update both.
 */

window.QUESTION_BANK = window.QUESTION_BANK || {};
window.QUESTION_BANK.level4 = [
    {
        id: "l4-q1",
        title: "SECURITY LOOP",
        message: "Trace the execution carefully and recover the final value of KEY to unlock the next level.",
        display: `int i, key = 0;

for(i = 1; i <= 6; i++)
{
    if(i % 2 == 0)
        key = key + i;
    else
        key = key - 1;
}

printf("%d", key);`,
        displayType: "code",
        footerMessage: "",
        placeholder: "Enter final key",
        maxLength: null,
        answers: ["9"],
        hint: "Track the value of 'key' separately after every loop iteration.",
        finalClue: "The security loop holds only one digit. Keep it.",
        finalDigit: "9"
    },
    {
        id: "l4-q2",
        title: "COUNTDOWN LOCK",
        message: "The countdown system modifies the security key at every step. Find the final value.",
        display: `int i = 1, key = 0;

while(i <= 6)
{
    if(i % 2 == 0)
        key = key + 2;
    else
        key = key + 1;

    i++;
}

printf("%d", key);`,
        displayType: "code",
        footerMessage: "",
        placeholder: "Enter final key",
        maxLength: null,
        answers: ["9"],
        hint: "Separate the odd and even iterations and track what each contributes.",
        finalClue: "The loop leaves behind a single digit. Keep it.",
        finalDigit: "9"
    },
    {
        id: "l4-q3",
        title: "REVERSE TRACE",
        message: "The security system runs backwards. Trace every iteration and recover the final key.",
        display: `int i, key = 0;

for(i = 6; i >= 1; i--)
{
    if(i % 2 == 0)
        key = key + 1;
    else
        key = key + 2;
}

printf("%d", key);`,
        displayType: "code",
        footerMessage: "",
        placeholder: "Enter final key",
        maxLength: null,
        answers: ["9"],
        hint: "The loop runs from 6 down to 1. Track what is added for odd and even values.",
        finalClue: "The final value is the only digit produced by the loop.",
        finalDigit: "9"
    },
    {
        id: "l4-q4",
        title: "ACCUMULATOR LOCK",
        message: "The system repeatedly updates its security value. Trace each operation and recover the final key.",
        display: `int i, key = 0;

for(i = 1; i <= 4; i++)
{
    key = key + 2;
}

key = key + 1;

printf("%d", key);`,
        displayType: "code",
        footerMessage: "",
        placeholder: "Enter final key",
        maxLength: null,
        answers: ["9"],
        hint: "Track the value of key after every update, including the statement after the loop.",
        finalClue: "The security system leaves a single digit. Keep it.",
        finalDigit: "9"
    },
    {
        id: "l4-q5",
        title: "PARITY LOCK",
        message: "The security counter changes depending on whether each number is odd or even. Trace the execution and recover the final key.",
        display: `int i, key = 0;

for(i = 1; i <= 5; i++)
{
    if(i % 2 == 0)
        key = key + 3;
    else
        key = key + 1;
}

printf("%d", key);`,
        displayType: "code",
        footerMessage: "",
        placeholder: "Enter final key",
        maxLength: null,
        answers: ["9"],
        hint: "Check whether each value of i is odd or even before updating key.",
        finalClue: "The security loop leaves behind a single digit. Keep it.",
        finalDigit: "9"
    }
];

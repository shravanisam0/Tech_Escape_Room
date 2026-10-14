/*
 * ─── QUESTION BANK: LEVEL 2 ────────────────────────────────────────
 *
 * Schema: see questions/level1.js for full documentation.
 *
 * IMPORTANT: finalClue and finalDigit must agree with the answer.
 *            If you change the answer, update both.
 */

window.QUESTION_BANK = window.QUESTION_BANK || {};
window.QUESTION_BANK.level2 = [
    {
        id: "l2-q1",
        title: "BUG HUNTER",
        message: "The security program contains a logical bug. Find and fix it to continue.",
        display: `#include <stdio.h>

int main()
{
    int password = 10;

    if(password = 20)
    {
        printf("ACCESS GRANTED");
    }
    else
    {
        printf("ACCESS DENIED");
    }

    return 0;
}`,
        displayType: "code",
        footerMessage: "The program should compare the password with 20.\nEnter the correct operator to fix the condition.",
        placeholder: "Enter correct operator",
        maxLength: null,
        answers: ["=="],
        hint: "In C, assigning a value and comparing two values require different operators.",
        finalClue: "The repaired operator was made of twins. Count them.",
        finalDigit: "2"
    },
    {
        id: "l2-q2",
        title: "LOOP LOCK",
        message: "The security loop is running for the wrong number of times. Correct its condition.",
        display: `#include <stdio.h>

int main()
{
    for(int i = 0; i < 5; i++)
    {
        printf("%d ", i);
    }

    return 0;
}`,
        displayType: "code",
        footerMessage: "The loop should stop after printing 0 and 1.\nEnter the correct limit.",
        placeholder: "Enter limit",
        maxLength: null,
        answers: ["2"],
        hint: "The loop should execute exactly twice.",
        finalClue: "The number of required executions is the digit to retain.",
        finalDigit: "2"
    },
    {
        id: "l2-q3",
        title: "LOGIC BREAKER",
        message: "The access condition is incorrect. Replace the operator to restore the security check.",
        display: `#include <stdio.h>

int main()
{
    int pin = 1234;
    int otp = 5678;

    if(pin == 1234 || otp == 9999)
    {
        printf("ACCESS GRANTED");
    }

    return 0;
}`,
        displayType: "code",
        footerMessage: "Both the PIN and OTP must be correct before access is granted.\nEnter the correct logical operator.",
        placeholder: "Enter operator",
        maxLength: null,
        answers: ["&&"],
        hint: "Both conditions must be true, not just one.",
        finalClue: "The repaired operator contains two identical symbols. Count them.",
        finalDigit: "2"
    },
    {
        id: "l2-q4",
        title: "BIT SHIFT",
        message: "The data packet is being shifted incorrectly. Fix the operator.",
        display: `#include <stdio.h>

int main()
{
    int data = 8;

    data << 2;

    printf("%d", data);

    return 0;
}`,
        displayType: "code",
        footerMessage: "The data needs to be shifted two positions to the right.\nEnter the correct shift operator.",
        placeholder: "Enter operator",
        maxLength: null,
        answers: [">>"],
        hint: "Use the shift operator that moves bits toward the right.",
        finalClue: "Once the operator is repaired, look to the value it was meant to move.",
        finalDigit: "2"
    },
    {
        id: "l2-q5",
        title: "COUNTER CRASH",
        message: "The counter is not increasing correctly. Find the missing operator.",
        display: `#include <stdio.h>

int main()
{
    int count = 1;

    count+;

    printf("%d", count);

    return 0;
}`,
        displayType: "code",
        footerMessage: "The counter must increase by exactly one.\nEnter the correct operator after count.",
        placeholder: "Enter operator",
        maxLength: null,
        answers: ["++"],
        hint: "There is a shorthand operator in C for increasing a value by one.",
        finalClue: "The repaired operator uses the same symbol twice. Count the symbols.",
        finalDigit: "2"
    }
];

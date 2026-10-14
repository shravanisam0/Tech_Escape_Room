/*
 * ─── QUESTION BANK: LEVEL 5 ────────────────────────────────────────
 *
 * Schema: see questions/level1.js for full documentation.
 *
 * IMPORTANT: finalClue and finalDigit must agree with the answer.
 *            If you change the answer, update both.
 */

window.QUESTION_BANK = window.QUESTION_BANK || {};
window.QUESTION_BANK.level5 = [
   {
      id: "l5-q1",
      title: "FIND THE IMPOSTORS",
      message: "Two false statements have entered the system. Identify the impostors and generate the security key.",
      display: `A. RAM is volatile memory.

B. An interpreter translates the entire
   program before execution.

C. Cache memory is faster than RAM.

D. ROM is volatile memory.


SECURITY PROTOCOL:

1. Identify the TWO false statements (IMPOSTORS).

2. Take their position numbers
   (A=1, B=2, C=3, D=4).

3. Multiply their positions and add
   the total number of TRUE statements.`,
      displayType: "code",
      footerMessage: "",
      placeholder: "Enter security key",
      maxLength: null,
      answers: ["10"],
      hint: "Think about how an interpreter works and which type of memory keeps its data without power.",
      finalClue: "From the impostor key, keep what comes first.",
      finalDigit: "1"
   },
   {
      id: "l5-q2",
      title: "SYSTEM TRUTH CHECK",
      message: "Two statements in the security database are false. Find them and calculate the access key.",
      display: `A. CPU performs arithmetic operations.

B. SSD is a type of volatile memory.

C. RAM temporarily stores data.

D. ROM retains data without power.


SECURITY PROTOCOL:

1. Identify the TWO false statements.

2. Take their position numbers
   (A=1, B=2, C=3, D=4).

3. Add their positions and multiply
   the result by the number of TRUE statements.`,
      displayType: "code",
      footerMessage: "",
      placeholder: "Enter security key",
      maxLength: null,
      answers: ["10"],
      hint: "Think about which type of memory loses its contents when power is removed.",
      finalClue: "From the security key, keep what stands at the beginning.",
      finalDigit: "1"
   },
   {
      id: "l5-q3",
      title: "PROGRAMMING IMPOSTORS",
      message: "Two false programming statements have entered the system. Find them and generate the security key.",
      display: `A. A variable can store a value.

B. A loop can execute a block of code repeatedly.

C. An array in C always starts at index 1.

D. The = operator compares two values for equality.


SECURITY PROTOCOL:

1. Identify the TWO false statements.

2. Take their position numbers
   (A=1, B=2, C=3, D=4).

3. Multiply their positions and add
   the total number of TRUE statements.`,
      displayType: "code",
      footerMessage: "",
      placeholder: "Enter security key",
      maxLength: null,
      answers: ["14"],
      hint: "Think about the starting index of arrays and the difference between = and ==.",
      finalClue: "From the impostor key, keep what comes first.",
      finalDigit: "1"
   },
   {
      id: "l5-q4",
      title: "C CODE IMPOSTORS",
      message: "Two statements about C programming are false. Find the impostors and generate the security key.",
      display: `A. Every C program can contain a main() function.

B. The == operator assigns a value to a variable.

C. Array indexing in C normally begins at 0.

D. The ++ operator decreases a variable by one.


SECURITY PROTOCOL:

1. Identify the TWO false statements.

2. Take their position numbers
   (A=1, B=2, C=3, D=4).

3. Multiply their positions and add
   the total number of TRUE statements.`,
      displayType: "code",
      footerMessage: "",
      placeholder: "Enter security key",
      maxLength: null,
      answers: ["10"],
      hint: "Think carefully about == and the purpose of the ++ operator.",
      finalClue: "The first position of the key holds your final digit.",
      finalDigit: "1"
   },
   {
      id: "l5-q5",
      title: "C PROGRAMMING IMPOSTORS",
      message: "Two statements about C programming are false. Identify the impostors and generate the security key.",
      display: `A. The sizeof operator can be used to find
   the size of a data type or variable.

B. The && operator performs a logical OR operation.

C. A while loop can execute a block repeatedly
   while its condition remains true.

D. The break statement always skips to the next
   iteration of a loop without terminating it.


SECURITY PROTOCOL:

1. Identify the TWO false statements.

2. Take their position numbers
   (A=1, B=2, C=3, D=4).

3. Multiply their positions and add
   the total number of TRUE statements.`,
      displayType: "code",
      footerMessage: "",
      placeholder: "Enter security key",
      maxLength: null,
      answers: ["10"],
      hint: "Think about what the && operator does and what happens when a break statement is executed.",
      finalClue: "From the generated security key, keep what comes first.",
      finalDigit: "1"
   }

];

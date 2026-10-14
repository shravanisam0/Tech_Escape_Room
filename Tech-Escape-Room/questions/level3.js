/*
 * ─── QUESTION BANK: LEVEL 3 ────────────────────────────────────────
 *
 * Schema: see questions/level1.js for full documentation.
 *
 * IMPORTANT: finalClue and finalDigit must agree with the answer.
 *            If you change the answer, update both.
 */

window.QUESTION_BANK = window.QUESTION_BANK || {};
window.QUESTION_BANK.level3 = [
    {
        id: "l3-q1",
        title: "BINARY VAULT",
        message: "Three binary locks protect the next level. Follow the security protocol to generate the key.",
        display: `10110     01101     11001

SECURITY PROTOCOL:

1. Convert all three binary values to decimal.
2. Arrange the decimal values from SMALLEST to LARGEST.
3. Take only the LAST DIGIT of each value.
4. Join the digits to create the security key.`,
        displayType: "code",
        footerMessage: "",
        placeholder: "Enter 3-digit security key",
        maxLength: 3,
        answers: ["325"],
        hint: "First convert all three binary values into decimal. Then follow the security protocol.",
        finalClue: "From the vault key, take what stands in the middle.",
        finalDigit: "2"
    },
    {
        id: "l3-q2",
        title: "BINARY VAULT",
        message: "Three binary values are part of the access algorithm. Calculate the required values to generate the key.",
        display: `1010     1100     0111

SECURITY PROTOCOL:

1. Convert each binary value to decimal.
2. Add 2 to the first value.
3. Subtract 2 from the second value.
4. Multiply the third value by 2.
5. Take the LAST DIGIT of each resulting value.
6. Join them in the same order.`,
        displayType: "code",
        footerMessage: "",
        placeholder: "Enter 3-digit security key",
        maxLength: 3,
        answers: ["204"],
        hint: "Convert the binary numbers to decimal before performing the operations.",
        finalClue: "From the security key, keep what stands at the beginning.",
        finalDigit: "2"
    },
    {
        id: "l3-q3",
        title: "BINARY VAULT",
        message: "The vault has recorded three binary values. Decode them and calculate the required key.",
        display: `10100     01100     01110

SECURITY PROTOCOL:

1. Convert all three binary values to decimal.
2. Subtract the second value from the first.
3. Add the third value.
4. Write the result as a 3-digit security key,
   adding leading zeros if necessary.
5. Enter the resulting security key.`,
        displayType: "code",
        footerMessage: "",
        placeholder: "Enter security key",
        maxLength: 3,
        answers: ["022"],
        hint: "Convert the binary values to decimal before performing the arithmetic. Remember to write the final result as three digits.",
        finalClue: "From the three-digit key, keep what stands in the middle.",
        finalDigit: "2"
    },
    {
        id: "l3-q4",
        title: "BINARY VAULT",
        message: "Three encoded values guard the next level. Decode and organize them to create the access key.",
        display: `10110     10010     01101

SECURITY PROTOCOL:

1. Convert all three binary values to decimal.
2. Arrange the values from LARGEST to SMALLEST.
3. Take the LAST DIGIT of each value.
4. Join the digits to create the access key.`,

        displayType: "code",
        footerMessage: "",
        placeholder: "Enter 3-digit access key",
        maxLength: 3,
        answers: ["283"],
        hint: "Decode the binary values first, then arrange the decimal values from largest to smallest.",
        finalClue: "The key has three positions. Keep the digit that stands between the other two.",
        finalDigit: "2"
    },
    {
        id: "l3-q5",
        title: "BINARY VAULT",
        message: "Three encoded values guard the next level. Decode and organize them to create the access key.",
        display: `10111     10110     01110

SECURITY PROTOCOL:

1. Convert all three binary values to decimal.
2. Arrange the values from LARGEST to SMALLEST.
3. Take the LAST DIGIT of each value.
4. Join the digits to create the access key.`,

        displayType: "code",
        footerMessage: "",
        placeholder: "Enter 3-digit access key",
        maxLength: 3,
        answers: ["324"],
        hint: "Decode the binary values first, then arrange the decimal values from largest to smallest.",
        finalClue: "The key has three positions. Keep the digit that stands between the other two.",
        finalDigit: "2"
    }
];

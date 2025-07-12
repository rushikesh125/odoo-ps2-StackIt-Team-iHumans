// import { createQuestion } from "./write";
// import { generateRandomId } from "../utils";

// // Sample data for generating random questions
// const sampleTitles = [
//   "How to center a div in CSS?",
//   "What is the difference between let and const in JavaScript?",
//   "How to optimize React performance?",
//   "Why does my Node.js app crash on deployment?",
//   "How to use async/await in Python?",
//   "What are the best practices for REST API design?",
//   "How to handle errors in Express.js?",
//   "What is the purpose of useEffect in React?",
//   "How to secure a Firebase database?",
//   "What is the difference between SQL and NoSQL?",
// ];

// const sampleContent = [
//   "I'm struggling to vertically and horizontally center a div using CSS. I've tried flexbox, but it doesn't work in all browsers. Any solutions?",
//   "I'm new to JavaScript and confused about variable declarations. When should I use let vs const vs var?",
//   "My React app is slow when rendering large lists. How can I improve its performance?",
//   "I deployed my Node.js app to Heroku, but it keeps crashing with a cryptic error. Any debugging tips?",
//   "I'm trying to use async/await in Python for API calls, but I keep getting errors. Can someone provide a working example?",
// ];

// const sampleTags = [
//   ["css", "html", "frontend"],
//   ["javascript", "es6", "coding"],
//   ["react", "frontend", "performance"],
//   ["nodejs", "backend", "deployment"],
//   ["python", "async", "api"],
//   ["rest", "api", "design"],
//   ["express", "nodejs", "error-handling"],
//   ["react", "hooks", "frontend"],
//   ["firebase", "security", "database"],
//   ["sql", "nosql", "database"],
// ];

// const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// export const insertDummyQuestions = async (uid) => {
//   try {
//     console.log("Starting insertion of 30 dummy questions...");
//     const promises = [];

//     for (let i = 0; i < 30; i++) {
//       const qData = {
//         title: `${getRandomItem(sampleTitles)} (${i + 1})`,
//         content: getRandomItem(sampleContent),
//         tags: getRandomItem(sampleTags),
//       };

//       // Use the createQuestion function to insert each question
//       promises.push(
//         createQuestion({ uid, qData }).catch((error) => {
//           console.error(`Error inserting question ${i + 1}:`, error);
//           return { success: false, questionId: null, error };
//         })
//       );
//     }

//     // Wait for all insertions to complete
//     const results = await Promise.all(promises);

//     // Log the results
//     const successful = results.filter((r) => r.success).length;
//     console.log(`Inserted ${successful} out of 30 questions successfully`);

//     return {
//       success: true,
//       message: `Inserted ${successful} questions`,
//       failed: results.filter((r) => !r.success).map((r) => r.error),
//     };
//   } catch (error) {
//     console.error("Error in insertDummyQuestions:", error);
//     throw error;
//   }
// };
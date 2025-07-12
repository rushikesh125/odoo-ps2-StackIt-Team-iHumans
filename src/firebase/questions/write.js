import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "../config"
import { generateRandomId } from "../utils"
import { insertDummyQuestions } from "./dummy"
// import insertDummyQuestions from "./dummy"

export const createQuestion = async ({uid,qData})=>{
    const questionId = generateRandomId()
    await setDoc(doc(db,`questions`,questionId),{
        ...qData,
        titleLower:qData?.title.toLowerCase(),
        createdBy:uid,
        createdAt:serverTimestamp()
    })
}


export const updateQuestion = async ({ questionId, qData }) => {
  const { title, content, tags } = qData;
  const docRef = doc(db, "questions", questionId);
  await setDoc(docRef, {
    title,
    content,
    tags,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};


// export async function testInsertDummyQuestions() {
//   try {
//     const result = await insertDummyQuestions("uJkOMr6Y9gMVpFDvkQHQ2Q5mm9C3");
//     console.log(result);
//   } catch (error) {
//     console.error("Test failed:", error);
//   }
// }

// testInsertDummyQuestions();
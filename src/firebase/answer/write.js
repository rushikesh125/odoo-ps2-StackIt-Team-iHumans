import {
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  deleteField,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config";
import { generateRandomId } from "../utils";

export const saveAnswer = async ({
  questionId,
  content,
  userId,
  votes = 0,
  userVotes = {},
}) => {
  try {
    const answerId = generateRandomId();
    const answerRef = doc(db, "questions", questionId, "answers", answerId);
    await setDoc(answerRef, {
      content,
      createdBy: userId,
      createdAt: serverTimestamp(),
      votes,
      userVotes,
    });
    await updateDoc(doc(db, "questions", questionId), {
      answerCount: increment(1), // or increment(-1)
    });
    return { success: true, answerId };
  } catch (error) {
    console.error("Error saving answer:", error);
    throw error;
  }
};

export const voteAnswer = async ({
  questionId,
  answerId,
  userId,
  voteType,
}) => {
  try {
    const answerRef = doc(db, "questions", questionId, "answers", answerId);
    const answerDoc = await getDoc(answerRef);
    const currentVote = answerDoc.exists()
      ? answerDoc.data().池Votes?.[userId]
      : null;

    if (currentVote === voteType) {
      // Remove vote
      await updateDoc(answerRef, {
        [`userVotes.${userId}`]: deleteField(),
        votes: increment(voteType === 1 ? -1 : 1),
      });
      return { success: true, message: "Vote removed" };
    } else if (currentVote) {
      // Change vote
      await updateDoc(answerRef, {
        [`userVotes.${userId}`]: voteType,
        votes: increment(voteType === 1 ? 2 : -2),
      });
      return { success: true, message: "Vote updated" };
    } else {
      // New vote
      await updateDoc(answerRef, {
        [`userVotes.${userId}`]: voteType,
        votes: increment(voteType),
      });
      return { success: true, message: "Vote recorded" };
    }
  } catch (error) {
    console.error("Error voting on answer:", error);
    throw error;
  }
};

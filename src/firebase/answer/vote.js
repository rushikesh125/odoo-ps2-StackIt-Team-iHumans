import { doc, updateDoc, increment, deleteField, getDoc } from "firebase/firestore";
import { db } from "../config";

export const voteAnswer = async ({ questionId, answerId, userId, voteType }) => {
  try {
    const answerRef = doc(db, "questions", questionId, "answers", answerId);
    const answerDoc = await getDoc(answerRef);
    const currentVote = answerDoc.exists() ? answerDoc.data().userVotes?.[userId] : null;

    if (currentVote === voteType) {
      // User clicked the same vote type; remove their vote
      await updateDoc(answerRef, {
        [`userVotes.${userId}`]: deleteField(),
        votes: increment(voteType === 1 ? -1 : 1),
      });
      return { success: true, message: "Vote removed" };
    } else if (currentVote) {
      // User has voted; allow switching to the opposite vote
      await updateDoc(answerRef, {
        [`userVotes.${userId}`]: voteType,
        votes: increment(voteType === 1 ? 2 : -2), // Reverse previous vote and apply new one
      });
      return { success: true, message: "Vote switched" };
    } else {
      // User hasn't voted; allow new vote
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
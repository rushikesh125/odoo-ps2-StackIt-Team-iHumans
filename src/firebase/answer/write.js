import { db } from "../config"; // Adjust path to your Firebase config
import { doc, setDoc, deleteDoc, updateDoc, increment, collection, getDoc, } from "firebase/firestore";

export const saveAnswer = async ({ questionId, content, userId, votes = 0, userVotes = {} }) => {
  if (!questionId || !content || !userId) {
    throw new Error("Question ID, content, and user ID are required");
  }
  const answerRef = doc(collection(db, `questions/${questionId}/answers`));
  await setDoc(answerRef, {
    content,
    createdBy: userId,
    createdAt: new Date(),
    votes,
    userVotes,
  });
   await updateDoc(doc(db, "questions", questionId), {
      answerCount: increment(1), // or increment(-1)
    });
  return { id: answerRef.id };
};

export const voteAnswer = async ({ questionId, answerId, userId, voteType }) => {
  if (!userId) {
    throw new Error("User must be logged in to vote");
  }
  if (![1, -1].includes(voteType)) {
    throw new Error("Invalid vote type. Use 1 for upvote or -1 for downvote");
  }

  const answerRef = doc(db, `questions/${questionId}/answers`, answerId);
  const answerSnap = await getDoc(answerRef);

  if (!answerSnap.exists()) {
    throw new Error("Answer not found");
  }

  const answerData = answerSnap.data();
  const currentUserVote = answerData.userVotes?.[userId] || 0;
  let voteChange = 0;
  const updatedUserVotes = { ...answerData.userVotes };

  if (currentUserVote === voteType) {
    // User is removing their vote (e.g., clicking upvote again removes +1)
    voteChange = -voteType;
    delete updatedUserVotes[userId];
  } else {
    // User is adding a new vote or switching votes
    voteChange = voteType - currentUserVote;
    updatedUserVotes[userId] = voteType;
  }

  await updateDoc(answerRef, {
    votes: increment(voteChange),
    userVotes: updatedUserVotes,
  });

  return {
    message: voteChange === 0 ? "Vote removed" : voteType > 0 ? "Upvoted successfully" : "Downvoted successfully",
  };
};

export const deleteAnswer = async ({ questionId, answerId }) => {
  if (!questionId || !answerId) {
    throw new Error("Question ID and Answer ID are required");
  }
  const answerRef = doc(db, `questions/${questionId}/answers`, answerId);
  await deleteDoc(answerRef);
   await updateDoc(doc(db, "questions", questionId), {
      answerCount: increment(-1), // or increment(-1)
    });
};
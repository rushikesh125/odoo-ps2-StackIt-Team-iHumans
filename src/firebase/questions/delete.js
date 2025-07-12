import { db } from "../config";
import { deleteDoc, doc } from "firebase/firestore";

export async function deleteQuestion({ id }) {
  try {
    if (!id) {
      throw new Error("Invalid question ID");
    }
    console.log("Attempting to delete question with ID:", id);
    const docRef = doc(db, "questions", id);
    await deleteDoc(docRef);
    console.log("Question deleted successfully:", id);
    return true;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw new Error(error.message || "Failed to delete question");
  }
}
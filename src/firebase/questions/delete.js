import { db } from "../config";
import { deleteDoc, doc } from "firebase/firestore";

export async function deleteQuestion({ id }) {
  try {
    await deleteDoc(doc(db, "questions", id));
    return true;
  } catch (error) {
    throw new Error(error.message);
  }
}
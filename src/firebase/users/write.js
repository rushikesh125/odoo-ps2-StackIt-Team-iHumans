import { doc, serverTimestamp, setDoc } from "firebase/firestore"
import { db } from "../config"

export const createUser = async ({userData})=>{
    await setDoc(doc(db,`users/${userData.uid}`),{
        ...userData,
        createdAt:serverTimestamp()
    })
}
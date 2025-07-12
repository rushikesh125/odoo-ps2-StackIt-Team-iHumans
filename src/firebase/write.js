import { doc, setDoc } from "firebase/firestore"
import { db } from "./config"
import { generateRandomId } from "./utils"

export const testfn = async ()=>{
    let questionId = generateRandomId()
    await setDoc(doc(db,`questions/${questionId}`),{
        name:"rushikesh",
        age:12
    })
} 
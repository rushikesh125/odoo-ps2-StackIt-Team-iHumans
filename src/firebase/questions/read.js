import { collection, doc, getDocs, limit, onSnapshot, orderBy, query, startAfter, where } from "firebase/firestore";
import { db } from "../config";
import useSWRSubscription from 'swr/subscription'
import { useEffect, useState } from "react";


export const useQuestions = ({ pageLimit, lastSnapDoc, searchQuery, tags, sortOption }) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastSnap, setLastSnap] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        let q = query(collection(db, "questions"), limit(pageLimit));

        // Apply search query filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          q = query(q, where("titleLower", ">=", searchLower), where("titleLower", "<=", searchLower + "\uf8ff"));
        }

        // Apply tag filter
        if (tags && tags.length > 0) {
          q = query(q, where("tags", "array-contains-any", tags));
        }

        // Apply sorting
        if (sortOption === "newest") {
          q = query(q, orderBy("createdAt", "desc"));
        }

        // Apply pagination
        if (lastSnapDoc) {
          q = query(q, startAfter(lastSnapDoc));
        }

        const querySnapshot = await getDocs(q);
        const questionsData = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const answersRef = collection(db, `questions/${doc.id}/answers`);
            const answersSnapshot = await getDocs(answersRef);
            return {
              questionId: doc.id,
              ...doc.data(),
              answerCount: answersSnapshot.size,
            };
          })
        );

        // Filter answered/unanswered on client-side due to Firestore limitations
        let filteredData = questionsData;
        if (sortOption === "unanswered") {
          filteredData = questionsData.filter((q) => q.answerCount === 0);
        } else if (sortOption === "answered") {
          filteredData = questionsData.filter((q) => q.answerCount > 0);
        }

        setData(filteredData);
        setLastSnap(querySnapshot.docs[querySnapshot.docs.length - 1] || null);
      } catch (err) {
        setError(err.message);
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [pageLimit, lastSnapDoc, searchQuery, tags, sortOption]);

  return { data, isLoading, error, lastSnapDoc: lastSnap };
};


export const useAnswers = ({ questionId }) => {
  const { data, error } = useSWRSubscription(
    [`questions/${questionId}/answers`],
    ([path], { next }) => {
      const ref = collection(db, path);
      const q = query(ref);
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          next(null, snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() })));
        },
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );
  return {
    data,
    error: error?.message,
    isLoading: data === undefined,
  };
};

export const useQuestion = ({ questionId }) => {
  const { data, error } = useSWRSubscription(
    ["questions", questionId],
    ([path, questionId], { next }) => {
      const ref = doc(db, `questions/${questionId}`);
      const unsub = onSnapshot(
        ref,
        (snapshot) => {
          next(null, snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        },
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );


  return {
    data,
    error: error?.message,
    isLoading: data === undefined,
  };
};

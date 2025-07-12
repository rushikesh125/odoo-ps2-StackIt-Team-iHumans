import { collection, doc, limit, onSnapshot, query, startAfter } from "firebase/firestore";
import { db } from "../config";
import useSWRSubscription from 'swr/subscription'


export const useQuestions = ({ pageLimit, lastSnapDoc }) => {
  const { data, error } = useSWRSubscription(
    ["questions", pageLimit, lastSnapDoc],
    ([path, pageLimit, lastSnapDoc], { next }) => {
      const ref = collection(db, path);
      let q = query(ref, limit(pageLimit ?? 10));
      if (lastSnapDoc) {
        q = query(q, startAfter(lastSnapDoc));
      }
      const unsub = onSnapshot(
        q,
        (snapshot) => {
          next(null, {
            list:
              snapshot.docs.length === 0
                ? null
                : snapshot.docs.map((snap) => ({ id: snap.id, ...snap.data() })),
            lastSnapDoc:
              snapshot.docs.length === 0
                ? null
                : snapshot.docs[snapshot.docs.length - 1],
          });
        },
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );

  return {
    data: data?.list,
    lastSnapDoc: data?.lastSnapDoc,
    error: error?.message,
    isLoading: data === undefined,
  };
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
  const {data:lenans} = useAnswers({questionId})

  return {
    data:{
      ...data,
      availAns:lenans?.length
    },
    error: error?.message,
    isLoading: data === undefined,
  };
};

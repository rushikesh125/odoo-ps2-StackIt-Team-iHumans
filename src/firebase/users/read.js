import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../config";
import useSWRSubscription  from "swr/subscription";

export const useUsers = (userIds) => {
  const { data, error } = useSWRSubscription(
    ["users", userIds?.join(",")],
    ([path, ids], { next }) => {
      if (!ids) return () => {};
      const refs = userIds.map((id) => doc(db, `users/${id}`));
      const unsubs = refs.map((ref) =>
        onSnapshot(
          ref,
          (snapshot) => {
            next(null, {
              [snapshot.id]: snapshot.exists() ? snapshot.data() : null,
            });
          },
          (err) => next(err, null)
        )
      );
      return () => unsubs.forEach((unsub) => unsub());
    }
  );

  return {
    users: data || {},
    error: error?.message,
    isLoading: data === undefined,
  };
};

export const useUser = (uid) => {
  const { data, error } = useSWRSubscription(
    ["user", uid],
    ([path, uid], { next }) => {
      if (!uid) return () => {};
      const ref = doc(db, `users/${uid}`);
      const unsub = onSnapshot(
        ref,
        (snapshot) => {
          next(null, snapshot.exists() ? snapshot.data() : null);
        },
        (err) => next(err, null)
      );
      return () => unsub();
    }
  );

  return {
    user: data,
    error: error?.message,
    isLoading: data === undefined,
  };
};
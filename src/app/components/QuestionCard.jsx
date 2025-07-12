"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import Link from "next/link";
import { deleteQuestion } from "../../firebase/questions/delete";
import { useUser } from "../../firebase/users/read";
import { Avatar } from "@heroui/react";
import DOMPurify from "dompurify";

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="text-red-600 p-4 text-center">
        Something went wrong. Please refresh the page and try again.
      </div>
    );
  }
  return children;
};

const QuestionCard = ({ item, index, author, currentUser }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoading: userLoading, error } = useUser(author);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      setIsLoading(true);
      await deleteQuestion({ id: item.id });
      toast.success("Question deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete question");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to sanitize and render HTML content
  const renderRichText = (content) => {
    const sanitizedContent = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'code', 'pre'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
    });
    return (
      <div
        className="prose prose-sm sm:prose-base max-w-none text-gray-600 line-clamp-2"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  };

  useEffect(() => {
    // This effect can be used for any side effects related to user data if needed
  }, [author]);

  return (
    <ErrorBoundary>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border-l-4 border-purple-600 p-4 sm:p-6 md:flex bg-gradient-to-r from-purple-50 to-white">
        <div className="flex flex-row md:flex-col items-center justify-center w-full md:w-24 md:mr-6 gap-4 md:gap-2 mb-4 md:mb-0">
          <div className="flex flex-col items-center">
            <div className="text-lg sm:text-xl font-bold text-purple-700">{item.upvotes || 0}</div>
            <div className="text-xs sm:text-sm text-gray-500">Votes</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-lg sm:text-xl font-bold text-purple-700">{item.answerCount || 0}</div>
            <div className="text-xs sm:text-sm text-gray-500">Answers</div>
          </div>
        </div>
        <div className="flex-1">
          <Link href={`/questions/${item.id}`} className="focus:outline-none focus:ring-2 focus:ring-purple-500 rounded">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-purple-800 hover:text-purple-900 transition-colors duration-200">
              {item.title}
            </h2>
          </Link>
          {renderRichText(item.content)}
          <div className="flex flex-wrap gap-2 mt-3">
            {item.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs sm:text-sm rounded-full hover:bg-purple-200 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <Avatar
                url={user?.photoURL}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 border border-purple-200"
                alt={user?.displayName || "User"}
              />
              <span className="text-sm sm:text-base text-gray-700">
                {userLoading ? "Loading..." : user?.displayName || "Unknown"}
              </span>
              <span className="text-gray-500 text-xs sm:text-sm ml-2">
                {item.createdAt?.toDate().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
            {currentUser?.uid === item.createdBy && (
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/questions/edit?id=${item.id}`)}
                  className="p-2 bg-purple-100 rounded-lg hover:bg-purple-200 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  title="Edit Question"
                  aria-label="Edit Question"
                >
                  <PencilIcon className="w-5 h-5 text-purple-600" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    isLoading
                      ? "bg-gray-200 cursor-not-allowed"
                      : "bg-red-100 hover:bg-red-200 hover:scale-105"
                  }`}
                  title="Delete Question"
                  aria-label="Delete Question"
                >
                  <TrashIcon className={`w-5 h-5 ${isLoading ? "text-gray-400" : "text-red-600"}`} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default QuestionCard;
"use client";
import React, { useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { saveAnswer, voteAnswer, deleteAnswer } from "../../firebase/answer/write";
import { useQuestion } from "../../firebase/questions/read";
import { useAnswers } from "../../firebase/questions/read";
import { useUsers } from "../../firebase/users/read";
import { useSelector } from "react-redux";
import { Avatar } from "@heroui/react";
import RichTextEditor from "./rich-text-editor";
import DOMPurify from "dompurify";
import { TrashIcon } from "@heroicons/react/24/outline";

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

const QuestionDetail = () => {
  const params = useParams();
  const id = params?.id;
  const user = useSelector((state) => state?.user);
  const [answerContent, setAnswerContent] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef(null);

  const { data: question, error, isLoading } = useQuestion({ questionId: id });
  const { data: answers, isLoading: answersLoading } = useAnswers({ questionId: id });
  const userIds = [
    question?.createdBy,
    ...(answers?.map((a) => a.createdBy) || []),
  ].filter(Boolean);
  const { users } = useUsers(userIds);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!answerContent.trim()) {
      newErrors.content = "Answer is required";
    } else if (answerContent.length < 20) {
      newErrors.content = "Answer must be at least 20 characters long";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [answerContent]);

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to submit an answer.");
      return;
    }
    if (!validateForm()) {
      return;
    }
    try {
      setIsSubmitting(true);
      setErrors({});
      await saveAnswer({
        questionId: id,
        content: answerContent,
        userId: user.uid,
        votes: 0,
        userVotes: {},
      });
      toast.success("Answer submitted successfully!");
      setAnswerContent("");
      // Optionally reset RichTextEditor if it has a clear method
      // editorRef.current?.clearContent?.();
    } catch (error) {
      setErrors({ submit: "Failed to submit answer. Please try again." });
      toast.error(error.message || "Failed to submit answer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (answerId, voteType) => {
    if (!user) {
      toast.error("Please log in to vote.");
      return;
    }
    try {
      const result = await voteAnswer({
        questionId: id,
        answerId,
        userId: user.uid,
        voteType,
      });
      toast.success(result.message);
    } catch (error) {
      toast.error(error.message || "Failed to vote");
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!user) {
      toast.error("Please log in to delete your answer.");
      return;
    }
    if (!confirm("Are you sure you want to delete this answer?")) return;
    try {
      await deleteAnswer({ questionId: id, answerId });
      toast.success("Answer deleted successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to delete answer");
    }
  };

  // Function to sanitize and render HTML content
  const renderRichText = (content) => {
    const sanitizedContent = DOMPurify.sanitize(content);
    return (
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    );
  };

  if (isLoading || answersLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-purple-600 text-lg font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-red-500 text-lg font-semibold">Error: {error}</div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-gray-500 text-lg font-semibold">Question not found.</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{question.title}</h1>
          <div className="flex items-center mb-4">
            <Avatar url={users[question.createdBy]?.photoURL} />
            <span className="text-gray-600">{users[question.createdBy]?.displayName || "Unknown"}</span>
            <span className="text-gray-500 text-sm ml-2">
              {question.createdAt?.toDate().toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          {renderRichText(question.content)}
          <div className="flex flex-wrap gap-2 mb-6 mt-6">
            {question.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <hr className="border border-slate-500/[0.20]" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {answers?.length || 0} Answers
          </h2>
          <div className="space-y-6">
            {answers
              ?.sort((a, b) => (b.votes || 0) - (a.votes || 0))
              .map((answer) => (
                <div key={answer.id} className="pt-4 flex">
                  <div className="flex flex-col items-center mr-4">
                    <button
                      onClick={() => handleVote(answer.id, 1)}
                      className={`p-1 rounded-md ${
                        answer.userVotes?.[user?.uid] === 1
                          ? "text-purple-600"
                          : "text-gray-400 hover:text-purple-500"
                      }`}
                      title={answer.userVotes?.[user?.uid] === 1 ? "Remove upvote" : "Upvote"}
                      disabled={!user}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                    <span className="text-gray-700 font-semibold my-2">{answer.votes || 0}</span>
                    <button
                      onClick={() => handleVote(answer.id, -1)}
                      className={`p-1 rounded-md ${
                        answer.userVotes?.[user?.uid] === -1
                          ? "text-purple-600"
                          : "text-gray-400 hover:text-purple-500"
                      }`}
                      title={answer.userVotes?.[user?.uid] === -1 ? "Remove downvote" : "Downvote"}
                      disabled={!user}
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="flex-1">
                    {renderRichText(answer.content)}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center">
                        <Avatar url={users[answer.createdBy]?.photoURL} />
                        <span className="text-gray-600">{users[answer.createdBy]?.displayName || "Unknown"}</span>
                        <span className="text-gray-500 text-sm ml-2">
                          {answer.createdAt?.toDate().toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {user?.uid === answer.createdBy && (
                        <button
                          onClick={() => handleDeleteAnswer(answer.id)}
                          className="p-2 bg-red-100 rounded-lg hover:bg-red-200 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                          title="Delete Answer"
                          aria-label="Delete Answer"
                        >
                          <TrashIcon className="w-5 h-5 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
          </div>
          {user && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Answer</h2>
              {errors.submit && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {errors.submit}
                </div>
              )}
              <form onSubmit={handleAnswerSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-purple-800 mb-2">Answer</label>
                  <div className="w-full">
                    <RichTextEditor
                      ref={editorRef}
                      initialContent={answerContent}
                      onChange={setAnswerContent}
                      placeholder="Write your answer in detail..."
                      height="400px"
                      className={`border rounded-lg focus-within:ring-2 focus-within:ring-purple-500 ${
                        errors.content ? "border-red-500" : "border-purple-200"
                      }`}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.content && (
                    <p className="mt-2 text-xs text-red-600">{errors.content}</p>
                  )}
                  <p className="mt-2 text-xs text-purple-600">
                    Provide a detailed answer to help the questioner. Minimum 20 characters.
                  </p>
                </div>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-md text-white font-semibold transition-all duration-200 ${
                    isSubmitting
                      ? "bg-purple-400 cursor-not-allowed"
                      : "bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Answer"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default QuestionDetail;
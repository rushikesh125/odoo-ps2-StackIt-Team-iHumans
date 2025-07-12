"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import RichTextEditor from "../../components/rich-text-editor";
import { Button } from "@heroui/react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useQuestion } from "../../../firebase/questions/read";
import { updateQuestion } from "../../../firebase/questions/write";

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

const EditQuestionPage = () => {
  const searchParams = useSearchParams();
  const qid = searchParams.get("qid");
  const user = useSelector((state) => state?.user);
  const { data: question, isLoading, error } = useQuestion({ questionId: qid });

  const editorRef = useRef(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form with question data when fetched
  useEffect(() => {
    if (question) {
      setTitle(question.title || "");
      setContent(question.content || "");
      setTags(question.tags?.join(", ") || "");
    }
  }, [question]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    // Title validation
    if (!title.trim()) {
      newErrors.title = "Title is required";
    } else if (title.length < 10) {
      newErrors.title = "Title must be at least 10 characters long";
    } else if (title.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters";
    }

    // Content validation
    if (!content.trim()) {
      newErrors.content = "Description is required";
    } else if (content.length < 20) {
      newErrors.content = "Description must be at least 20 characters long";
    }

    // Tags validation
    const tagArray = tags.split(",").map((tag) => tag.trim()).filter((tag) => tag);
    if (tagArray.length === 0) {
      newErrors.tags = "At least one tag is required";
    } else if (tagArray.length > 5) {
      newErrors.tags = "Maximum 5 tags allowed";
    } else if (tagArray.some((tag) => tag.length > 30)) {
      newErrors.tags = "Each tag cannot exceed 30 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, content, tags]);

  const handleUpdateQuestion = async () => {
    try {
      if (!user) {
        toast.error("Please log in to update the question.");
        return;
      }
      if (!qid) {
        toast.error("Invalid question ID.");
        return;
      }
      if (question?.createdBy !== user.uid) {
        toast.error("You are not authorized to edit this question.");
        return;
      }
      if (!validateForm()) return;

      setIsSubmitting(true);
      setErrors({});
      const updatedTags = tags.split(",").map((tag) => tag.trim()).filter((tag) => tag);
      await updateQuestion({ questionId: qid, qData: { title, content, tags: updatedTags } });
      toast.success("Question updated successfully!");
      setTitle("");
      setContent("");
      setTags("");
      // Optionally reset RichTextEditor if it has a clear method
      // editorRef.current?.clearContent?.();
    } catch (error) {
      setErrors({ submit: "Failed to update question. Please try again." });
      toast.error(error.message || "Failed to update question");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-purple-600 text-lg font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-red-500 text-lg font-semibold">
          {error || "Question not found."}
        </div>
      </div>
    );
  }

  if (question.createdBy !== user?.uid) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-red-500 text-lg font-semibold">
          You are not authorized to edit this question.
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-6 sm:p-8 lg:p-10 mt-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-6">Edit Question</h1>

          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-purple-800 mb-2" htmlFor="title">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to vertically align a div in CSS?"
              className={`w-full outline-none p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-800 placeholder-gray-400 ${
                errors.title ? "border-red-500" : "border-purple-200"
              }`}
              disabled={isSubmitting}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="mt-2 text-xs text-red-600">{errors.title}</p>
            )}
            <p className="mt-2 text-xs text-purple-600">
              Be specific and imagine you’re asking another person.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-purple-800 mb-2" htmlFor="description">
              Description
            </label>
            <div className="w-full">
              <RichTextEditor
                ref={editorRef}
                initialContent={content}
                onChange={setContent}
                placeholder="Describe your question in detail..."
                height="400px"
                className={`border rounded-lg focus-within:ring-2 focus-within:ring-purple-500 ${
                  errors.content ? "border-red-500" : "border-purple-200"
                }`}
                disabled={isSubmitting}
                aria-invalid={!!errors.content}
                aria-describedby={errors.content ? "content-error" : undefined}
              />
            </div>
            {errors.content && (
              <p id="content-error" className="mt-2 text-xs text-red-600">{errors.content}</p>
            )}
            <p className="mt-2 text-xs text-purple-600">
              Introduce the problem and expand on what you put in the title. Minimum 20 characters.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-purple-800 mb-2" htmlFor="tags">
              Tags
            </label>
            <input
              id="tags"
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. css, javascript, react"
              className={`w-full outline-none p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-800 placeholder-gray-400 ${
                errors.tags ? "border-red-500" : "border-purple-200"
              }`}
              disabled={isSubmitting}
              aria-invalid={!!errors.tags}
              aria-describedby={errors.tags ? "tags-error" : undefined}
            />
            {errors.tags && (
              <p id="tags-error" className="mt-2 text-xs text-red-600">{errors.tags}</p>
            )}
            <p className="mt-2 text-xs text-purple-600">
              Add up to 5 tags to describe what your question is about. Use commas to separate tags.
            </p>
          </div>

          <Button
            onPress={handleUpdateQuestion}
            className={`w-full py-3 px-4 rounded-lg text-base font-semibold transition-all duration-200 ${
              isSubmitting
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            } text-white`}
            disabled={isSubmitting}
            aria-label="Update Question"
          >
            {isSubmitting ? "Updating..." : "Update Question"}
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EditQuestionPage;
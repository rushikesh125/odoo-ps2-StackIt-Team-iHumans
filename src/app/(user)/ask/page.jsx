"use client";
import React, { useState, useRef, useCallback } from 'react';
import RichTextEditor from '../../components/rich-text-editor';
import { Button } from '@heroui/react';
import toast from 'react-hot-toast';
// import { createQuestion } from '../../../firebase/questions';
import { useSelector } from 'react-redux';
import { createQuestion}  from '../../../firebase/questions/write';

const ErrorBoundary = ({ children }) => {
  
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
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

const AskQuestionPage = () => {
  const editorRef = useRef(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useSelector(state=>state?.user)

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Title validation
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters long';
    } else if (title.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }

    // Content validation
    if (!content.trim()) {
      newErrors.content = 'Description is required';
    } else if (content.length < 20) {
      newErrors.content = 'Description must be at least 20 characters long';
    }

    // Tags validation
    const tagArray = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (tagArray.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (tagArray.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed';
    } else if (tagArray.some(tag => tag.length > 30)) {
      newErrors.tags = 'Each tag cannot exceed 30 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, content, tags]);

  const handlePostQuestion = async () => {

    try {
      
      if (!validateForm()) return;

      setIsSubmitting(true);
      setErrors({});
      const temptag = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      // Simulated API call
      await createQuestion({uid:user.uid,qData:{title,content,temptag}}) // Simulate network delay
      toast.success("Queston Created Successfully");
      console.log({
        title,
        content,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      });

      // Reset form after successful submission
      setTitle('');
      setContent(''); // Clear the editor by resetting content state
      setTags('');
      // Note: If RichTextEditor exposes a specific reset/clear method (e.g., clearContent),
      // you can call it via editorRef.current?.clearContent?.()
      // Check the RichTextEditor documentation for the correct method name.

    } catch (error) {
      setErrors({ submit: 'Failed to post question. Please try again.' });
      toast.error(error?.message)
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl p-6 sm:p-8 lg:p-10 mt-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-purple-900 mb-6">Ask a Question</h1>
          
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-purple-800 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. How to vertically align a div in CSS?"
              className={`w-full outline-none p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-800 placeholder-gray-400 ${
                errors.title ? 'border-red-500' : 'border-purple-200'
              }`}
              disabled={isSubmitting}
            />
            {errors.title && (
              <p className="mt-2 text-xs text-red-600">{errors.title}</p>
            )}
            <p className="mt-2 text-xs text-purple-600">Be specific and imagine you’re asking another person.</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-purple-800 mb-2">Description</label>
            <div className="w-full">
              <RichTextEditor
                ref={editorRef}
                initialContent={content}
                onChange={setContent}
                placeholder="Describe your question in detail..."
                height="400px"
                className={`border rounded-lg focus-within:ring-2 focus-within:ring-purple-500 ${
                  errors.content ? 'border-red-500' : 'border-purple-200'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.content && (
              <p className="mt-2 text-xs text-red-600">{errors.content}</p>
            )}
            <p className="mt-2 text-xs text-purple-600">Introduce the problem and expand on what you put in the title. Minimum 20 characters.</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-purple-800 mb-2">Tags</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. css, javascript, react"
              className={`w-full outline-none p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-gray-800 placeholder-gray-400 ${
                errors.tags ? 'border-red-500' : 'border-purple-200'
              }`}
              disabled={isSubmitting}
            />
            {errors.tags && (
              <p className="mt-2 text-xs text-red-600">{errors.tags}</p>
            )}
            <p className="mt-2 text-xs text-purple-600">Add up to 5 tags to describe what your question is about. Use commas to separate tags.</p>
          </div>

          <Button
            onPress={handlePostQuestion}
            className={`w-full py-3 px-4 rounded-lg text-base font-semibold transition-all duration-200 ${
              isSubmitting
                ? 'bg-purple-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2'
            } text-white`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post Your Question'}
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AskQuestionPage;
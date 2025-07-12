"use client";
import React, { useState, useEffect } from "react";
import { useQuestions } from "../firebase/questions/read";
import toast from "react-hot-toast";
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import QuestionCard from "./components/QuestionCard";
import { useSelector } from "react-redux";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/config"; // Adjust path to your Firebase config

const ShowQuestions = () => {
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [lastSnapDocList, setLastSnapDocList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortOption, setSortOption] = useState("newest");
  const [allTags, setAllTags] = useState([]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false); // Toggle filter menu
  const user = useSelector((state) => state?.user);

  const {
    data: questions,
    error,
    isLoading,
    lastSnapDoc,
  } = useQuestions({
    pageLimit: itemsPerPage,
    lastSnapDoc:
      lastSnapDocList.length === 0
        ? null
        : lastSnapDocList[lastSnapDocList.length - 1],
    searchQuery: searchQuery.trim(),
    tags: selectedTags,
    sortOption,
  });

  // Fetch all unique tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const questionsRef = collection(db, "questions");
        const questionsSnapshot = await getDocs(questionsRef);
        const tagsSet = new Set();
        questionsSnapshot.forEach((doc) => {
          const tags = doc.data().tags || [];
          tags.forEach((tag) => tagsSet.add(tag));
        });
        setAllTags([...tagsSet].sort());
      } catch (err) {
        toast.error("Failed to load tags: " + err.message);
      }
    };
    fetchTags();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setLastSnapDocList([]);
  }, [itemsPerPage, searchQuery, selectedTags, sortOption]);

  // Close filter menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterMenuOpen && !event.target.closest("#filter-menu")) {
        setIsFilterMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterMenuOpen]);

  const handleSearch = () => {
    if (!inputValue.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    setSearchQuery(inputValue);
  };

  const handleNextPage = () => {
    if (lastSnapDoc) {
      setLastSnapDocList((prev) => [...prev, lastSnapDoc]);
    }
  };

  const handlePrevPage = () => {
    setLastSnapDocList((prev) => prev.slice(0, -1));
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-purple-600 text-lg font-semibold">Loading Questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 text-lg font-semibold">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md shadow-sm rounded-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Explore Questions
          </h1>
          {user && (
            <Link
              href="/ask"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-md hover:from-purple-700 hover:to-purple-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              aria-label="Ask a new question"
            >
              Ask a Question
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 space-y-4">
          {/* Search Bar */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Questions
            </label>
            <div className="relative flex items-center gap-2 max-w-md w-full">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Search questions..."
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors text-gray-700 placeholder-gray-400"
                  aria-label="Enter question title to search"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg shadow-sm hover:from-purple-700 hover:to-purple-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Search questions"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Toggle for Mobile/Tablet */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className="flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg w-full text-sm font-medium hover:bg-purple-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-expanded={isFilterMenuOpen}
              aria-controls="filter-menu"
            >
              <FunnelIcon className="w-4 h-4 mr-2" />
              Filters
            </button>
            {isFilterMenuOpen && (
              <div
                id="filter-menu"
                className="absolute z-20 mt-2 w-full max-w-md bg-white rounded-lg shadow-lg p-4 space-y-4 transform transition-all duration-300 origin-top scale-y-100 lg:scale-y-100"
              >
                {/* Tag Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Tags
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                    {allTags.length > 0 ? (
                      allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                            selectedTags.includes(tag)
                              ? "bg-purple-600 text-white shadow-sm"
                              : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                          }`}
                          aria-pressed={selectedTags.includes(tag)}
                          aria-label={`Filter by ${tag}`}
                        >
                          {tag}
                        </button>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No tags available</p>
                    )}
                  </div>
                </div>

                {/* Sort and Items Per Page */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="sort-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <select
                      id="sort-mobile"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="w-full px-3 py-2 bg-purple-50 text-purple-700 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors text-sm"
                      aria-label="Sort questions"
                    >
                      <option value="newest">Newest</option>
                      <option value="unanswered">Unanswered</option>
                      <option value="answered">Answered</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="itemsPerPage-mobile" className="block text-sm font-medium text-gray-700 mb-2">
                      Items Per Page
                    </label>
                    <select
                      id="itemsPerPage-mobile"
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-purple-50 text-purple-700 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors text-sm"
                      aria-label="Select items per page"
                    >
                      <option value={5}>5 items</option>
                      <option value={10}>10 items</option>
                      <option value={15}>15 items</option>
                      <option value={20}>20 items</option>
                      <option value={30}>30 items</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Filters for Wide Screens */}
          <div className="hidden lg:block space-y-6">
            {/* Tag Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Tags
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                {allTags.length > 0 ? (
                  allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedTags.includes(tag)
                          ? "bg-purple-600 text-white shadow-sm"
                          : "bg-purple-100 text-purple-700 hover:bg-purple-200"
                      }`}
                      aria-pressed={selectedTags.includes(tag)}
                      aria-label={`Filter by ${tag}`}
                    >
                      {tag}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No tags available</p>
                )}
              </div>
            </div>

            {/* Sort and Items Per Page */}
            <div className="flex flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="w-full px-3 py-2 bg-purple-50 text-purple-700 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors text-sm"
                  aria-label="Sort questions"
                >
                  <option value="newest">Newest</option>
                  <option value="unanswered">Unanswered</option>
                  <option value="answered">Answered</option>
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="itemsPerPage" className="block text-sm font-medium text-gray-700 mb-2">
                  Items Per Page
                </label>
                <select
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-purple-50 text-purple-700 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-colors text-sm"
                  aria-label="Select items per page"
                >
                  <option value={5}>5 items</option>
                  <option value={10}>10 items</option>
                  <option value={15}>15 items</option>
                  <option value={20}>20 items</option>
                  <option value={30}>30 items</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions?.length > 0 ? (
            questions.map((item, index) => (
              <QuestionCard
                key={item.questionId}
                item={item}
                index={index}
                author={item.createdBy}
                currentUser={user}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="mt-2 text-gray-500 text-lg font-medium">
                No questions match your criteria.
              </p>
              <p className="mt-1 text-gray-400 text-sm">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
          <button
            onClick={handlePrevPage}
            disabled={lastSnapDocList.length === 0 || isLoading}
            className={`flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-sm ${
              lastSnapDocList.length === 0 || isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            }`}
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Previous
          </button>
          <span className="text-gray-600 text-sm">
            Page {lastSnapDocList.length + 1}
          </span>
          <button
            onClick={handleNextPage}
            disabled={isLoading || !lastSnapDoc || questions.length < itemsPerPage}
            className={`flex items-center px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 shadow-sm ${
              isLoading || !lastSnapDoc || questions.length < itemsPerPage
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
            }`}
            aria-label="Next page"
          >
            Next
            <ChevronRightIcon className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowQuestions;
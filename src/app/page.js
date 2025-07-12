"use client";
import React, { useState, useEffect } from "react";
import { useQuestions } from "../firebase/questions/read";
// import { useAuth } from "../firebase/auth";
import toast from "react-hot-toast";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import QuestionCard from "./components/QuestionCard";
import { useSelector } from "react-redux";

const ShowQuestions = () => {
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [lastSnapDocList, setLastSnapDocList] = useState([]);
  const user = useSelector((state) => state?.user);

  useEffect(() => {
    setLastSnapDocList([]);
  }, [itemsPerPage]);

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
  });

  console.log(questions);
  const handleNextPage = () => {
    if (lastSnapDoc) {
      setLastSnapDocList((prev) => [...prev, lastSnapDoc]);
    }
  };

  const handlePrevPage = () => {
    setLastSnapDocList((prev) => prev.slice(0, -1));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-purple-600 text-lg font-semibold animate-pulse">
          Loading...
        </div>
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          {user && (
            <Link
              href="/ask"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Ask a Question
            </Link>
          )}
        </div>
        <div className="space-y-4">
          {questions?.map((item, index) => (
            <QuestionCard
              key={item.questionId}
              item={item}
              index={index}
              author={item.createdBy} // Pass the uid
              currentUser={user} // Pass the current authenticated user
            />
          ))}
          {questions?.length === 0 && (
            <p className="text-gray-500 text-center">
              No questions to display.
            </p>
          )}
        </div>
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePrevPage}
            disabled={lastSnapDocList.length === 0 || isLoading}
            className={`flex items-center px-4 py-2 rounded-md text-white font-semibold transition-colors ${
              lastSnapDocList.length === 0 || isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-purple-500 hover:bg-purple-600"
            }`}
          >
            <ChevronLeftIcon className="w-5 h-5 mr-1" />
            Prev
          </button>
          <select
            className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md outline-none focus:ring-2 focus:ring-purple-500"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            <option value={5}>5 items</option>
            <option value={10}>10 items</option>
            <option value={15}>15 items</option>
            <option value={20}>20 items</option>
            <option value={30}>30 items</option>
          </select>
          <button
            onClick={handleNextPage}
            disabled={isLoading || !lastSnapDoc}
            className={`flex items-center px-4 py-2 rounded-md text-white font-semibold transition-colors ${
              isLoading || !lastSnapDoc
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-purple-500 hover:bg-purple-600"
            }`}
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

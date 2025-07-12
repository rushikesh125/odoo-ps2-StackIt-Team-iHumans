"use client";
import React, { useState, useEffect } from "react";
import { useQuestions } from "../firebase/questions/read";
import { deleteQuestion } from "../firebase/questions/delete";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const ShowQuestions = () => {
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [lastSnapDocList, setLastSnapDocList] = useState([]);
  const router = useRouter();

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
      lastSnapDocList.length === 0 ? null : lastSnapDocList[lastSnapDocList.length - 1],
  });

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
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-purple-600 text-lg font-semibold animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="text-red-500 text-lg font-semibold">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-purple-700 mb-6">Questions</h1>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-white uppercase bg-purple-600">
              <tr>
                <th className="p-3">Sr. No.</th>
                <th className="p-3">Title</th>
                <th className="p-3">Content</th>
                <th className="p-3">Tags</th>
                <th className="p-3">Created By</th>
                <th className="p-3">Created At</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions?.map((item, index) => (
                <QuestionRow
                  key={item.id}
                  item={item}
                  index={index + lastSnapDocList.length * itemsPerPage}
                  router={router}
                />
              ))}
            </tbody>
          </table>
        </div>
        {questions?.length === 0 && (
          <p className="text-gray-500 text-center mt-4">No questions to display.</p>
        )}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={handlePrevPage}
            disabled={lastSnapDocList.length === 0 || isLoading}
            className={`px-4 py-2 rounded-md text-white font-semibold transition-colors ${
              lastSnapDocList.length === 0 || isLoading
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-purple-500 hover:bg-purple-600"
            }`}
          >
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
            className={`px-4 py-2 rounded-md text-white font-semibold transition-colors ${
              isLoading || !lastSnapDoc
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-purple-500 hover:bg-purple-600"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionRow = ({ item, index, router }) => {
  const [isLoading, setIsLoading] = useState(false);

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

  const handleEdit = () => {
    router.push(`/questions/edit?id=${item.id}`);
  };

  return (
    <tr className="border-b hover:bg-purple-50 transition-colors">
      <td className="p-3 text-center">{index + 1}</td>
      <td className="p-3">{item.title}</td>
      <td className="p-3 max-w-xs truncate">{item.content}</td>
      <td className="p-3">
        <div className="flex flex-wrap gap-1">
          {item.tags?.map((tag, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </td>
      <td className="p-3">{item.createdBy}</td>
      <td className="p-3">
        {item.createdAt?.toDate().toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </td>
      <td className="p-3 flex justify-center gap-2">
        <button
          onClick={handleEdit}
          className="p-2 bg-purple-100 rounded-md hover:bg-purple-200 transition-colors"
          title="Edit Question"
        >
          <PencilIcon className="w-5 h-5 text-purple-600" />
        </button>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className={`p-2 rounded-md transition-colors ${
            isLoading
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-purple-100 hover:bg-purple-200"
          }`}
          title="Delete Question"
        >
          <TrashIcon className={`w-5 h-5 ${isLoading ? "text-gray-500" : "text-red-500"}`} />
        </button>
      </td>
    </tr>
  );
};

export default ShowQuestions;
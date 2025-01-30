import React from "react";
import { X } from "lucide-react";

const FindReplaceDialog = ({
  findText,
  setFindText,
  replaceText,
  setReplaceText,
  caseSensitive,
  setCaseSensitive,
  handleFindReplace,
  navigateMatches,
  matches,
  currentMatchIndex,
  onClose,
}) => {
  return (
    <div className="fixed top-4 right-4 bg-white shadow-xl rounded-lg p-6 z-50 w-96">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Find & Replace</h2>
        <button
          onClick={onClose}
          aria-label="Close Find & Replace dialog"
          className="p-2 text-gray-500 hover:text-gray-800 rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      {/* Input Fields */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="findText"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Find Text
          </label>
          <input
            id="findText"
            type="text"
            placeholder="Enter text to find"
            value={findText}
            onChange={(e) => setFindText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="replaceText"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Replace With
          </label>
          <input
            id="replaceText"
            type="text"
            placeholder="Enter replacement text"
            value={replaceText}
            onChange={(e) => setReplaceText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={() => setCaseSensitive(!caseSensitive)}
            id="caseSensitive"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="caseSensitive"
            className="text-sm font-medium text-gray-600"
          >
            Case Sensitive
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-4">
        <div className="flex justify-between space-x-2">
          <button
            onClick={() => handleFindReplace("find")}
            className="flex-1 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            Find
          </button>
          <button
            onClick={() => navigateMatches("next")}
            className="flex-1 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none"
          >
            Next
          </button>
          <button
            onClick={() => navigateMatches("prev")}
            className="flex-1 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none"
          >
            Prev
          </button>
        </div>
        <div className="flex justify-between space-x-2">
          <button
            onClick={() => handleFindReplace("replace")}
            className="flex-1 py-2 bg-green-500 text-white text-sm font-medium rounded hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            Replace
          </button>
          <button
            onClick={() => handleFindReplace("replaceAll")}
            className="flex-1 py-2 bg-red-500 text-white text-sm font-medium rounded hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            Replace All
          </button>
        </div>
      </div>

      {/* Match Count */}
      <div className="mt-4 text-sm text-gray-500">
        {matches.length > 0
          ? `Match ${currentMatchIndex + 1} of ${matches.length}`
          : "No matches found"}
      </div>
    </div>
  );
};

export default FindReplaceDialog;

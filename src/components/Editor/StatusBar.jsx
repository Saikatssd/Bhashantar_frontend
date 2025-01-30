import React from 'react';

const StatusBar = ({ wordCount, charCount }) => {
  return (
    <div className="bg-white border-t border-gray-200 p-2 flex justify-between text-sm text-gray-600">
      <span>Words: {wordCount}</span>
      <span>Characters: {charCount}</span>
    </div>
  );
};

export default StatusBar;

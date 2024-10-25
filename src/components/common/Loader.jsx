// import React from 'react';
// import './LoaderStyles.css';

// const Loader = () => {
//   return (
//     <div className="flex items-center justify-center min-h-screen">
//       <div className="loader-container">
//         <div className="gradient-bg"></div>
//         <div className="letters-container">
//           <span className="letter">अ</span>
//           <span className="letter">ह</span>
//           <span className="letter">म्</span>
//           <span className="letter">भ</span>
//           <span className="letter">ा</span>
//           <span className="letter">षा</span>
//           <span className="letter">A</span>
//         </div>
//         <div className="tree"></div>
//         <div className="book"></div>
//       </div>
//     </div>
//   );
// };

// export default Loader;
import React from "react";
import { Box } from "lucide-react";
import './LoaderStyles.css';

const Loader = () => {
  const inputLetters = ["P", "L", "S"," ", "W", "A", "I", "T"];
  const outputScripts = [
    { text: "হ্যালো", lang: "Bengali" },
    { text: "नमस्ते", lang: "Hindi" },
    { text: "こんにちは", lang: "Japanese" },
    { text: "안녕하세요", lang: "Korean" },
    { text: "مرحبا", lang: "Arabic" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative w-[600px] h-[400px]">
        {/* Machine Body */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-48 bg-gradient-to-br from-purple-600/90 to-indigo-600/90 rounded-xl shadow-2xl backdrop-blur-sm">
          <div className="absolute inset-2 bg-gradient-to-br from-purple-700/90 to-indigo-700/90 rounded-lg">
            {/* Machine Details */}
            <div className="absolute top-2 right-2 flex gap-1">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse delay-75"></div>
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse delay-150"></div>
            </div>
            <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-white opacity-20" />
          </div>
        </div>

        {/* Input Conveyor */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[220px] h-16 bg-gray-200/80 backdrop-blur-sm rounded-l-full">
          {inputLetters.map((letter, index) => (
            <div
              key={`input-${index}`}
              className="absolute top-1/2 -translate-y-1/2 font-bold text-2xl text-purple-600"
              style={{
                left: `${index * 40 + 20}px`,
                animation: `moveToMachine 2s linear infinite`,
                animationDelay: `${index * 0.3}s`,
              }}
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Output Conveyor */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[220px] h-16 bg-gray-200/80 backdrop-blur-sm rounded-r-full">
          {outputScripts.map((script, index) => (
            <div
              key={`output-${index}`}
              className="absolute top-1/2 -translate-y-1/2 font-bold text-xl"
              style={{
                right: `${20}px`,
                animation: `moveFromMachine 2s linear infinite`,
                animationDelay: `${index * 0.3}s`,
                opacity: 0,
              }}
            >
              <span className="text-indigo-600">{script.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Loader;

import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/default-highlight';
import atomOneDark from 'react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark';

interface CodeDisplayProps {
  code: string;
  language?: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  code,
  language = 'java'
}) => {
  console.log('CodeDisplay: typeof code:', typeof code);
  console.log('CodeDisplay: code value:', code);
  if (typeof code !== 'string') {
    console.error('CodeDisplay: code is not a string!', code);
    if (Array.isArray(code)) {
      console.error('CodeDisplay: code is an array. Array contents:', code);
      (code as any[]).forEach((item: any, idx: number) => {
        console.error(`CodeDisplay: code[${idx}] type:`, typeof item, 'value:', item);
      });
    }
    return <div className="text-red-500">Invalid code data</div>;
  }
  return (
    <div className="relative">
      <SyntaxHighlighter
        language={language}
        style={atomOneDark}
        showLineNumbers
        wrapLines
      >
        {code}
      </SyntaxHighlighter>
      <button
        onClick={() => navigator.clipboard.writeText(code)}
        className="absolute top-2 right-2 px-2 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-600"
      >
        Copy
      </button>
    </div>
  );
};

export default CodeDisplay; 
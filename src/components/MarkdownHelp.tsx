'use client';

import { useState } from 'react';

export default function MarkdownHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-sm text-blue-600 hover:text-blue-800 underline"
      >
        {isOpen ? 'Hide' : 'Show'} Markdown Help
      </button>
      
      {isOpen && (
        <div className="mt-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm">
          <p className="font-semibold mb-2">You can use Markdown formatting:</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li><strong>**Bold**</strong> or <strong>__Bold__</strong> → <strong>Bold</strong></li>
            <li><em>*Italic*</em> or <em>_Italic_</em> → <em>Italic</em></li>
            <li><code>`Code`</code> → <code>Code</code></li>
            <li># Heading 1, ## Heading 2, ### Heading 3</li>
            <li>- Bullet point or * Bullet point</li>
            <li>1. Numbered list</li>
            <li>[Link text](https://url.com) → <a href="#" className="text-blue-600 underline">Link text</a></li>
            <li>&gt; Blockquote</li>
            <li>--- for horizontal rule</li>
          </ul>
          <p className="mt-2 text-gray-600">
            <strong>Tip:</strong> Press Enter twice to create a new paragraph.
          </p>
        </div>
      )}
    </div>
  );
}




import { useState } from 'react';
import type { CodeBlock as CodeBlockType, CodeLanguage } from '../types/slide';
import { CodeBlock } from './CodeBlock';

interface CodeTabsProps {
  codeBlocks: CodeBlockType[];
}

const languageLabels: Record<CodeLanguage, string> = {
  html: 'HTML',
  css: 'CSS',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
};

const languageDots: Record<CodeLanguage, string> = {
  html: 'bg-lang-html',
  css: 'bg-lang-css',
  javascript: 'bg-lang-javascript',
  typescript: 'bg-lang-typescript',
  jsx: 'bg-lang-jsx',
  tsx: 'bg-lang-tsx',
};

export function CodeTabs({ codeBlocks }: CodeTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (codeBlocks.length === 0) {
    return null;
  }

  if (codeBlocks.length === 1) {
    return <CodeBlock codeBlock={codeBlocks[0]} />;
  }

  const active = codeBlocks[Math.min(activeIndex, codeBlocks.length - 1)];

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <div className="flex shrink-0 flex-wrap gap-2">
        {codeBlocks.map((block, index) => {
          const label = block.filename ?? languageLabels[block.language];
          const isActive = index === activeIndex;

          return (
            <button
              key={`${block.filename ?? block.language}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`flex items-center gap-2.5 rounded-lg border px-4 py-2.5 text-[18px] transition-colors ${
                isActive
                  ? 'border-acid/55 bg-acid/14 text-paper'
                  : 'border-line-soft bg-panel text-muted hover:border-line hover:text-paper'
              }`}
            >
              <span
                className={`size-2.5 rounded-full ${languageDots[block.language]}`}
              />
              {label}
            </button>
          );
        })}
      </div>

      <div className="min-h-0 flex-1">
        <CodeBlock codeBlock={active} hideFilename />
      </div>
    </div>
  );
}

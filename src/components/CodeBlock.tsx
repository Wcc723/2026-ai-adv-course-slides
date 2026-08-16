import { Highlight } from 'prism-react-renderer';
import type { CodeBlock as CodeBlockType } from '../types/slide';
import { codeTheme } from './codeTheme';

interface CodeBlockProps {
  codeBlock: CodeBlockType;
  /** 隱藏檔名列（多分頁時分頁標籤已經顯示檔名） */
  hideFilename?: boolean;
}

/** 行數多的時候自動縮字，讓整段程式碼不用捲動就看得完 */
function density(lineCount: number) {
  if (lineCount > 22) return 'text-[17px] leading-[1.6]';
  if (lineCount > 16) return 'text-[18px] leading-[1.65]';
  return 'text-[20px] leading-[1.75]';
}

export function CodeBlock({ codeBlock, hideFilename = false }: CodeBlockProps) {
  const { language, code, filename, highlightLines = [] } = codeBlock;
  const sizeClass = density(code.trim().split('\n').length);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-line bg-ink-soft">
      {filename && !hideFilename && (
        <div className="flex shrink-0 items-center gap-3 border-b border-line-soft bg-panel px-6 py-3.5">
          <span className="size-2.5 rounded-full bg-coral/70" />
          <span className="font-mono text-[18px] text-muted">{filename}</span>
        </div>
      )}

      <Highlight theme={codeTheme} code={code.trim()} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={`${className} min-h-0 flex-1 overflow-auto py-5 ${sizeClass}`}
            style={style}
          >
            {tokens.map((line, i) => {
              const lineNumber = i + 1;
              const isHighlighted = highlightLines.includes(lineNumber);
              const lineProps = getLineProps({ line });

              return (
                <div
                  key={i}
                  {...lineProps}
                  /*
                   * 高亮列的填色維持 /8 不能再提高：程式碼井已經是最深的表面，
                   * 疊上去之後語法色最緊的一支只剩 4.64:1，再高就不合格。
                   * 存在感改用 6px 的實心左框補回來（深色版是 2px）——
                   * 投影機會吃掉 1.13:1 的色帶，但吃不掉一條實線。
                   */
                  className={`${lineProps.className ?? ''} border-l-[6px] px-6 ${
                    isHighlighted
                      ? 'border-acid bg-acid/8'
                      : 'border-transparent'
                  }`}
                >
                  <span className="mr-5 inline-block w-8 shrink-0 select-none text-right text-[16px] text-faint">
                    {lineNumber}
                  </span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

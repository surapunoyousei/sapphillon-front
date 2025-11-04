import { Box } from "@chakra-ui/react";
import React from "react";

export interface CodeHighlighterProps {
  code: string;
  language?: "javascript" | "typescript";
}

// シンプルなシンタックスハイライター
// キーワード、文字列、数値、コメントなどを色分け
export const CodeHighlighter: React.FC<CodeHighlighterProps> = ({ code }) => {
  const lines = code.split("\n");

  const highlightLine = (line: string): React.ReactNode => {
    const tokens: React.ReactNode[] = [];
    let i = 0;

    while (i < line.length) {
      // コメント
      if (line.slice(i, i + 2) === "//") {
        tokens.push(
          <Box as="span" key={`${i}-comment`} color="green.600" _dark={{ color: "green.400" }}>
            {line.slice(i)}
          </Box>
        );
        break;
      }

      // 文字列 (ダブルクォート)
      if (line[i] === '"') {
        let j = i + 1;
        while (j < line.length && line[j] !== '"') {
          if (line[j] === "\\" && j + 1 < line.length) j += 2;
          else j++;
        }
        tokens.push(
          <Box as="span" key={`${i}-string`} color="orange.600" _dark={{ color: "orange.300" }}>
            {line.slice(i, j + 1)}
          </Box>
        );
        i = j + 1;
        continue;
      }

      // 文字列 (シングルクォート)
      if (line[i] === "'") {
        let j = i + 1;
        while (j < line.length && line[j] !== "'") {
          if (line[j] === "\\" && j + 1 < line.length) j += 2;
          else j++;
        }
        tokens.push(
          <Box as="span" key={`${i}-string`} color="orange.600" _dark={{ color: "orange.300" }}>
            {line.slice(i, j + 1)}
          </Box>
        );
        i = j + 1;
        continue;
      }

      // バッククォート文字列
      if (line[i] === "`") {
        let j = i + 1;
        while (j < line.length && line[j] !== "`") {
          if (line[j] === "\\" && j + 1 < line.length) j += 2;
          else j++;
        }
        tokens.push(
          <Box as="span" key={`${i}-template`} color="orange.600" _dark={{ color: "orange.300" }}>
            {line.slice(i, j + 1)}
          </Box>
        );
        i = j + 1;
        continue;
      }

      // 数値
      if (/\d/.test(line[i])) {
        let j = i;
        while (j < line.length && /[\d.]/.test(line[j])) j++;
        tokens.push(
          <Box as="span" key={`${i}-number`} color="teal.600" _dark={{ color: "teal.300" }}>
            {line.slice(i, j)}
          </Box>
        );
        i = j;
        continue;
      }

      // 識別子とキーワード
      if (/[a-zA-Z_$]/.test(line[i])) {
        let j = i;
        while (j < line.length && /[a-zA-Z0-9_$]/.test(line[j])) j++;
        const word = line.slice(i, j);

        // JavaScriptキーワード
        const keywords = [
          "async", "await", "break", "case", "catch", "class", "const", "continue",
          "debugger", "default", "delete", "do", "else", "export", "extends",
          "finally", "for", "function", "if", "import", "in", "instanceof",
          "let", "new", "return", "static", "super", "switch", "this",
          "throw", "try", "typeof", "var", "void", "while", "with", "yield"
        ];

        if (keywords.includes(word)) {
          tokens.push(
            <Box as="span" key={`${i}-keyword`} color="purple.600" fontWeight="bold" _dark={{ color: "purple.300" }}>
              {word}
            </Box>
          );
        } else if (word === "true" || word === "false" || word === "null" || word === "undefined") {
          tokens.push(
            <Box as="span" key={`${i}-literal`} color="blue.600" _dark={{ color: "blue.300" }}>
              {word}
            </Box>
          );
        } else if (word === "console" || word === "Math" || word === "JSON" || word === "Array" || word === "Object") {
          tokens.push(
            <Box as="span" key={`${i}-builtin`} color="cyan.600" _dark={{ color: "cyan.300" }}>
              {word}
            </Box>
          );
        } else {
          tokens.push(<span key={`${i}-ident`}>{word}</span>);
        }
        i = j;
        continue;
      }

      // その他の文字（演算子、括弧など）
      tokens.push(<span key={`${i}-other`}>{line[i]}</span>);
      i++;
    }

    return <>{tokens}</>;
  };

  return (
    <Box
      as="pre"
      fontFamily="monospace"
      fontSize={{ base: "xs", md: "sm" }}
      m={0}
      p={{ base: 3, md: 4 }}
      overflow="auto"
      bg={{
        base: "white",
        _dark: "gray.800",
      }}
      rounded="md"
      border="1px"
      borderColor={{
        base: "gray.200",
        _dark: "gray.700",
      }}
    >
      {lines.map((line, index) => (
        <Box key={index} as="div" minH="1.5em">
          {highlightLine(line)}
        </Box>
      ))}
    </Box>
  );
};






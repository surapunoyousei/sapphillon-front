import React, { useState, useMemo } from "react";
import {
    Box,
    Button,
    Card,
    Code,
    Flex,
    Heading,
    HStack,
    Tabs,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";
import { LuCheck, LuX, LuZap } from "react-icons/lu";
import { parseWorkflowCode, stripTypeScriptSyntax } from "@/components/workflow/ast-utils";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import generate from "@babel/generator";

// テスト用のワークフローサンプル
const SAMPLE_WORKFLOWS = [
    {
        name: "シンプルなワークフロー",
        code: `async function workflow() {
  const page = await browser.newPage();
  await page.goto("https://example.com");
  return { success: true };
}`,
    },
    {
        name: "TypeScript付きワークフロー",
        code: `async function workflow(): Promise<Result> {
  const page: Page = await browser.newPage();
  const data: string[] = [];
  await page.goto("https://example.com");
  return { success: true, data };
}`,
    },
    {
        name: "条件分岐",
        code: `async function workflow() {
  const page = await browser.newPage();
  const result = await page.evaluate(() => document.title);
  if (result.includes("Example")) {
    return { found: true };
  } else {
    return { found: false };
  }
}`,
    },
    {
        name: "ループ処理",
        code: `async function workflow() {
  const page = await browser.newPage();
  const links = await page.$$eval('a', els => els.map(el => el.href));
  for (const link of links) {
    await page.goto(link);
    await page.waitForTimeout(1000);
  }
  return { processed: links.length };
}`,
    },
    {
        name: "エラーハンドリング",
        code: `async function workflow() {
  const page = await browser.newPage();
  try {
    await page.goto("https://example.com");
    const data = await page.$eval('#data', el => el.textContent);
    return { success: true, data };
  } catch (error) {
    console.error("Failed to scrape:", error);
    return { success: false, error: error.message };
  }
}`,
    },
    {
        name: "複雑なネスト",
        code: `async function workflow() {
  const page = await browser.newPage();
  const results = [];
  
  for (let i = 0; i < 3; i++) {
    try {
      await page.goto(\`https://example.com/page/\${i}\`);
      const items = await page.$$('.item');
      
      for (const item of items) {
        const text = await item.textContent();
        if (text.includes('important')) {
          results.push({ page: i, text });
        }
      }
    } catch (error) {
      console.warn(\`Page \${i} failed\`, error);
    }
  }
  
  return { results, total: results.length };
}`,
    },
];

interface AnalysisResult {
    parseSuccess: boolean;
    parseError: string | null;
    functionFound: boolean;
    statementsCount: number;
    hasAsync: boolean;
    hasAwait: boolean;
    hasTypeScript: boolean;
    strippedCode: string;
    complexity: {
        conditions: number;
        loops: number;
        tryCatch: number;
        functions: number;
    };
    identifiers: Set<string>;
    callExpressions: string[];
}

function analyzeWorkflow(code: string): AnalysisResult {
    const result: AnalysisResult = {
        parseSuccess: false,
        parseError: null,
        functionFound: false,
        statementsCount: 0,
        hasAsync: false,
        hasAwait: false,
        hasTypeScript: false,
        strippedCode: "",
        complexity: {
            conditions: 0,
            loops: 0,
            tryCatch: 0,
            functions: 0,
        },
        identifiers: new Set(),
        callExpressions: [],
    };

    try {
        // パース
        const ast = parser.parse(code, {
            sourceType: "module",
            plugins: ["typescript"],
        });

        result.parseSuccess = true;

        // workflow関数を探す
        const workflowFunction = ast.program.body.find(
            (node) =>
                node.type === "FunctionDeclaration" && node.id?.name === "workflow",
        );

        if (workflowFunction && workflowFunction.type === "FunctionDeclaration") {
            result.functionFound = true;
            result.hasAsync = workflowFunction.async || false;
            result.statementsCount = workflowFunction.body.body.length;
        }

        // ASTをトラバースして詳細分析
        traverse(ast, {
            AwaitExpression() {
                result.hasAwait = true;
            },
            TSTypeAnnotation() {
                result.hasTypeScript = true;
            },
            TSInterfaceDeclaration() {
                result.hasTypeScript = true;
            },
            TSTypeAliasDeclaration() {
                result.hasTypeScript = true;
            },
            IfStatement() {
                result.complexity.conditions++;
            },
            ForStatement() {
                result.complexity.loops++;
            },
            ForOfStatement() {
                result.complexity.loops++;
            },
            ForInStatement() {
                result.complexity.loops++;
            },
            WhileStatement() {
                result.complexity.loops++;
            },
            DoWhileStatement() {
                result.complexity.loops++;
            },
            TryStatement() {
                result.complexity.tryCatch++;
            },
            FunctionDeclaration() {
                result.complexity.functions++;
            },
            FunctionExpression() {
                result.complexity.functions++;
            },
            ArrowFunctionExpression() {
                result.complexity.functions++;
            },
            Identifier(path) {
                result.identifiers.add(path.node.name);
            },
            CallExpression(path) {
                try {
                    const gen = (generate as any).default ?? generate;
                    const { code } = gen(path.node.callee, { compact: true });
                    result.callExpressions.push(code);
                } catch {
                    // Ignore generation errors
                }
            },
        });

        // TypeScript構文を削除
        result.strippedCode = stripTypeScriptSyntax(code);
    } catch (error) {
        result.parseError = error instanceof Error ? error.message : String(error);
    }

    return result;
}

export function WorkflowParserTest() {
    const [selectedSample, setSelectedSample] = useState(0);
    const [customCode, setCustomCode] = useState("");
    const [useCustom, setUseCustom] = useState(false);

    const currentCode = useCustom ? customCode : SAMPLE_WORKFLOWS[selectedSample].code;

    const analysis = useMemo(() => analyzeWorkflow(currentCode), [currentCode]);
    const parseResult = useMemo(() => parseWorkflowCode(currentCode), [currentCode]);

    return (
        <Flex direction="column" h="full" overflow="hidden">
            {/* Header */}
            <Box borderBottomWidth="1px" px={6} py={4}>
                <Heading size="lg">ワークフローパーサーテスト</Heading>
                <Text fontSize="sm" color="fg.muted" mt={1}>
                    JavaScriptワークフローのパース機能をテストし、分析結果を確認できます
                </Text>
            </Box>

            {/* Main Content */}
            <Flex flex="1" overflow="hidden">
                {/* Left: Code Input */}
                <Box
                    w="50%"
                    borderRightWidth="1px"
                    overflow="auto"
                    p={4}
                >
                    <VStack align="stretch" gap={4}>
                        <Box>
                            <Text fontWeight="medium" mb={2}>
                                サンプルワークフロー
                            </Text>
                            <HStack gap={2} flexWrap="wrap">
                                {SAMPLE_WORKFLOWS.map((sample, idx) => (
                                    <Button
                                        key={idx}
                                        size="sm"
                                        variant={!useCustom && selectedSample === idx ? "solid" : "outline"}
                                        onClick={() => {
                                            setSelectedSample(idx);
                                            setUseCustom(false);
                                        }}
                                    >
                                        {sample.name}
                                    </Button>
                                ))}
                            </HStack>
                        </Box>

                        <Box>
                            <HStack justify="space-between" mb={2}>
                                <Text fontWeight="medium">コード入力</Text>
                                <Button
                                    size="sm"
                                    variant={useCustom ? "solid" : "outline"}
                                    onClick={() => setUseCustom(!useCustom)}
                                >
                                    カスタムコード
                                </Button>
                            </HStack>
                            <Textarea
                                value={currentCode}
                                onChange={(e) => {
                                    setCustomCode(e.target.value);
                                    setUseCustom(true);
                                }}
                                fontFamily="mono"
                                fontSize="sm"
                                rows={20}
                                placeholder="function workflow() { ... }"
                            />
                        </Box>
                    </VStack>
                </Box>

                {/* Right: Analysis Results */}
                <Box w="50%" overflow="auto" p={4}>
                    <VStack align="stretch" gap={4}>
                        {/* Parse Status */}
                        <Card.Root>
                            <Card.Header>
                                <Heading size="sm">パース結果</Heading>
                            </Card.Header>
                            <Card.Body>
                                <VStack align="stretch" gap={2}>
                                    <HStack>
                                        {analysis.parseSuccess ? (
                                            <LuCheck color="green" size={20} />
                                        ) : (
                                            <LuX color="red" size={20} />
                                        )}
                                        <Text>
                                            {analysis.parseSuccess
                                                ? "パース成功"
                                                : "パース失敗"}
                                        </Text>
                                    </HStack>
                                    {analysis.parseError && (
                                        <Code colorPalette="red" fontSize="xs">
                                            {analysis.parseError}
                                        </Code>
                                    )}
                                    <HStack>
                                        {analysis.functionFound ? (
                                            <LuCheck color="green" size={20} />
                                        ) : (
                                            <LuX color="red" size={20} />
                                        )}
                                        <Text>
                                            workflow()関数{" "}
                                            {analysis.functionFound ? "検出" : "未検出"}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </Card.Body>
                        </Card.Root>

                        {/* Basic Info */}
                        <Card.Root>
                            <Card.Header>
                                <Heading size="sm">基本情報</Heading>
                            </Card.Header>
                            <Card.Body>
                                <VStack align="stretch" gap={1} fontSize="sm">
                                    <HStack justify="space-between">
                                        <Text>ステートメント数:</Text>
                                        <Text fontWeight="medium">
                                            {analysis.statementsCount}
                                        </Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Async関数:</Text>
                                        <Text fontWeight="medium">
                                            {analysis.hasAsync ? "Yes" : "No"}
                                        </Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Await使用:</Text>
                                        <Text fontWeight="medium">
                                            {analysis.hasAwait ? "Yes" : "No"}
                                        </Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>TypeScript構文:</Text>
                                        <Text fontWeight="medium">
                                            {analysis.hasTypeScript ? "Yes" : "No"}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </Card.Body>
                        </Card.Root>

                        {/* Complexity */}
                        <Card.Root>
                            <Card.Header>
                                <Heading size="sm">複雑度</Heading>
                            </Card.Header>
                            <Card.Body>
                                <VStack align="stretch" gap={1} fontSize="sm">
                                    <HStack justify="space-between">
                                        <Text>条件分岐:</Text>
                                        <Text fontWeight="medium">
                                            {analysis.complexity.conditions}
                                        </Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>ループ:</Text>
                                        <Text fontWeight="medium">
                                            {analysis.complexity.loops}
                                        </Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>Try-Catch:</Text>
                                        <Text fontWeight="medium">
                                            {analysis.complexity.tryCatch}
                                        </Text>
                                    </HStack>
                                    <HStack justify="space-between">
                                        <Text>関数定義:</Text>
                                        <Text fontWeight="medium">
                                            {analysis.complexity.functions}
                                        </Text>
                                    </HStack>
                                </VStack>
                            </Card.Body>
                        </Card.Root>

                        {/* Call Expressions */}
                        <Card.Root>
                            <Card.Header>
                                <Heading size="sm">
                                    関数呼び出し ({analysis.callExpressions.length})
                                </Heading>
                            </Card.Header>
                            <Card.Body>
                                <VStack align="stretch" gap={1}>
                                    {analysis.callExpressions.slice(0, 10).map((call, idx) => (
                                        <Code key={idx} fontSize="xs">
                                            {call}
                                        </Code>
                                    ))}
                                    {analysis.callExpressions.length > 10 && (
                                        <Text fontSize="xs" color="fg.muted">
                                            ... 他 {analysis.callExpressions.length - 10} 件
                                        </Text>
                                    )}
                                </VStack>
                            </Card.Body>
                        </Card.Root>

                        {/* Stripped Code */}
                        {analysis.hasTypeScript && (
                            <Card.Root>
                                <Card.Header>
                                    <Heading size="sm">TypeScript構文除去後</Heading>
                                </Card.Header>
                                <Card.Body>
                                    <Code
                                        as="pre"
                                        display="block"
                                        fontSize="xs"
                                        p={2}
                                        overflowX="auto"
                                    >
                                        {analysis.strippedCode}
                                    </Code>
                                </Card.Body>
                            </Card.Root>
                        )}

                        {/* Parse Tree */}
                        {parseResult.workflowBody && (
                            <Card.Root>
                                <Card.Header>
                                    <Heading size="sm">
                                        <HStack>
                                            <LuZap />
                                            <Text>パースツリー検出成功</Text>
                                        </HStack>
                                    </Heading>
                                </Card.Header>
                                <Card.Body>
                                    <Text fontSize="sm" color="green.600">
                                        {parseResult.workflowBody.length} 個のステートメントを検出しました
                                    </Text>
                                </Card.Body>
                            </Card.Root>
                        )}
                    </VStack>
                </Box>
            </Flex>
        </Flex>
    );
}


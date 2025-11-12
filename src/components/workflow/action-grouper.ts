import type {
  Statement,
  Expression,
  IfStatement,
  ForStatement,
  WhileStatement,
  ForInStatement,
  ForOfStatement,
  TryStatement,
} from "@babel/types";
import generate from "@babel/generator";
import i18n from "@/i18n/config";

export interface WorkflowAction {
  type:
    | "navigation"
    | "interaction"
    | "data-extraction"
    | "computation"
    | "control-flow"
    | "return";
  title: string;
  description: string;
  humanReadable: string; // 人間が読める詳細な説明
  statements: Statement[];
  importance: "high" | "medium" | "low";
  variables?: string[];
  icon?: string;
  details?: string[]; // ステップごとの自然言語説明
}

const generateCode = (node: Statement | Expression) => {
  try {
    // @ts-expect-error @babel/generator's ESM/CJS module is a bit weird.
    const generator = generate.default ?? generate;
    const { code } = generator(node, {
      compact: true,
      comments: false,
      concise: true,
    });
    return code;
  } catch {
    return "";
  }
};

const extractVariableName = (statement: Statement): string | null => {
  if (statement.type === "VariableDeclaration") {
    const decl = statement.declarations[0];
    if (decl && decl.id.type === "Identifier") {
      return decl.id.name;
    }
  }
  return null;
};

const extractStringValue = (code: string): string | null => {
  const match = code.match(/["']([^"']+)["']/);
  return match ? match[1] : null;
};

const isNavigationAction = (code: string): boolean => {
  const navKeywords = [
    "goto",
    "navigate",
    "open",
    "visit",
    "newPage",
    "createPage",
  ];
  return navKeywords.some((keyword) => code.includes(keyword));
};

const isInteractionAction = (code: string): boolean => {
  const interactionKeywords = [
    "click",
    "type",
    "fill",
    "select",
    "submit",
    "press",
    "hover",
    "focus",
  ];
  return interactionKeywords.some((keyword) => code.includes(keyword));
};

const isDataExtractionAction = (code: string): boolean => {
  const extractionKeywords = [
    "textContent",
    "innerHTML",
    "getAttribute",
    "evaluate",
    "$$eval",
    "$eval",
    "title",
  ];
  return extractionKeywords.some((keyword) => code.includes(keyword));
};

const isReturnStatement = (statement: Statement): boolean => {
  return statement.type === "ReturnStatement";
};

const isControlFlow = (statement: Statement): boolean => {
  return [
    "IfStatement",
    "ForStatement",
    "ForInStatement",
    "ForOfStatement",
    "WhileStatement",
    "SwitchStatement",
    "TryStatement",
  ].includes(statement.type);
};

// 条件式を自然言語に変換（コードを含める）
const describeCondition = (code: string): string => {
  // 簡単なクリーンアップ（余分な空白を削除）
  const cleaned = code.trim();

  // コードをバッククォートで囲んで返す（演算子のみ自然言語に変換）
  const result = cleaned
    .replace(/===/g, " が ")
    .replace(/==/g, " が ")
    .replace(/!==/g, " が異なる ")
    .replace(/!=/g, " が異なる ")
    .replace(/>=/g, " 以上 ")
    .replace(/<=/g, " 以下 ")
    .replace(/>/g, " より大きい ")
    .replace(/</g, " より小さい ")
    .replace(/&&/g, " かつ ")
    .replace(/\|\|/g, " または ");

  return `\`${result}\``;
};

// コードから初期化の値を抽出
const extractInitValue = (code: string): string | null => {
  // const xxx = yyy の形式から yyy を抽出
  const match = code.match(/=\s*(.+?)(?:;|$)/);
  if (match) {
    return match[1].trim();
  }
  return null;
};

// ステートメント単体を自然言語に変換
const describeStatement = (statement: Statement): string => {
  const code = generateCode(statement);

  if (statement.type === "VariableDeclaration") {
    const decl = statement.declarations[0];
    if (decl && decl.id.type === "Identifier") {
      const name = decl.id.name;
      const initValue = extractInitValue(code);

      if (code.includes("newPage")) {
        return `新しいブラウザページ \`${name}\` を作成`;
      } else if (code.includes("title")) {
        return `ページのタイトルを取得して \`${name}\` に保存`;
      } else if (code.includes("textContent") || code.includes("innerHTML")) {
        return `要素のテキストを取得して \`${name}\` に保存`;
      } else if (initValue) {
        // 初期化の値がある場合は具体的に表示
        return `\`${name} = ${initValue}\` として準備`;
      } else {
        return `\`${name}\` を準備`;
      }
    }
  } else if (statement.type === "ExpressionStatement") {
    if (code.includes("goto")) {
      const url = extractStringValue(code);
      if (url) {
        return `ウェブページ \`${url}\` に移動`;
      } else {
        return `指定されたURLに移動`;
      }
    } else if (code.includes("click")) {
      return `要素をクリック`;
    } else if (code.includes("type") || code.includes("fill")) {
      return `テキストを入力`;
    } else if (code.includes("console.log")) {
      // console.logの引数を抽出
      const logMatch = code.match(/console\.log\((.*)\)/);
      if (logMatch) {
        return `\`console.log(${logMatch[1]})\` を出力`;
      }
      return `コンソールに情報を出力`;
    } else if (code.includes(".push(")) {
      // 配列へのpush操作
      const pushMatch = code.match(/(\w+)\.push\((.*)\)/);
      if (pushMatch) {
        return `\`${pushMatch[1]}\` に \`${pushMatch[2]}\` を追加`;
      }
      return `配列に要素を追加`;
    } else {
      // その他の式は実際のコードを表示
      const simplified = code.replace(/;$/, "").trim();
      if (simplified.length < 60) {
        return `\`${simplified}\` を実行`;
      }
      return `処理を実行`;
    }
  } else if (statement.type === "ReturnStatement") {
    // return文の値を抽出（改行や複雑なオブジェクトにも対応）
    // スペースが0個以上（\s*）でも対応
    const returnMatch = code.match(/return\s*([\s\S]+?)(?:;?\s*)$/);
    if (returnMatch) {
      let returnValue = returnMatch[1].trim();
      // セミコロンがあれば削除
      if (returnValue.endsWith(";")) {
        returnValue = returnValue.slice(0, -1).trim();
      }
      // 改行を削除してスペースに置き換え（オブジェクトを1行にする）
      returnValue = returnValue.replace(/\s+/g, " ");
      // 長すぎる場合は省略
      if (returnValue.length > 80) {
        returnValue = returnValue.substring(0, 77) + "...";
      }
      return `\`${returnValue}\` を返す`;
    }
    return `実行結果を返却`;
  } else if (statement.type === "IfStatement") {
    return `条件を確認`;
  } else if (
    statement.type === "ForStatement" ||
    statement.type === "WhileStatement"
  ) {
    return `繰り返し処理`;
  } else if (statement.type === "TryStatement") {
    return `エラーハンドリング`;
  }

  return `処理を実行`;
};

// ブロック内のステートメントを簡潔に説明
const describeBlock = (
  statements: Statement[],
  prefix: string = ""
): string[] => {
  const descriptions: string[] = [];

  statements.forEach((stmt) => {
    const desc = describeStatement(stmt);
    descriptions.push(`${prefix}${desc}`);
  });

  return descriptions;
};

// 自然言語の詳細説明を生成
const generateHumanReadableDescription = (
  statements: Statement[]
): { readable: string; details: string[] } => {
  const details: string[] = [];

  statements.forEach((statement) => {
    if (statement.type === "IfStatement") {
      // 条件分岐の説明
      const ifStmt = statement as IfStatement;
      const condition = ifStmt.test ? generateCode(ifStmt.test) : "";
      const conditionDesc = describeCondition(condition);
      details.push(`もし${conditionDesc}なら：`);

      // then ブロックの説明
      if (ifStmt.consequent) {
        const consequentStatements =
          ifStmt.consequent.type === "BlockStatement"
            ? ifStmt.consequent.body
            : [ifStmt.consequent];
        const thenDescs = describeBlock(consequentStatements, "  ✓ ");
        details.push(...thenDescs);
      }

      // else ブロックの説明
      if (ifStmt.alternate) {
        if (ifStmt.alternate.type === "IfStatement") {
          details.push(`そうでなければ、次の条件を確認：`);
          const elseIfDescs = generateHumanReadableDescription([
            ifStmt.alternate,
          ]);
          details.push(...elseIfDescs.details.map((d) => `  ${d}`));
        } else {
          details.push(`そうでなければ：`);
          const alternateStatements =
            ifStmt.alternate.type === "BlockStatement"
              ? ifStmt.alternate.body
              : [ifStmt.alternate];
          const elseDescs = describeBlock(alternateStatements, "  ✓ ");
          details.push(...elseDescs);
        }
      }
    } else if (
      statement.type === "ForStatement" ||
      statement.type === "WhileStatement" ||
      statement.type === "ForInStatement" ||
      statement.type === "ForOfStatement"
    ) {
      // ループの説明
      let loopDesc = "繰り返し処理：";

      if (statement.type === "ForStatement") {
        const forStmt = statement as ForStatement;
        if (forStmt.init) {
          loopDesc = "指定回数繰り返す：";
        }
      } else if (statement.type === "WhileStatement") {
        const whileStmt = statement as WhileStatement;
        if (whileStmt.test) {
          const condition = generateCode(whileStmt.test);
          const conditionDesc = describeCondition(condition);
          loopDesc = `${conditionDesc}の間、繰り返す：`;
        }
      } else if (statement.type === "ForOfStatement") {
        loopDesc = "各要素に対して繰り返す：";
      } else if (statement.type === "ForInStatement") {
        loopDesc = "各プロパティに対して繰り返す：";
      }

      details.push(loopDesc);

      // ループ内の処理
      const loopStmt = statement as
        | ForStatement
        | WhileStatement
        | ForInStatement
        | ForOfStatement;
      if (loopStmt.body) {
        const bodyStatements =
          loopStmt.body.type === "BlockStatement"
            ? loopStmt.body.body
            : [loopStmt.body];
        const bodyDescs = describeBlock(bodyStatements, "  ↻ ");
        details.push(...bodyDescs);
      }
    } else if (statement.type === "TryStatement") {
      // try-catch の説明
      const tryStmt = statement as TryStatement;
      details.push(`エラーが発生する可能性のある処理：`);

      // try ブロック
      if (tryStmt.block) {
        const tryDescs = describeBlock(tryStmt.block.body, "  ▸ ");
        details.push(...tryDescs);
      }

      // catch ブロック
      if (tryStmt.handler) {
        const errorVar =
          tryStmt.handler.param && tryStmt.handler.param.type === "Identifier"
            ? tryStmt.handler.param.name
            : "エラー";
        details.push(`もしエラーが発生したら（${errorVar}）：`);
        const catchDescs = describeBlock(tryStmt.handler.body.body, "  ⚠ ");
        details.push(...catchDescs);
      }

      // finally ブロック
      if (tryStmt.finalizer) {
        details.push(`最後に必ず実行：`);
        const finallyDescs = describeBlock(tryStmt.finalizer.body, "  ✓ ");
        details.push(...finallyDescs);
      }
    } else if (statement.type === "ReturnStatement") {
      // return文の詳細説明
      const desc = describeStatement(statement);
      details.push(desc);
    } else {
      // 通常のステートメント
      const desc = describeStatement(statement);
      details.push(desc);
    }
  });

  const readable = details.join(" → ");
  return { readable, details };
};

export function groupStatementsIntoActions(
  statements: Statement[]
): WorkflowAction[] {
  const actions: WorkflowAction[] = [];
  let i = 0;
  const variableMap = new Map<string, Statement[]>();

  // First pass: build variable dependency map
  statements.forEach((statement) => {
    const varName = extractVariableName(statement);

    if (varName) {
      variableMap.set(varName, [statement]);
    }
  });

  // Second pass: group statements into actions
  while (i < statements.length) {
    const statement = statements[i];
    const varName = extractVariableName(statement);

    // Return statement
    if (isReturnStatement(statement)) {
      const { readable, details } = generateHumanReadableDescription([
        statement,
      ]);
      actions.push({
        type: "return",
        title: i18n.t("workflowActions.return"),
        description: i18n.t("workflowActions.returnDescription"),
        humanReadable: readable || i18n.t("workflowActions.returnReadable"),
        statements: [statement],
        importance: "high",
        icon: "return",
        details,
      });
      i++;
      continue;
    }

    // Control flow (if, for, while, etc.)
    if (isControlFlow(statement)) {
      // 制御フローの詳細な説明を生成
      const { readable, details } = generateHumanReadableDescription([
        statement,
      ]);

      // タイトルと説明を動的に生成
      let title = i18n.t("workflowActions.controlFlow");
      let description = i18n.t("workflowActions.controlFlowDescription");

      if (statement.type === "IfStatement") {
        const ifStmt = statement as IfStatement;
        const condition = ifStmt.test ? generateCode(ifStmt.test) : "";
        const conditionDesc = describeCondition(condition);
        title = i18n.t("workflowActions.ifStatement");
        description = i18n.t("workflowActions.ifDescription", { condition: conditionDesc });
      } else if (statement.type === "ForStatement") {
        title = i18n.t("workflowActions.forLoop");
        description = i18n.t("workflowActions.forDescription");
      } else if (statement.type === "WhileStatement") {
        const whileStmt = statement as WhileStatement;
        const condition = whileStmt.test ? generateCode(whileStmt.test) : "";
        const conditionDesc = describeCondition(condition);
        title = i18n.t("workflowActions.whileLoop");
        description = i18n.t("workflowActions.whileDescription", { condition: conditionDesc });
      } else if (
        statement.type === "ForOfStatement" ||
        statement.type === "ForInStatement"
      ) {
        title = i18n.t("workflowActions.forOfLoop");
        description = i18n.t("workflowActions.forOfDescription");
      }

      actions.push({
        type: "control-flow",
        title,
        description,
        humanReadable: readable || i18n.t("workflowActions.controlFlowReadable"),
        statements: [statement],
        importance: "high",
        icon: "branch",
        details:
          details.length > 0 ? details : [i18n.t("workflowActions.checkCondition"), i18n.t("workflowActions.executeAction")],
      });
      i++;
      continue;
    }

    // Check if this is a variable declaration that will be used for navigation/interaction
    if (varName) {
      const relatedStatements: Statement[] = [statement];
      let j = i + 1;

      // Look ahead for statements using this variable
      while (j < statements.length) {
        const nextStatement = statements[j];
        const nextCode = generateCode(nextStatement);

        // If the next statement uses this variable, group them
        if (nextCode.includes(varName)) {
          relatedStatements.push(nextStatement);
          j++;
        } else {
          break;
        }
      }

      // Determine action type based on related statements
      const combinedCode = relatedStatements
        .map((s) => generateCode(s))
        .join(" ");
      const { readable, details } =
        generateHumanReadableDescription(relatedStatements);

      if (isNavigationAction(combinedCode)) {
        const url = extractStringValue(combinedCode);
        actions.push({
          type: "navigation",
          title: i18n.t("workflowActions.navigation"),
          description: url
            ? i18n.t("workflowActions.navigationWithUrl", { url })
            : i18n.t("workflowActions.navigationDescription"),
          humanReadable:
            readable || i18n.t("workflowActions.navigationReadable"),
          statements: relatedStatements,
          importance: "high",
          variables: [varName],
          icon: "navigation",
          details,
        });
        i = j;
        continue;
      }

      if (isInteractionAction(combinedCode)) {
        actions.push({
          type: "interaction",
          title: i18n.t("workflowActions.interaction"),
          description: i18n.t("workflowActions.interactionDescription"),
          humanReadable: readable || i18n.t("workflowActions.interactionReadable"),
          statements: relatedStatements,
          importance: "high",
          variables: [varName],
          icon: "interaction",
          details,
        });
        i = j;
        continue;
      }

      if (isDataExtractionAction(combinedCode)) {
        actions.push({
          type: "data-extraction",
          title: i18n.t("workflowActions.dataExtraction"),
          description: i18n.t("workflowActions.dataExtractionDescription"),
          humanReadable: readable || i18n.t("workflowActions.dataExtractionReadable"),
          statements: relatedStatements,
          importance: "high",
          variables: [varName],
          icon: "extraction",
          details,
        });
        i = j;
        continue;
      }
    }

    // Standalone navigation action
    const code = generateCode(statement);
    if (isNavigationAction(code)) {
      const url = extractStringValue(code);
      const { readable, details } = generateHumanReadableDescription([
        statement,
      ]);
      actions.push({
        type: "navigation",
        title: i18n.t("workflowActions.navigation"),
        description: url ? i18n.t("workflowActions.navigationWithUrl", { url }) : i18n.t("workflowActions.navigationReadable"),
        humanReadable: readable || i18n.t("workflowActions.navigationReadable"),
        statements: [statement],
        importance: "high",
        icon: "navigation",
        details,
      });
      i++;
      continue;
    }

    // Standalone interaction action
    if (isInteractionAction(code)) {
      const { readable, details } = generateHumanReadableDescription([
        statement,
      ]);
      actions.push({
        type: "interaction",
        title: i18n.t("workflowActions.interaction"),
        description: i18n.t("workflowActions.interactionDescription"),
        humanReadable: readable || i18n.t("workflowActions.interactionReadable"),
        statements: [statement],
        importance: "high",
        icon: "interaction",
        details,
      });
      i++;
      continue;
    }

    // Standalone data extraction
    if (isDataExtractionAction(code)) {
      const { readable, details } = generateHumanReadableDescription([
        statement,
      ]);
      actions.push({
        type: "data-extraction",
        title: i18n.t("workflowActions.dataExtraction"),
        description: i18n.t("workflowActions.dataExtractionDescription"),
        humanReadable: readable || i18n.t("workflowActions.dataExtractionReadable"),
        statements: [statement],
        importance: "medium",
        icon: "extraction",
        details,
      });
      i++;
      continue;
    }

    // Default: computation/variable assignment
    const { readable, details } = generateHumanReadableDescription([statement]);
    actions.push({
      type: "computation",
      title: varName ? i18n.t("workflowActions.prepareVariable") : i18n.t("workflowActions.computation"),
      description: varName
        ? i18n.t("workflowActions.prepareDescription", { name: varName })
        : i18n.t("workflowActions.computationDescription"),
      humanReadable: readable || i18n.t("workflowActions.computationReadable"),
      statements: [statement],
      importance: "low",
      variables: varName ? [varName] : undefined,
      icon: "compute",
      details,
    });
    i++;
  }

  return actions;
}

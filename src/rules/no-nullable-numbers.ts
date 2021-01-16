import { TSESTree, AST_NODE_TYPES, ESLintUtils } from "@typescript-eslint/experimental-utils";

import * as ts from "typescript";
import * as tsutils from "tsutils";
import * as util from "../util";
import { RuleContext, RuleListener, RuleModule } from "@typescript-eslint/experimental-utils/dist/ts-eslint";

export type Options = [{}];

export type MessageId = "conditionErrorNullableNumber";

const noNullableNumbers: RuleModule<MessageId, Options> = {
  meta: {
    type: "suggestion",
    messages: {
      conditionErrorNullableNumber:
        "Unexpected nullable number value in conditional. " + "Please handle the nullish/zero/NaN cases explicitly.",
    },
    schema: [
      {
        type: "object",
      },
    ],
  },
  create(context: Readonly<RuleContext<MessageId, Options>>) {
    const service = ESLintUtils.getParserServices(context);
    const checker = service.program.getTypeChecker();

    const checkedNodes = new Set<TSESTree.Node>();

    return {
      ConditionalExpression: checkTestExpression,
      DoWhileStatement: checkTestExpression,
      ForStatement: checkTestExpression,
      IfStatement: checkTestExpression,
      WhileStatement: checkTestExpression,
      'LogicalExpression[operator!="??"]': checkNode,
      'UnaryExpression[operator="!"]': checkUnaryLogicalExpression,
    } as RuleListener;

    type TestExpression =
      | TSESTree.ConditionalExpression
      | TSESTree.DoWhileStatement
      | TSESTree.ForStatement
      | TSESTree.IfStatement
      | TSESTree.WhileStatement;

    function checkTestExpression(node: TestExpression): void {
      if (node.test == null) {
        return;
      }
      checkNode(node.test, true);
    }

    function checkUnaryLogicalExpression(node: TSESTree.UnaryExpression): void {
      checkNode(node.argument, true);
    }

    /**
     * This function analyzes the type of a node and checks if it is allowed in a boolean context.
     * It can recurse when checking nested logical operators, so that only the outermost operands are reported.
     * The right operand of a logical expression is ignored unless it's a part of a test expression (if/while/ternary/etc).
     * @param node The AST node to check.
     * @param isTestExpr Whether the node is a descendant of a test expression.
     */
    function checkNode(node: TSESTree.Node, isTestExpr = false): void {
      // prevent checking the same node multiple times
      if (checkedNodes.has(node)) {
        return;
      }
      checkedNodes.add(node);

      // for logical operator, we check its operands
      if (node.type === AST_NODE_TYPES.LogicalExpression && node.operator !== "??") {
        checkNode(node.left, isTestExpr);

        // we ignore the right operand when not in a context of a test expression
        if (isTestExpr) {
          checkNode(node.right, isTestExpr);
        }
        return;
      }

      const tsNode = service.esTreeNodeToTSNodeMap.get(node);
      const type = util.getConstrainedTypeAtLocation(checker, tsNode);
      const types = inspectVariantTypes(tsutils.unionTypeParts(type));

      const is = (...wantedTypes: readonly VariantType[]): boolean =>
        types.size === wantedTypes.length && wantedTypes.every((type) => types.has(type));

      // boolean
      if (is("boolean")) {
        // boolean is always okay
        return;
      }

      // never
      if (is("never")) {
        // never is always okay
        return;
      }

      // nullish
      if (is("nullish")) {
        // condition is always false
        // context.report({ node, messageId: "conditionErrorNullish" });
        return;
      }

      // nullable boolean
      if (is("nullish", "boolean")) {
        // if (!options.allowNullableBoolean) {
        //   context.report({ node, messageId: "conditionErrorNullableBoolean" });
        // }
        return;
      }

      // string
      if (is("string")) {
        // if (!options.allowString) {
        //   context.report({ node, messageId: "conditionErrorString" });
        // }
        return;
      }

      // nullable string
      if (is("nullish", "string")) {
        // if (!options.allowNullableString) {
        //   context.report({ node, messageId: "conditionErrorNullableString" });
        // }
        return;
      }

      // number
      if (is("number")) {
        // if (!options.allowNumber) {
        //   context.report({ node, messageId: "conditionErrorNumber" });
        // }
        return;
      }

      // nullable number
      if (is("nullish", "number")) {
        context.report({ node, messageId: "conditionErrorNullableNumber" });
        return;
      }

      // object
      if (is("object")) {
        // condition is always true
        // context.report({ node, messageId: "conditionErrorObject" });
        return;
      }

      // nullable object
      if (is("nullish", "object")) {
        // if (!options.allowNullableObject) {
        //   context.report({ node, messageId: "conditionErrorNullableObject" });
        // }
        return;
      }

      // any
      if (is("any")) {
        // if (!options.allowAny) {
        //   context.report({ node, messageId: "conditionErrorAny" });
        // }
        return;
      }

      // other
      // context.report({ node, messageId: "conditionErrorOther" });
    }

    /** The types we care about */
    type VariantType = "nullish" | "boolean" | "string" | "number" | "object" | "any" | "never";

    /**
     * Check union variants for the types we care about
     */
    function inspectVariantTypes(types: ts.Type[]): Set<VariantType> {
      const variantTypes = new Set<VariantType>();

      if (
        types.some((type) =>
          tsutils.isTypeFlagSet(type, ts.TypeFlags.Null | ts.TypeFlags.Undefined | ts.TypeFlags.VoidLike),
        )
      ) {
        variantTypes.add("nullish");
      }

      if (types.some((type) => tsutils.isTypeFlagSet(type, ts.TypeFlags.BooleanLike))) {
        variantTypes.add("boolean");
      }

      if (types.some((type) => tsutils.isTypeFlagSet(type, ts.TypeFlags.StringLike))) {
        variantTypes.add("string");
      }

      if (types.some((type) => tsutils.isTypeFlagSet(type, ts.TypeFlags.NumberLike | ts.TypeFlags.BigIntLike))) {
        variantTypes.add("number");
      }

      if (
        types.some(
          (type) =>
            !tsutils.isTypeFlagSet(
              type,
              ts.TypeFlags.Null |
                ts.TypeFlags.Undefined |
                ts.TypeFlags.VoidLike |
                ts.TypeFlags.BooleanLike |
                ts.TypeFlags.StringLike |
                ts.TypeFlags.NumberLike |
                ts.TypeFlags.BigIntLike |
                ts.TypeFlags.Any |
                ts.TypeFlags.Unknown |
                ts.TypeFlags.Never,
            ),
        )
      ) {
        variantTypes.add("object");
      }

      if (types.some((type) => util.isTypeAnyType(type) || util.isTypeUnknownType(type))) {
        variantTypes.add("any");
      }

      if (types.some((type) => tsutils.isTypeFlagSet(type, ts.TypeFlags.Never))) {
        variantTypes.add("never");
      }

      return variantTypes;
    }
  },
};

export default noNullableNumbers;

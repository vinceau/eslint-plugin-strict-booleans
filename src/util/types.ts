import { unionTypeParts } from "tsutils";
import * as ts from "typescript";

/**
 * Resolves the given node's type. Will resolve to the type's generic constraint, if it has one.
 */
export function getConstrainedTypeAtLocation(checker: ts.TypeChecker, node: ts.Node): ts.Type {
  const nodeType = checker.getTypeAtLocation(node);
  const constrained = checker.getBaseConstraintOfType(nodeType);

  return constrained ?? nodeType;
}

/**
 * Gets all of the type flags in a type, iterating through unions automatically
 */
function getTypeFlags(type: ts.Type): ts.TypeFlags {
  let flags: ts.TypeFlags = 0;
  for (const t of unionTypeParts(type)) {
    flags |= t.flags;
  }
  return flags;
}

/**
 * Checks if the given type is (or accepts) the given flags
 * @param isReceiver true if the type is a receiving type (i.e. the type of a called function's parameter)
 */
function isTypeFlagSet(type: ts.Type, flagsToCheck: ts.TypeFlags, isReceiver?: boolean): boolean {
  const flags = getTypeFlags(type);

  if (isReceiver && flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) {
    return true;
  }

  return (flags & flagsToCheck) !== 0;
}

/**
 * @returns true if the type is `unknown`
 */
export function isTypeUnknownType(type: ts.Type): boolean {
  return isTypeFlagSet(type, ts.TypeFlags.Unknown);
}

/**
 * @returns true if the type is `any`
 */
export function isTypeAnyType(type: ts.Type): boolean {
  if (isTypeFlagSet(type, ts.TypeFlags.Any)) {
    // if (type.intrinsicName === "error") {
    //   log('Found an "error" any type');
    // }
    return true;
  }
  return false;
}

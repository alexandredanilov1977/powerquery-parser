// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Type } from "..";
import { Assert } from "../../common";
import { isEqualType } from "./isEqualType";

// Returns `${left} is a subset of ${right}. Eg.
// `Type.TextInstance is a subset of Type.AnyInstance` -> true
// `Type.AnyInstance is a subset of Type.TextInstance` -> false
// `Type.NullInstance is a subset of Type.AnyNonNull` -> false
// `Type.TextInstance is a subset of Type.AnyUnion([Type.TextInstance, Type.NumberInstance])` -> true
export function isSusbset(left: Type.TType, right: Type.TType): boolean | undefined {
    if (
        left.kind === Type.TypeKind.NotApplicable ||
        left.kind === Type.TypeKind.Unknown ||
        right.kind === Type.TypeKind.NotApplicable ||
        right.kind === Type.TypeKind.Unknown
    ) {
        return undefined;
    } else if (left.kind === Type.TypeKind.Null && right.kind === Type.TypeKind.AnyNonNull) {
        return false;
    }

    switch (right.kind) {
        case Type.TypeKind.Action:
        case Type.TypeKind.Binary:
        case Type.TypeKind.Date:
        case Type.TypeKind.DateTime:
        case Type.TypeKind.DateTimeZone:
        case Type.TypeKind.Duration:
        case Type.TypeKind.Function:
        case Type.TypeKind.Logical:
        case Type.TypeKind.Number:
        case Type.TypeKind.Text:
        case Type.TypeKind.Time:
            return (right.isNullable === true && left.kind === Type.TypeKind.Null) || isEqualType(left, right);

        case Type.TypeKind.List:
            return isSubsetOfList(left, right);

        case Type.TypeKind.Any:
            return isSubsetOfAny(left, right);

        case Type.TypeKind.AnyNonNull:
            return left.kind !== Type.TypeKind.Null;

        case Type.TypeKind.None:
            return false;

        case Type.TypeKind.Null:

        default:
            throw Assert.isNever(right);
    }
}

export function isSubsetOfAny(left: Type.TType, right: Type.Any | Type.AnyUnion): boolean {
    switch (right.maybeExtendedKind) {
        case undefined:
            return true;

        case Type.ExtendedTypeKind.AnyUnion:
            const anyChecks: ReadonlyArray<boolean | undefined> = right.unionedTypePairs.map((subtype: Type.TType) =>
                isSusbset(left, subtype),
            );
            return anyChecks.includes(true);

        default:
            throw Assert.isNever(right);
    }
}

export function isSubsetOfList(left: Type.TType, right: Type.TList): boolean {
    if (left.kind !== Type.TypeKind.List || (left.isNullable === true && right.isNullable === false)) {
        return false;
    }

    switch (right.maybeExtendedKind) {
        case undefined:
            return true;

        case Type.ExtendedTypeKind.GenericList:
            return isSubsetOfGenericList(left, right);

        case Type.ExtendedTypeKind.DefinedList:
            return isEqualType(left, right);

        default:
            throw Assert.isNever(right);
    }
}

export function isSubsetOfGenericList(left: Type.TType, right: Type.GenericList): boolean {
    if (left.kind !== Type.TypeKind.List || (left.isNullable === true && right.isNullable === false)) {
        return false;
    }

    switch (left.maybeExtendedKind) {
        case undefined:
            return false;

        case Type.ExtendedTypeKind.GenericList:
        case Type.ExtendedTypeKind.DefinedList:
            return isEqualType(left, right);

        default:
            throw Assert.isNever(left);
    }
}

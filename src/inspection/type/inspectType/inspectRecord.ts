// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Ast } from "../../../language";
import { NodeIdMapIterator, TXorNode, XorNodeUtils } from "../../../parser";
import { Type } from "../../../type";
import { TypeInspectionState } from "../type";
import { inspectXorNode } from "./common";

export function inspectRecord(state: TypeInspectionState, xorNode: TXorNode): Type.DefinedRecord {
    XorNodeUtils.assertAnyAstNodeKind(xorNode, [Ast.NodeKind.RecordExpression, Ast.NodeKind.RecordLiteral]);

    const fields: Map<string, Type.TType> = new Map();
    for (const keyValuePair of NodeIdMapIterator.recordKeyValuePairs(state.nodeIdMapCollection, xorNode)) {
        if (keyValuePair.maybeValue) {
            fields.set(keyValuePair.keyLiteral, inspectXorNode(state, keyValuePair.maybeValue));
        } else {
            fields.set(keyValuePair.keyLiteral, Type.UnknownInstance);
        }
    }

    return {
        kind: Type.TypeKind.Record,
        maybeExtendedKind: Type.ExtendedTypeKind.DefinedRecord,
        isNullable: false,
        fields,
        isOpen: false,
    };
}

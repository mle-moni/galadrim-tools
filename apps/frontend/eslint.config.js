//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config";

export default [
    {
        ignores: ["src/routeTree.gen.ts"],
    },
    ...tanstackConfig,
];

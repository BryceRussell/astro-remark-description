import type { Test } from 'unist-util-is';
import type { Parents } from '@types/mdast';

type ValueOfKey<T, K extends keyof T> = T[K];
type UnionOfKeyValues<T, K extends keyof T> = ValueOfKey<T, K>;

declare module 'astro-remark-description' {
  export type FileData = {
    path: string,
    cwd: string,
    frontmatter: Record<string, any> | undefined
  }

  export type Options = {
    name: string;
    override: boolean;
    skip: number;
    node: Test
    parent: UnionOfKeyValues<Parents, 'type'>;
    transform: (
      description: string,
      data: FileData
    ) => any;
    filter: (
      options: Options,
      data: FileData
    ) => Options | false | null | undefined | void 
  }

  export default function(options: Options): void;
}
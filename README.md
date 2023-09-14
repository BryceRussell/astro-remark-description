# `astro-remark-description`

Automatically add a description to the frontmatter of your markdown in Astro

## How to use

**1)** Install using the command `npm i astro-remark-description`

**2)** Add plugin to `astro.config.mjs`

```ts
import { defineConfig } from 'astro/config';
import remarkDescription from 'astro-remark-description' 

export default defineConfig({
  markdown: {
    remarkPlugins: [
      [remarkDescription, {}]
    ]
  }
});
```

## Options

### `name`

**Type**: `string`

**Default**: `'description'`

Name of key inside frontmatter

---

### `html`

**Type**: `boolean`

**Default**: `false`

Render node to a string of HTML

---

### `override`

**Type**: `boolean`

**Default**: `false`

- `true`: if frontmatter property already exists, replace it

- `false`:  if frontmatter property already exists, skip file

---

### `skip`

**Type**: `number`

**Default**: `0`

Number of nodes to skip before grabbing text

For example, if the first pragraph contains an image, use  `{ skip: 1 }` to get the text of the next paragraph

---

### `node`

**Type**: [`unist-util-is`](https://github.com/syntax-tree/unist-util-is#test) test

Tag name tests: `"blockquote" | "break" | "code" | "definition" | "delete" | "emphasis" | "footnoteDefinition" | "footnoteReference" | "heading" | "html" | "image" | "imageReference" | "inlineCode" | "link" | "linkReference" | "list" | "listItem" | "paragraph" | "strong" | "table" | "tableCell" | "tableRow" | "text" | "thematicBreak" | "yaml" | "root"`

**Default**: `'paragraph'`

A test for finding nodes when looping over markdown to get text

---

### `parent`

**Type**: `'paragraph' | 'root' | 'blockquote' | 'delete' | 'emphasis' | 'footnoteDefinition' | 'heading' | 'link' | 'linkReference' | 'list' | 'listItem' | 'strong' | 'table' | 'tableCell' | 'tableRow'`

**Default**: `'root'`

Type of the parent node

For exmaple, if the text for your description is inside a list, the parent must be `'listItem'`

---

### `transform`

Function to transfrom the description text before it is added to the frontmatter

**Type**:

```ts
type transform = (
  description: string,
  data: {
    path: string,
    cwd: string,
    frontmatter: Record<string, any> | undefined
    node: Node
  }
) => any
```

**Example 1**:

Only use the first sentence of description text

```ts
{
  transform: (desc) => desc.split('.')[0] + '.'
}
```

**Example 2**:

Capitalize all description text

```ts
{
  transform: (desc) => desc.toUpperCase()
}
```

---

### `filter`

A function to control the plugin options of each file

**Type**:

```ts
type filter = (
  options: Options,
  data: {
    path: string,
    cwd: string,
    frontmatter: Record<string, any> | undefined
  }
) => Options | false | null | undefined | void
```

**Example 1**:

Skip over any files that have `scrape: false` in the frontmatter or are located inside the "projects" collection

```ts
{
  filter: (options, { path, frontmatter }) => {
    if (!frontmatter.scrape || path.startsWith('/src/content/projects'))
      return false // Return falsey value to skip
    return options
  }
}
```

**Example 2**:

Apply an edge case to a specific file

```ts
{
  filter: (options, { path }) => {
    if (path == '/src/content/blog/post-3.md')
      options.skip = 2 // skip first 2 paragraphs
    return options
  }
}
```

## Examples

### Basic

```ts
import { defineConfig } from 'astro/config';
import remarkDescription from 'astro-remark-description' 

export default defineConfig({
  markdown: {
    remarkPlugins: [
      [remarkDescription, { name: 'excerpt' }]
    ]
  }
});
```

### Advanced

```ts
import { defineConfig } from 'astro/config';
import remarkDescription from 'astro-remark-description' 

export default defineConfig({
  markdown: {
    remarkPlugins: [
      [remarkDescription, { 
        name: 'excerpt',
        override: true,
        // Uppercase first letter in description
        transform: (desc) => desc[0].toUpperCase() + desc.slice(1)letter,
        filter: (options, { path }) => {
          // Skip file if not inside a collection
          if (!path.startsWith('/src/content'))
            return false
          // Use heading for description in 'projects' collection
          if (!path.startsWith('/src/content/projects'))
            options.node = 'heading'
          // Edge case: first paragraph is an image, use the second
          if (path === '/src/content/blog/post-3.md')
            options.skip = 1
          return options
        },
      }]
    ]
  }
});
```

### Using `remarkDirective` to target a node

```js
import { defineConfig } from 'astro/config';
import remarkDescription from 'astro-remark-description'
import remarkDirective from 'remark-directive'

export default defineConfig({
  markdown: {
    remarkPlugins: [
      remarkDirective,
      [remarkDescription, { 
        node: node => node.type === 'containerDirective' && node.name === 'description'
      }]
    ]
  }
});
```

```md
# Heading

Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sed.

:::description
Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sed.
:::
```

### Emulating other Frameworks

#### Hexo

[Post Excerpt](https://hexo.io/docs/tag-plugins#Post-Excerpt)

```js
import { defineConfig } from 'astro/config';
import remarkDescription from 'astro-remark-description'

export default defineConfig({
  markdown: {
    remarkPlugins: [
      [remarkDescription, { 
        node: (node, i, parent) => {
          const sibling = parent?.children[i + 1]
          return sibling?.type === 'html' && sibling?.value === '<!-- more -->'
        }
      }]
    ]
  }
});
```

```md
# Heading

Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sed.

Lorem, ipsum dolor sit amet consectetur adipisicing elit. Sed.

<!-- more -->
```

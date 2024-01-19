import { visit, EXIT, CONTINUE } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import { toHast } from 'mdast-util-to-hast'
import { toHtml } from "hast-util-to-html";

function formatPath(path) {
  return path.replace(/(\/\/)|(\\)/g, '/')
}

export default function(options) {
  return function (tree, file) {
    if (file === undefined) {
      return;
    }
    const cwd = formatPath(file.cwd)
    const data = {
      cwd,
      path: formatPath(file.history[0]).slice(cwd.length),
      frontmatter: file.data.astro.frontmatter
    }

    if (typeof options?.filter === 'function') options = options.filter(options, data)
    if (!options) return

    let skip = options?.skip || 0
    visit(tree, options?.node || 'paragraph', (node, index, parent) => {
      if (parent?.type !== (options?.parent || 'root')) return CONTINUE
      if (skip > 0) {
        skip--
        return CONTINUE
      }

      data.node = node

      let text = options?.html && toHtml(toHast(node)) || toString(node)
      if (typeof options?.transform === 'function') text = options.transform(text, data)

      const key = options?.name || 'description'
      options?.override
        ? file.data.astro.frontmatter[key] = text
        : file.data.astro.frontmatter[key] ??= text

      return EXIT
    })
  }
}

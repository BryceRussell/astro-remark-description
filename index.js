import { visit, EXIT, CONTINUE } from 'unist-util-visit'
import { toString } from 'mdast-util-to-string'

function formatPath(path) {
  return path.replace(/(\/\/)|(\\)/g, '/')
}

export default function(options) {
  return function (tree, file) {
    if (typeof options?.filter === 'function') {
      const cwd = formatPath(file.cwd)
      const path = formatPath(file.history[0]).slice(cwd.length)
      options = options.filter({ path, cwd, frontmatter: file.data.astro.frontmatter }, options)
    }
    if (!options) return

    let skip = options?.skip || 0
    visit(tree, options?.node || 'paragraph', (node, index, parent) => {
      if (parent.type !== (options?.parent || 'root')) return CONTINUE
      if (skip > 0) {
        skip--
        return CONTINUE
      }

      let text = toString(node)
      if (typeof options?.transform === 'function') text = options.transform(text)

      const key = options?.name || 'description'
      options?.override
        ? file.data.astro.frontmatter[key] = text
        : file.data.astro.frontmatter[key] ??= text

      return EXIT
    })
  }
}
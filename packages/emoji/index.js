const { sources, workspace } = require('coc.nvim')
const path = require('path')
const fs = require('fs')

let items = []

exports.activate = async context => {
  let file = path.resolve(__dirname, 'emoji.txt')
  if (!fs.existsSync(file)) return

  fs.readFile(file, 'utf8', (err, content) => {
    if (err) return
    let lines = content.split(/\n/).slice(0, -1)
    items = lines.map(str => {
      let parts = str.split(':')
      return { description: parts[0], character: parts[1] }
    })
  })

  let source = {
    name: 'emoji',
    triggerOnly: true,
    doComplete: async function () {
      return {
        items: items.map(o => {
          return {
            word: o.character,
            abbr: `${o.character} ${o.description}`,
            menu: this.menu,
            filterText: o.description,
          }
        })
      }
    },
    onCompleteDone: async (item, opt) => {
      let { nvim } = workspace
      let { linenr, col, input, line } = opt
      let buf = Buffer.from(line, 'utf8')
      let pre = buf.slice(0, col - 1).toString('utf8')
      let after = buf.slice(col + input.length).toString('utf8')
      await nvim.call('coc#util#setline', [linenr, `${pre}${item.word}${after}`])
      await nvim.call('cursor', [linenr, Buffer.byteLength(`${pre}${item.word}`) + 1])
    }
  }

  context.subscriptions.push(sources.createSource(source))
}

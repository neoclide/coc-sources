const { sources, workspace, SourceType } = require('coc.nvim')
const path = require('path')
const fs = require('fs')
const pify = require('pify')

exports.activate = async context => {
  let config = workspace.getConfiguration('coc.source.emoji')
  let menu = '[' + config.get('shortcut', 'EMO') + ']'
  let file = path.resolve(__dirname, 'emoji.txt')
  if (!fs.existsSync(file)) return

  let content = await pify(fs.readFile)(file, 'utf8')
  let lines = content.split(/\n/).slice(0, -1)
  let items = lines.map(str => {
    let parts = str.split(':')
    return { description: parts[0], character: parts[1] }
  })
  let { nvim } = workspace

  let source = {
    name: 'emoji',
    enable: config.get('enable', true),
    priority: config.get('priority', 1),
    filetypes: config.get('filetypes', ['markdown']),
    sourceType: SourceType.Native,
    triggerCharacters: [':'],
    doComplete: async opt => {
      if (opt.triggerCharacter != ':') return
      return {
        items: items.map(o => {
          return {
            word: o.character,
            abbr: `${o.character} ${o.description}`,
            menu,
            filterText: o.description,
          }
        })
      }
    },
    onCompleteDone: async (item, opt) => {
      if (opt.triggerCharacter != ':') return
      let { linenr, col, input, line } = opt
      let buf = Buffer.from(line, 'utf8')
      let pre = buf.slice(0, col - 1).toString('utf8')
      let after = buf.slice(col + input.length).toString('utf8')
      await nvim.call('coc#util#setline', [linenr, `${pre}${item.word}${after}`])
      await nvim.call('cursor', [linenr, Buffer.byteLength(`${pre}${item.word}`) + 1])
    }
  }

  sources.addSource(source)
  context.subscriptions.push({
    dispose: () => {
      sources.removeSource(source)
    }
  })
}

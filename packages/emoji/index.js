const {sources} = require('coc.nvim')
const fs = require('fs')
const {promisify} = require('util')

let items

exports.activate = async context => {
  const filepath = context.asAbsolutePath('emoji.txt')

  let source = {
    name: 'emoji',
    triggerOnly: true,
    doComplete: async function (opt) {
      if (!items) {
        let content = await promisify(fs.readFile)(filepath, 'utf8')
        let lines = content.split(/\n/).slice(0, -1)
        items = lines.map(str => {
          let parts = str.split(':')
          return {description: parts[0], character: parts[1]}
        })
      }

      return {
        startcol: opt.col - 1,
        items: items.map(o => {
          return {
            word: o.character,
            abbr: `${o.character} ${o.description}`,
            menu: this.menu,
            filterText: o.description,
          }
        })
      }
    }
  }
  context.subscriptions.push(sources.createSource(source))
}

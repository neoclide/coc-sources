const { sources, workspace } = require('coc.nvim')

// key values
let cache = {}

exports.activate = async context => {
  let { nvim } = workspace
  let source = {
    name: 'syntax',
    triggerCharacters: [],
    doComplete: async function (opt) {
      let words = cache[opt.filetype]
      if (!words) {
        words = await nvim.call('syntaxcomplete#OmniSyntaxList')
        cache[opt.filetype] = words
      }
      return {
        items: words.map(s => {
          return {
            word: s,
            menu: this.menu
          }
        })
      }
    }
  }

  context.subscriptions.push(sources.createSource(source))
}

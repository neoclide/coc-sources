const {sources, workspace} = require('coc.nvim')

// key values
let cache = {}

exports.activate = async context => {
  let {nvim} = workspace
  let source = {
    name: 'syntax',
    triggerCharacters: [],
    doComplete: async function (opt) {
      let words = cache[opt.filetype]
      if (!words) {
        words = await nvim.call('syntaxcomplete#OmniSyntaxList')
        // eslint-disable-next-line require-atomic-updates
        cache[opt.filetype] = words
      }
      let {input} = opt
      if (!input.length) return null
      let {firstMatch} = this
      let isUpperCase = input[0] == input[0].toUpperCase()
      if (firstMatch) {
        let first = input[0]
        words = words.filter(s => {
          return isUpperCase ? s.startsWith(first) : s.toUpperCase().startsWith(first.toUpperCase())
        })
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

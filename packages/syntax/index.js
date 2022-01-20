const {sources, workspace, window} = require('coc.nvim')

// key values
let cache = {}

exports.activate = async context => {
  let {nvim} = workspace
  let outputChannel = window.createOutputChannel('syntax');
  let source = {
    name: 'syntax',
    triggerCharacters: [],
    doComplete: async function (opt) {
      let words = cache[opt.filetype]
      if (!words) {
        try {
          words = await nvim.call('syntaxcomplete#OmniSyntaxList')
          // eslint-disable-next-line require-atomic-updates
          cache[opt.filetype] = words
        } catch (e) {
          outputChannel.append(`Error: ${e.message}`)
          return null
        }
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

const { sources, workspace, SourceType } = require('coc.nvim')
const path = require('path')
const fs = require('fs')
const pify = require('pify')

exports.activate = async context => {
  let config = workspace.getConfiguration('coc.source.word')
  let menu = '[' + config.get('shortcut', '10K') + ']'
  let file = path.resolve(__dirname, '10k.txt')
  let content = await pify(fs.readFile)(file, 'utf8')
  const words = content.split(/\n/)

  let source = {
    name: 'omni',
    enable: config.get('enable', true),
    priority: config.get('priority', 0),
    sourceType: SourceType.Native,
    filetypes: config.get('filetypes', null),
    triggerCharacters: [],
    doComplete: async opt => {
      if (!opt.input) return null
      if (!/^[A-Za-z]{1,}$/.test(opt.input)) return null
      let first = opt.input[0]
      let list = words.filter(s => s[0] == first.toLowerCase())
      let code = first.charCodeAt(0)
      let upperCase = code <= 90 && code >= 65
      return {
        items: list.map(str => {
          let word = upperCase ? str[0].toUpperCase() + str.slice(1) : str
          return {
            word,
            menu
          }
        })
      }
    }
  }

  sources.addSource(source)
  context.subscriptions.push({
    dispose: () => {
      sources.removeSource(source)
    }
  })
}

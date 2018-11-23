const { sources, workspace, SourceType } = require('coc.nvim')

function byteSlice(content, start, end) {
  let buf = Buffer.from(content, 'utf8')
  return buf.slice(start, end).toString('utf8')
}

exports.activate = context => {
  let config = workspace.getConfiguration('coc.source.omni')
  let menu = '[' + config.get('shortcut', 'O') + ']'

  function convertToItems(list, extra) {
    let res = []
    extra = extra || {}
    for (let item of list) {
      if (typeof item == 'string') {
        res.push(Object.assign({ word: item }, { menu }, extra))
      }
      if (item.hasOwnProperty('word')) {
        if (item.menu) extra.info = item.menu
        res.push(Object.assign(item, extra))
      }
    }
    return res
  }

  let source = {
    name: 'omni',
    enable: config.get('enable', true),
    priority: config.get('priority', 99),
    filetypes: config.get('filetypes', []),
    sourceType: SourceType.Remote,
    triggerCharacters: [],
    doComplete: async opt => {
      let { nvim } = workspace
      let func = await nvim.eval('&omnifunc')
      if (!func) return null
      let { line, colnr, col } = opt
      if (['LanguageClient#complete'].indexOf('func') !== -1) {
        workspace.showMessage(`omnifunc ${func} is broken, skipped!`, 'error')
        return null
      }
      let startcol = col
      try {
        startcol = await nvim.call(func, [1, ''])
        startcol = Number(startcol)
      } catch (e) {
        workspace.showMessage(`vim error from ${func} :${e.message}`, 'error')
        return null
      }
      // invalid startcol
      if (isNaN(startcol) || startcol < 0 || startcol > colnr) return null
      let text = byteSlice(line, startcol, colnr)
      let words = await nvim.call(func, [0, text])
      if (words.hasOwnProperty('words')) {
        words = words.words
      }
      let res = {
        items: convertToItems(words)
      }
      res.startcol = startcol
      return res
    }
  }

  sources.addSource(source)

  context.subscriptions.push({
    dispose: () => {
      sources.removeSource(source)
    }
  })
}

const {sources, workspace} = require('coc.nvim')

function byteSlice(content, start, end) {
  let buf = Buffer.from(content, 'utf8')
  return buf.slice(start, end).toString('utf8')
}

exports.activate = context => {
  function convertToItems(list, menu) {
    let res = []
    for (let item of list) {
      if (typeof item == 'string') {
        res.push({word: item, menu})
      }
      if (item.hasOwnProperty('word')) {
        item.menu = item.menu ? item.menu : menu
        res.push(item)
      }
    }
    return res
  }

  context.subscriptions.push(sources.createSource({
    name: 'omni',
    get triggerCharacters() {
      let config = workspace.getConfiguration('coc.source.omni')
      return config.get('triggerCharacters', null)
    },
    doComplete: async function (opt) {
      let {nvim} = workspace
      let func = await nvim.eval('&omnifunc')
      if (!func) return null
      let {line, colnr, col} = opt
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
      let text = byteSlice(line, startcol, colnr - 1)
      let [words] = await nvim.eval(`[${func}(0, '${text.replace(/'/g, "''")}'),cursor(${opt.linenr},${colnr})]`)
      await nvim.call('cursor', [opt.linenr, colnr])
      if (words.hasOwnProperty('words')) {
        words = words.words
      }
      let res = {items: convertToItems(words, this.menu)}
      res.startcol = startcol
      return res
    }
  }))
}

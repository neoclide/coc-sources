const { sources, workspace } = require('coc.nvim')

exports.activate = context => {
  let { nvim } = workspace
  let cache = {}

  async function getItems(filetype, menu) {
    let items = cache[filetype]
    if (items && items.length) return items
    items = []
    let obj = await nvim.call('neosnippet#helpers#get_completion_snippets')
    for (let key of Object.keys(obj)) {
      let val = obj[key]
      items.push({
        word: val.word,
        menu: val.menu_abbr + (menu? ` ${menu}` : ''),
        isSnippet: true
      })
    }
    cache[filetype] = items
    return items
  }

  let loadError = false
  let source = {
    name: 'neosnippet',
    triggerCharacters: [],
    doComplete: async function (opt) {
      let loaded = await nvim.getVar('loaded_neosnippet')
      if (!loaded) {
        if (!loadError) workspace.showMessage('Neosnippet not loaded', 'error')
        loadError = true
        return
      }
      let items = await getItems(opt.filetype, this.menu)
      return { items }
    },
    onCompleteDone: () => {
      nvim.eval('feedkeys("\\<Plug>(neosnippet_expand)")')
    },
    onEnter: async () => {
      let loaded = await nvim.getVar('loaded_neosnippet')
      if (loaded == 0) return
      let buftype = await nvim.eval('&buftype')
      if (buftype != '') return
      let filetype = await nvim.eval('&filetype')
      if (!filetype) return
      try {
        await getItems(filetype)
      } catch (e) {
        return
      }
    }
  }

  context.subscriptions.push(sources.createSource(source))
}

const { sources, workspace, SourceType } = require('coc.nvim')

exports.activate = context => {
  let config = workspace.getConfiguration('coc.source.neosnippet')
  let { nvim } = workspace
  let shortcut = config.get('shortcut', 'NS')
  let cache = {}

  async function getItems(filetype) {
    let items = cache[filetype]
    if (items && items.length) return items
    items = []
    let obj = await nvim.call('neosnippet#helpers#get_completion_snippets')
    for (let key of Object.keys(obj)) {
      let val = obj[key]
      items.push({
        word: val.word,
        info: val.menu_abbr,
        menu: `[${shortcut}]`,
        isSnippet: true
      })
    }
    cache[filetype] = items
    return items
  }

  let source = {
    name: 'neosnippet',
    enable: config.get('enable', true),
    priority: config.get('priority', 100),
    filetypes: config.get('filetypes', null),
    sourceType: SourceType.Remote,
    triggerCharacters: [],
    doComplete: async opt => {
      let loaded = await nvim.getVar('loaded_neosnippet')
      if (loaded == 0) {
        workspace.showMessage('Neosnippet not loaded', 'error')
        return
      }
      let items = await getItems(opt.filetype)
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

  sources.addSource(source)

  context.subscriptions.push({
    dispose: () => {
      sources.removeSource(source)
    }
  })
}

const { sources, workspace, SourceType } = require('coc.nvim')

exports.activate = context => {
  let config = workspace.getConfiguration('coc.source.neosnippet')
  let { nvim } = workspace
  let shortcut = config.get('shortcut', 'NS')
  let cache = {}

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
      let items = cache[opt.filetype]
      if (!items) return null
      return { items }
    },
    onCompleteDone: () => {
      nvim.call('neosnippet#mappings#expand_impl', [], true)
    },
    onEnter: async () => {
      let loaded = await nvim.getVar('loaded_neosnippet')
      if (loaded == 0) return
      let buftype = await nvim.eval('&buftype')
      if (buftype != '') return
      let filetype = await nvim.eval('&filetype')
      if (!filetype) return
      let items = []
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
    }
  }

  workspace.onDidOpenTextDocument(async textDocument => {
    let doc = workspace.getDocument(textDocument.uri)
    if (!doc || doc.buftype != '') return

  })

  sources.addSource(source)

  context.subscriptions.push({
    dispose: () => {
      sources.removeSource(source)
    }
  })
}

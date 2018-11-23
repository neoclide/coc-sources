const { sources, workspace, SourceType } = require('coc.nvim')

exports.activate = context => {
  let config = workspace.getConfiguration('coc.source.ultisnips')
  let { nvim } = workspace
  let shortcut = config.get('shortcut', 'US')

  let source = {
    name: 'ultisnips',
    enable: config.get('enable', true),
    priority: config.get('priority', 100),
    filetypes: config.get('filetypes', null),
    sourceType: SourceType.Remote,
    triggerCharacters: [],
    doComplete: async () => {
      let loaded = await nvim.getVar('did_plugin_ultisnips')
      if (loaded == 0) {
        workspace.showMessage('Ultisnips not loaded', 'error')
        return
      }
      let res = await nvim.call('UltiSnips#SnippetsInCurrentScope')
      let items = []
      if (Array.isArray(res)) {
        for (let item of res) {
          items.push({
            word: item.key,
            info: item.description || '',
            menu: `[${shortcut}]`,
            isSnippet: true
          })
        }
      } else {
        for (let key of Object.keys(res)) {
          items.push({
            word: key,
            info: res[key] || '',
            menu: `[${shortcut}]`,
            isSnippet: true
          })
        }
      }
      return { items }
    },
    onCompleteDone: () => {
      nvim.call('UltiSnips#ExpandSnippet', [], true)
    }
  }

  sources.addSource(source)

  context.subscriptions.push({
    dispose: () => {
      sources.removeSource(source)
    }
  })
}

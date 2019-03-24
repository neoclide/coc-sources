const { sources, workspace } = require('coc.nvim')

exports.activate = context => {
  let { nvim } = workspace

  let loadError = false
  let source = {
    name: 'ultisnips',
    triggerCharacters: [],
    doComplete: async function () {
      let loaded = await nvim.getVar('did_plugin_ultisnips')
      if (!loaded) {
        if (!loadError) workspace.showMessage('Ultisnips not loaded', 'error')
        loadError = true
        return
      }
      let res = await nvim.call('UltiSnips#SnippetsInCurrentScope')
      let items = []
      if (Array.isArray(res)) {
        for (let item of res) {
          items.push({
            word: item.key,
            info: item.description || '',
            menu: this.menu,
            isSnippet: true
          })
        }
      } else {
        for (let key of Object.keys(res)) {
          items.push({
            word: key,
            info: res[key] || '',
            menu: this.menu,
            isSnippet: true
          })
        }
      }
      return { items }
    },
    onCompleteDone: async () => {
      await nvim.eval('feedkeys("\\<C-R>=UltiSnips#ExpandSnippet()\\<CR>", "n")')
    }
  }

  context.subscriptions.push(sources.createSource(source))
}

const {sources, workspace} = require('coc.nvim')
const which = require('which')
const {spawn} = require('child_process')

exports.activate = context => {
  let config = workspace.getConfiguration('coc.source.gocode')
  let binary = config.get('gocodeBinary', '')
  if (!binary) {
    try {
      binary = which.sync('gocode')
    } catch (e) {
      workspace.showMessage('gocode binary not found!', 'error')
      return
    }
  }
  let pumevent = workspace.env.pumevent

  let source = {
    name: 'gocode',
    triggerCharacters: ['.', ':'],
    doComplete: function (opt, token) {
      let {filepath, linenr, col, input, bufnr} = opt
      let document = workspace.getDocument(bufnr)

      let menu = this.menu || ''
      if (input.length) {
        // limit result
        col = col + 1
      }
      let offset = document.getOffset(linenr, col)
      const child = spawn('gocode', ['-f=vim', 'autocomplete', filepath, `c${offset}`])
      return new Promise((resolve, reject) => {
        let output = ''
        let exited = false
        token.onCancellationRequested(() => {
          child.kill('SIGHUP')
          resolve(null)
        })
        child.stdout.on('data', data => {
          output = output + data.toString()
        })
        child.on('exit', () => {
          exited = true
          if (!output) return resolve(null)
          try {
            output = output.replace(/''/g, '\\"')
            let list = JSON.parse(output.replace(/'/g, '"'))
            if (list.length < 2) return resolve(null)
            let items = list[1]
            resolve({
              items: items.map(item => {
                item.word = item.word.replace(/\($/, '')
                if (pumevent) item.abbr = item.word
                return Object.assign({}, item, {
                  menu: item.menu ? `${item.menu} ${menu}` : menu
                })
              })
            })
          } catch (e) {
            reject(new Error('invalid output from gocode'))
          }
        })
        setTimeout(() => {
          if (!exited) {
            child.kill('SIGHUP')
            reject(new Error('gocode timeout'))
          }
        }, 2000)
        child.stdin.write(document.content, 'utf8')
        child.stdin.end()
      })
    }
  }

  context.subscriptions.push(sources.createSource(source))
}

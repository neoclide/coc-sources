const { sources, workspace, SourceType } = require('coc.nvim')
const which = require('which')
const { spawn } = require('child_process')

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

  let source = {
    name: 'gocode',
    enable: config.get('enable', true),
    priority: config.get('priority', 99),
    sourceType: SourceType.Service,
    triggerCharacters: ['.', ':'],
    doComplete: opt => {
      let { filepath, linenr, col, input, bufnr } = opt
      let document = workspace.getDocument(bufnr)

      let menu = config.get('shortcut', '')
      if (input.length) {
        // limit result
        col = col + 1
      }
      let offset = document.getOffset(linenr, col)
      const child = spawn('gocode', ['-f=vim', 'autocomplete', filepath, `c${offset}`])
      return new Promise((resolve, reject) => {
        let output = ''
        let exited = false
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
                return {
                  ...item,
                  word: item.word.replace(/\($/, ''),
                  menu: item.menu ? `${item.menu} ${menu}` : menu
                }
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

  sources.addSource(source)

  context.subscriptions.push({
    dispose: () => {
      sources.removeSource(source)
    }
  })
}

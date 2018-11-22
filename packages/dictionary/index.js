const fs = require('fs')
const pify = require('pify')
const { sources, workspace, SourceType } = require('coc.nvim')

const dicts = {}

async function getDictWords(file) {
  if (!file) return []
  let words = dicts[file] || null
  if (words && words.length) return words
  let stat = await pify(fs.stat)(file)
  if (!stat || !stat.isFile()) return []
  try {
    let content = await pify(fs.readFile)(file, 'utf8')
    words = content.split('\n')
  } catch (e) {
    // tslint:disable-next-line:no-console
    console.error(`Can't read file: ${file}`)
  }
  dicts[file] = words
  return words
}

async function getWords(files) {
  if (files.length == 0) return []
  let arr = await Promise.all(files.map(file => getDictWords(file)))
  let res = []
  for (let words of arr) {
    for (let word of words) {
      if (res.indexOf(word) === -1) {
        res.push(word)
      }
    }
  }
  return res
}

function filterWords(words, opt) {
  let res = []
  let { input } = opt
  let cword = opt.word
  if (!input.length) return []
  for (let word of words) {
    if (!word.startsWith(input[0])) continue
    if (word == cword || word == input) continue
    res.push(word)
  }
  return res
}

exports.activate = context => {
  let config = workspace.getConfiguration('coc.source.dictionary')
  let menu = '[' + config.get('shortcut', 'D') + ']'
  let { nvim } = workspace

  let source = {
    name: 'dictionary',
    enable: config.get('enable', true),
    priority: config.get('priority', 3),
    filetypes: config.get('filetypes', null),
    sourceType: SourceType.Native,
    triggerCharacters: [],
    doComplete: async opt => {
      let dictOption = await nvim.eval('&dictionary')
      if (!dictOption || !opt.input) return null
      let words = []
      if (dictOption) {
        let files = dictOption.split(',')
        words = await getWords(files)
        words = filterWords(words, opt)
      }
      return {
        items: words.map(word => {
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

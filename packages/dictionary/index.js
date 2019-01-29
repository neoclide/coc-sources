const fs = require('fs')
const readline = require('readline')
const util = require('util')
const { sources, workspace, SourceType } = require('coc.nvim')

const DICT_CACHE = {}

function readFileByLine(file, limit = 300000) {
  const set = new Set()
  const rl = readline.createInterface({
    input: fs.createReadStream(file),
    crlfDelay: Infinity,
    terminal: false,
    highWaterMark: 1024 * 1024
  })
  let n = 0
  rl.on('line', line => {
    n = n + 1
    if (n === limit) {
      rl.close()
    } else if (line.length > 0) {
      let words = line.split(/\s+/)
      for (let word of words) {
        if (word.length > 1) set.add(word)
      }
    }
  })
  return new Promise((resolve, reject) => {
    rl.on('close', () => {
      resolve(set)
    })
    rl.on('error', reject)
  })
}

async function getDictWords(file) {
  try {
    let stat = await util.promisify(fs.stat)(file)
    if (!stat || !stat.isFile()) return null
    let cache = DICT_CACHE[file]
    if (cache && cache.mtime == stat.mtime) {
      return cache.words
    }
    let words = await readFileByLine(file)
    DICT_CACHE[file] = { mtime: stat.mtime, words }
    return words
  } catch (e) {
    console.error(e)
  }
  return []
}

async function getWords(files) {
  if (files.length == 0) return []
  let arr = await Promise.all(files.map(file => getDictWords(file)))
  let res = new Set()
  for (let words of arr) {
    if (words == null) continue
    for (let word of words) {
      if (!res.has(word)) res.add(word)
    }
  }
  return Array.from(res)
}

function filterWords(words, opt) {
  let res = []
  let { input } = opt
  for (let word of words) {
    if (!word.startsWith(input[0])) continue
    if (word.length <= input.length) continue
    res.push(word)
  }
  return res
}

function loadFiles(dictionary) {
  if (!dictionary) return
  for (let file of dictionary.split(',')) {
    getDictWords(file)
  }
}

exports.activate = async context => {
  let config = workspace.getConfiguration('coc.source.dictionary')
  let menu = '[' + config.get('shortcut', 'D') + ']'
  let { nvim } = workspace
  let dictOption = await nvim.eval('&dictionary')
  if (dictOption) loadFiles(dictOption)

  workspace.onDidOpenTextDocument(async textDocment => {
    let doc = workspace.getDocument(textDocment.uri)
    if (!doc) return
    let dict = await nvim.eval('&dictionary')
    loadFiles(dict)
  })

  let source = {
    name: 'dictionary',
    enable: config.get('enable', true),
    priority: config.get('priority', 3),
    filetypes: config.get('filetypes', null),
    sourceType: SourceType.Native,
    triggerCharacters: [],
    doComplete: async opt => {
      let dictOption = await nvim.eval('&dictionary')
      if (!dictOption || opt.input.length == 0) return null
      let files = dictOption.split(',')
      let words = await getWords(files)
      words = filterWords(words, opt)
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

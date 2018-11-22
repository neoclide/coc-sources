const { sources, workspace, SourceType } = require('coc.nvim')
const path = require('path')
const fs = require('fs')
const pify = require('pify')
const readline = require('readline')

const TAG_CACHE = {}
const { nvim } = workspace

async function getTagFiles() {
  let files = await nvim.call('tagfiles')
  if (!files || files.length == 0) return []
  let cwd = await nvim.call('getcwd')
  files = files.map(f => {
    return path.isAbsolute(f) ? f : path.join(cwd, f)
  })
  let tagfiles = []
  for (let file of files) {
    let stat = await pify(fs.stat)(file)
    if (!stat || !stat.isFile()) continue
    tagfiles.push({ file, mtime: stat.mtime })
  }
  return tagfiles
}

function readFileByLine(fullpath, onLine, limit = 50000) {
  const rl = readline.createInterface({
    input: fs.createReadStream(fullpath),
    crlfDelay: Infinity,
    terminal: false,
    highWaterMark: 1024 * 1024
  })
  let n = 0
  rl.on('line', line => {
    n = n + 1
    if (n === limit) {
      rl.close()
    } else {
      onLine(line)
    }
  })
  return new Promise((resolve, reject) => {
    rl.on('close', () => {
      resolve()
    })
    rl.on('error', reject)
  })
}

async function loadTags(fullpath, mtime) {
  let item = TAG_CACHE[fullpath]
  if (item && item.mtime >= mtime) return item.words
  let words = new Set()
  await readFileByLine(fullpath, line => {
    if (line[0] == '!') return
    let ms = line.match(/^[^\t\s]+/)
    let w = ms ? ms[0] : null
    if (w && w.length > 2) words.add(w)
  })
  TAG_CACHE[fullpath] = { words, mtime }
  return words
}

exports.activate = context => {
  let config = workspace.getConfiguration('coc.source.tag')
  let menu = '[' + config.get('shortcut', 'T') + ']'

  let source = {
    name: 'tag',
    enable: config.get('enable', true),
    priority: config.get('priority', 3),
    sourceType: SourceType.Native,
    filetypes: config.get('filetypes', null),
    triggerCharacters: [],
    doComplete: async opt => {
      let { input } = opt
      if (input.length == 0) return null
      let tagfiles = await getTagFiles()
      if (!tagfiles || tagfiles.length == 0) return null
      let list = await Promise.all(tagfiles.map(o => loadTags(o.file, o.mtime)))
      let allWords = new Set()
      for (let words of list) {
        for (let word of words.values()) {
          allWords.add(word)
        }
      }
      let words = Array.from(allWords.values())
      words = words.filter(s => input[0] == s[0])
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

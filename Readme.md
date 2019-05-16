# coc-sources

Some extra completion sources of [coc.nvim](https://github.com/neoclide/coc.nvim).

Install what you need by command `:CocInstall {name}`

- coc-dictionary

  Words from files in `&dictionary`.

  ```vim
  :CocInstall coc-dictionary
  ```

- coc-tag

  Words from `tagfiles()`

  ```vim
  :CocInstall coc-tag
  ```

  **Note:** you need generate the tag files yourself.

  To get the tags of current buffer, use command `:echo tagfiles()`.

- coc-word

  Words from google 10000 english repo.

  ```vim
  :CocInstall coc-word
  ```

- coc-emoji

  Emoji words, default enabled for `markdown` file only.

  ```vim
  :CocInstall coc-emoji
  ```

  To complete emoji source, type `:` as trigger character.

  It is also possible to change the emoji trigger character by putting
  `"coc.source.emoji.triggerCharacters": ["TRIGGERCHAR"]` in your `coc-settings.json`

- coc-omni

  Completion use `&omnifunc` of current buffer.

  ```vim
  :CocInstall coc-omni
  ```

  **Note:** Using omni completion in coc.nvim is not recommended, it will block vim on
  completion.

  **Note:** You must configure `omni.filetypes` with filetypes you want omni
  source to work.

  **Don't** enable this source for filetypes that you're using language server
  for completion.

- coc-syntax

  Words from syntax list, see `:help ft-syntax-omni` in your vim.

  ```vim
  :CocInstall coc-syntax
  ```

- coc-gocode

  Completion use [gocode](https://github.com/nsf/gocode) for golang.

  ```vim
  :CocInstall coc-gocode
  ```

- coc-ultisnips

  Completion for items from [ultisnips](https://github.com/SirVer/ultisnips)

  ```vim
  :CocInstall coc-ultisnips
  ```

  ❗**Important:** this source could be block and not work when ultisnips plugin not loaded in vim.

- coc-neosnippet

  Completion for items from [neosnippet](https://github.com/Shougo/neosnippet.vim)

  ```vim
  :CocInstall coc-neosnippet
  ```

  ❗**Important:** this source could be block and not work when neosnippet plugin not loaded in vim.

## Configure

Following properties could be configured:

- `enable` set to false to disable source totally.
- `priority` priority of source.
- `shortcut` shortcut used in `menu` of completion item.
- `filetypes` enabled filetypes, enable for all filetypes when `null`.
- `disableSyntaxes` syntax names used to disable completion, ex: `['string', 'comment']`.

Install `coc-json` by `:CocInstall coc-json` and Type `coc.source` settings file
opened by `:CocConfig` to get completion for all available configurations.

## F.A.Q

**Q:** Omni completion not working.

**A:** Make sure current filetype is included in `coc.source.omni.filetypes` section of your
`coc-settings.json`, then make sure `omnifunc` is specified for current buffer
by command: `:echo &omnifunc`.

**Q:** Completion items of Ultisnips/neosnippet not shown.

**A:** It won't work when your ultisnips or neosnippet plugin not loaded. For
better experience, consider use [coc-snippets](https://github.com/neoclide/coc-snippets) instead.

## LICENSE

MIT

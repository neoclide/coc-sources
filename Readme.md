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

- coc-omni

  Completion use `&omnifunc` of current buffer.

  ```vim
  :CocInstall coc-omni
  ```

  Using omni completion in coc.nvim is not recommended, it will block vim on
  completion.

  Don't enable this source for filetypes that you're using language server for
  completion.

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

  **Note:** this source may not work when you're using lazyLoad.

- coc-neosnippet

  Completion for items from [neosnippet](https://github.com/Shougo/neosnippet.vim)

  ```vim
  :CocInstall coc-neosnippet
  ```

  **Note:** this source may not work when you're using lazyLoad.

## Configure

Following properties could be configured:

- `enable` set to false to disable source totally.
- `priority` priority of source.
- `shortcut` shortcut used in `menu` of completion item.
- `filetypes` enabled filetypes, enable for all filetypes when `null`.

Use `coc.source` in your `coc-settings.json` for available configurations.

## F.A.Q

Q: Omni completion not working.

A: Make sure current filetype is included in `coc.source.omni.filetypes` section of your
`coc-settings.json`, then make sure `omnifunc` is specified for current buffer
by command: `:echo &omnifunc`.

## LICENSE

MIT

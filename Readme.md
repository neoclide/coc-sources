# coc-sources

Some extra sources of [coc.nvim](https://github.com/neoclide/coc.nvim)

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

## Configure

Following properties could be configured:

- `enable` set to false to disable source totally.
- `priority` priority of source.
- `shortcut` shortcut used in `menu` of completion item.
- `filetypes` enabled filetypes, enable for all filetypes when `null`.

Use `coc.source` in your `coc-settings.json` for available configurations.

## LICENSE

MIT

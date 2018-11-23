# coc-omni

Omni completion plugin for [coc.nvim](https://github.com/neoclide/coc.nvim)

Using omni completion in coc.nvim is not recommended, it will block vim on
completion.

Don't enable this source for filetypes that you're using language server for
completion.

## Install

In your vim/neovim, run command:

```
:CocInstall coc-omni
```

## Configuration

- `coc.source.omni.enable` enable omni completion, default `true`.
- `coc.source.omni.priority` priority of omni source, default: `3`.
- `coc.source.omni.shortcut` shortcut of omni source, default: `"O"`.
- `coc.source.omni.filetypes` filetype list to enable omni source, default: `[]`

## F.A.Q

Q: This extension not working.

A: Make sure current filetype is included in `coc.source.omni.filetypes` section of your
`coc-settings.json`, then make sure `omnifunc` is specified for current buffer
by command: `:echo &omnifunc`.

## LICENSE

MIT

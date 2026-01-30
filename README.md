# ffd

Falconix Frontend Developer Toolkit

## screen shot

![inject](./docs/img/inject.jpg)
![token](./docs/img/token.jpg)

# how to contribute

## install

```shell
pnpm install
```

## develop

```shell
pnpm dev
```

## build

```shell
pnpm build
```

chrome load `./build` folder to launch this programe

## zip

```shell
pnpm zip
```

output zip pack to `package/` folder

# files description

- manifest.ts
  create manifest.json
- contentScript/\*.ts
  content script
- background/\*.ts
  service worker script
- popup/\*.(ts/vue)
  popup page assets

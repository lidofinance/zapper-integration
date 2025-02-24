<h1 align="center" style="border-bottom: none">
    <b>
        <a href="https://zapper.fi/">
            <img alt="Zapper Studio" width="408px" src="https://user-images.githubusercontent.com/22452366/164318940-1c49ceaf-4160-49bb-ac57-f217bce47831.png" />
        </a><br>
    </b>
</h1>

<p align="center">
    <a href="https://twitter.com/zapper_fi"><b>Twitter</b></a> •
    <a href="https://zapper.fi/discord"><b>Discord</b></a>
</p>

<div>
    <a href="https://www.npmjs.com/package/@zapper-fi/studio">
        <img src="https://img.shields.io/npm/v/@zapper-fi/studio?color=%23784FFE&style=flat-square" />
    </a>
</div>

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-6-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

## Description

Zapper Studio is a platform which enables developers in our community to integrate Web3 applications into Zapper. Integrations can support fetching tokens and contract positions, retrieving a wallet's balances, calculating TVL, and more to come in the future. These adapters enrich the Zapper API, and all of its consumers, including our own mobile and web apps.

## Requirements

Ensure the following have been installed on your system:

- Node v16.14.2 or above
- [pnpm](https://pnpm.io/)

## Getting Started

You can get started building immediately! </br>
See <a href="https://studio-docs.zapper.fi/">Zapper Studio docs</a> for more details

### Installation

```bash
$ pnpm install
```

## Running the app

```bash
$ pnpm dev
```

## Creating a new app

```bash
pnpm studio create-app
```

## Generating code template

```bash
pnpm studio codegen-app [app-id]
```

## Generating a typescript contract from an ABI

ABIs that are contained within the `contracts/abis` folder of your application can be leveraged
to quickly spin up a typescript library for interacting with a given smart contract.

You can quickly spin up a typescript library for using an ABI by running the following command:

```bash
pnpm studio generate:contract-factory [app-id]
```

## Contributing

Read our [Contribution Guide](./CONTRIBUTING.md)

### Contributing new commands

You can generate a new cli command by running the hidden command:

```
pnpm studio new:command [my-command-name]
```

## Need help ?

Join our community on <a href="https://zapper.fi/discord">Discord</a>

## License

This repository is under the [Business Source License 1.1](LICENSE)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://www.linkedin.com/in/justin-d-errico-33b76113a/"><img src="https://avatars.githubusercontent.com/u/17734052?v=4?s=64" width="64px;" alt=""/><br /><sub><b>Justin D'Errico</b></sub></a><br /><a href="https://github.com/Zapper-fi/studio/commits?author=JForsaken" title="Code">💻</a> <a href="#question-JForsaken" title="Answering Questions">💬</a> <a href="#maintenance-JForsaken" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/immasandwich"><img src="https://avatars.githubusercontent.com/u/22452366?v=4?s=64" width="64px;" alt=""/><br /><sub><b>immasandwich</b></sub></a><br /><a href="https://github.com/Zapper-fi/studio/commits?author=immasandwich" title="Code">💻</a> <a href="#question-immasandwich" title="Answering Questions">💬</a> <a href="#maintenance-immasandwich" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/wpoulin"><img src="https://avatars.githubusercontent.com/u/18474228?v=4?s=64" width="64px;" alt=""/><br /><sub><b>William Poulin</b></sub></a><br /><a href="https://github.com/Zapper-fi/studio/commits?author=wpoulin" title="Code">💻</a> <a href="#question-wpoulin" title="Answering Questions">💬</a> <a href="#maintenance-wpoulin" title="Maintenance">🚧</a></td>
    <td align="center"><a href="http://xdrdak.github.io/"><img src="https://avatars.githubusercontent.com/u/1198051?v=4?s=64" width="64px;" alt=""/><br /><sub><b>Xavier Drdak</b></sub></a><br /><a href="https://github.com/Zapper-fi/studio/commits?author=xdrdak" title="Code">💻</a> <a href="#question-xdrdak" title="Answering Questions">💬</a> <a href="#maintenance-xdrdak" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/0xMaxim"><img src="https://avatars.githubusercontent.com/u/57536175?v=4?s=64" width="64px;" alt=""/><br /><sub><b>0xMaxim</b></sub></a><br /><a href="https://github.com/Zapper-fi/studio/commits?author=0xMaxim" title="Documentation">📖</a> <a href="#question-0xMaxim" title="Answering Questions">💬</a></td>
    <td align="center"><a href="https://github.com/0xYYY"><img src="https://avatars.githubusercontent.com/u/86655648?v=4?s=64" width="64px;" alt=""/><br /><sub><b>YYY</b></sub></a><br /><a href="https://github.com/Zapper-fi/studio/issues?q=author%3A0xYYY" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

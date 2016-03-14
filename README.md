# Zombie Swarm Cli

Command line interface to [zombie swarm]().

Used to query and manipulate zombie swarms.

[![asciicast](https://asciinema.org/a/3gdyjmwyg19iflktg51l30dpw.png)](https://asciinema.org/a/3gdyjmwyg19iflktg51l30dpw)

## Install

```sh
npm install -g @zombiec0rn/zombie-swarm-cli
```

## Use

Needs to be run with `sudo` because it creates a temporary `route` to ensure multicast on correct interface.

```
sudo zombie-swarm ls --interface eth0
```

## Options

```
ls  - list swarm nodes
plan - create a plan
apply - apply a plan
```

## Changelog

### 2.1.0

* Added support for plan
* Added basic support for apply (echoing cmds)

### 2.0.0

* Initial release :tada:

enjoy.

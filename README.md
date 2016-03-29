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

## Commands

### ls

List the swarm nodes.

### plan

Create a plan.

### apply

Apply a plan.

### services

List services.

### `.zombierc`

Zombie Swarm CLI support reading a `.zombierc` file in the current directory (yml).

## Options

```
interface - the interface to query (mdns)
```

## Changelog

### 2.5.0

* New feature - support for `.zombierc` config file (yml)

### 2.4.0

* New feature `zombie-swarm services` - list swarm services :rocket:

### 2.3.0

* Support for version printing `-v` 

### 2.2.2

* Fixed use if `arr.includes` breaking plan

### 2.2.1

* Fixed plan bug where multiple id's would cause issues (modifying existing service configs)
* Fixed plan bug where current placement would be trusted even if tags have changed

### 2.2.0

* Improved plan diffing 

### 2.1.0

* Added support for plan
* Added basic support for apply (echoing cmds)

### 2.0.0

* Initial release :tada:

enjoy.

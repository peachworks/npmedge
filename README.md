# npmedge

Lists packages whose latest available version does not satisfy the specification in package.json.

Useful when your package.json contains specific versions of packages and you want to check if the specification is outdated thus discovering new versions.

Modified from https://jakut.is/git/NPMEDGE to simply display errors as opposed to throw them. This allows displaying of private repos.

This package is different from `npm outdated`.

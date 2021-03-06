const fs = require('fs')
const path = require('path')

module.exports = bundler => {
    let options

    try {
        options = require(path.resolve(__dirname, '../../../.aliasrc'))
    } catch (e) {
        // no handler
    }

    if (options) {
        let originResolver = bundler.resolver
        let originResolve = originResolver.resolve

        originResolver.resolve = (filename, parent) => {
            if (filename) {
                const result = Object.keys(options).find(key => filename.indexOf(key) !== -1)
                if (!result) {
                    filename = filename
                } else {
                    for (let name in options) {
                        let alias = options[name]

                        if (filename === name || startsWith(filename, name + '/')) {
                            if (filename !== alias && !startsWith(filename, alias + '/')) {
                                /**
                                 * compatible with new version(1.7.0)
                                 * @type {boolean}
                                 */
                                let newVersion = !!originResolver.packageCache

                                if (newVersion) {
                                    // filename = alias.replace(bundler.options.rootDir, '') + filename.substr(name.length);
                                    filename = alias + filename.substr(name.length)
                                } else {
                                    filename = alias + filename.substr(name.length)
                                }
                                if (parent) {
                                    parent = parent.replace(/\\/g, '/')
                                    // 通过绝对路径计算相对路径以兼容linux
                                    filename = './' + path
                                        .relative(parent.substr(0, parent.lastIndexOf('/')), filename)
                                        .replace(/\\/g, '/')
                                }
                            }
                        }
                    }
                }
            }

            return originResolve.call(originResolver, filename, parent)
        }
    }
}

function startsWith(string, searchString) {
    const stringLength = string.length
    const searchLength = searchString.length

    // early out if the search length is greater than the search string
    if (searchLength > stringLength) {
        return false
    }
    let index = -1
    while (++index < searchLength) {
        if (string.charCodeAt(index) !== searchString.charCodeAt(index)) {
            return false
        }
    }
    return true
}

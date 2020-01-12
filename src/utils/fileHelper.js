const fs = require('fs').promises

export const fileHelper = {
    readFile: (path, cb) => {
        return fs.readFile(path, {encoding: 'utf8'})
    },
    writeFile: (path, content, cb) => {
        return fs.writeFile(path, content, {encoding: 'utf8'})
    },
    renameFile: (path, newPath) => {
        return fs.rename(path, newPath)
    }
}

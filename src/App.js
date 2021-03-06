import React, { useState, useEffect } from 'react'
import { faPlus, faFileImport, faSave } from '@fortawesome/free-solid-svg-icons'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'
import SimpleMDE from "react-simplemde-editor"
import uuidv4 from 'uuid/v4'
import fileHelper from './utils/fileHelper'
import { objToArr, flattenArr } from './utils/helper'
import "easymde/dist/easymde.min.css";

const { join, basename, extname, dirname } = window.require('path')
const { remote, ipcRenderer } = window.require('electron')
const Store = window.require('electron-store')

const fileStore = new Store({name: 'Files Data'})
const saveFilesToStore = (files) => {
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const {id, path, title, createdAt} = file;
    result[id] = {
      id,
      path,
      title,
      createdAt
    }
    return result;
  }, {})
  fileStore.set('files', filesStoreObj)
}

function App() {
  const [ files, setFiles ] = useState(fileStore.get('files') || {})
  const [ activeFileID, setActiveFileID ] = useState('')
  const [ openedFileIDs, setOpenedFileIDs ] = useState([])
  const [ unsavedFileIDs, setUnsavedFileIDs ] = useState([])
  const [ searchedFiles, setSearchedFiles ] = useState([])
  const filesArr = objToArr(files);
  const savedLocation = remote.app.getPath('documents')

  const fileClick = (fileID) => {
    setActiveFileID(fileID)
    const currentFile = files[fileID];
    if (!currentFile.isLoaded) {
      fileHelper.readFile(currentFile.path)
        .then(value => {
          const newFile = {...files[fileID], body: value, isLoaded: true}
          setFiles({...files, [fileID]: newFile})
        })
    }

    if (!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, fileID])
    }
  }
  const tabClick = (fileId) => {
    setActiveFileID(fileId)
  }
  const tabClose = (id) => {
    const tabsWithout = openedFileIDs.filter(fileID => fileID !== id)
    setOpenedFileIDs(tabsWithout)
    if (tabsWithout.length > 0) {
      setActiveFileID(tabsWithout[0])
    } else {
      setActiveFileID('')
    }
  }
  const fileChange = (id, value) => {
    const newFile = { ...files[id], body: value }
    setFiles({...files, [id]: newFile})
    if (!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id])
    }
  }
  const deleteFile = (id) => {
    if (files[id].isNew) {
      const {[id]: value, ...afterDelete} = files;
      setFiles(afterDelete)    
    } else {
      fileHelper.defaultFiles(files[id].path)
        .then(() => {
          const {[id]: value, ...afterDelete} = files;
          setFiles(afterDelete)    
          tabClose(id)
        })
    }
  }
  const updateFileName = (id, title, isNew) => {
    const newPath = isNew ? join(savedLocation, `${title}.md`)
    : join(dirname(files[id].path), `${title}.md`)
    const modifiedFile = {...files[id], title, isNew:false, path: newPath}
    const newFiles = {...files, [id]: modifiedFile}

    if (isNew) {
      fileHelper.writeFile(newPath, files[id].body)
        .then(() => {
          setFiles(newFiles)
          saveFilesToStore(newFiles)
        })
    } else {
      const oldPath = files[id].path;
      fileHelper.renameFile(oldPath, newPath)
        .then(() => {
          setFiles(newFiles)
          saveFilesToStore(newFiles)
        })
    }
    setFiles({...files, [id]: modifiedFile})
  }
  const fileSearch = (keyword) => {
    const newFiles = filesArr.filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }
  const createNewFile = () => {
    const newId = uuidv4();
    const newFile = {
      id: newId,
      title: '',
      body: '## 请输入 Markdown',
      createdAt: new Date().getTime(),
      isNew: true,
    }
    setFiles({...files, [newId]: newFile})
  }
  const activeFile = files[activeFileID]
  const openedFiles = openedFileIDs.map(openID => {
    return files[openID]
  })
  const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArr
  const saveCurrentFile = () => {
    fileHelper.writeFile(activeFile.path, activeFile.body), activeFile.body)
      .then(() => {
        setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFile.id))
      })
  }
  const importFiles = () => {
    remote.dialog.showOpenDialog({
      title: '选择导入的 Markdown 文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        {name: 'Markdown files', extensions: ['md']}
      ]
    }, (paths) => {
      if (Array.isArray(paths)) {
        const filteredPaths = paths.filter(path => {
          const alreadyAdded = Object.values(files).find(file => {
            return file.path === path;
          })
          return !alreadyAdded;
        })
        const importFilesArr = filteredPaths.map(path => {
          return {
            id: uuidv4(),
            title: basename(path, extname(path)),
            path,
          }
        })
        const newFiles = {...files, ...flattenArr(importFilesArr)}
        setFiles(newFiles)
        saveFilesToStore(newFiles)
        if (importFilesArr.length > 0) {
          remote.dialog.showMessageBox({
            type: 'info',
            title: `成功导入了${importFiles.length}个文件`,
            message: `成功导入了${importFiles.length}个文件`
          })
        }
      }
    })
  }
  useEffect(() => {
    const callback = () => {
    }
    ipcRenderer.on('create-new-file', callback)
    return () => {
      ipcRenderer.removeListener('create-new-file', callback)
    }
  })
  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 bg-light left-panel">
          <FileSearch
            onFileSearch={fileSearch}
          />
          <FileList
            files={fileListArr}
            onFileClick={fileClick}
            onFileDelete={deleteFile}
            onSaveEdit={updateFileName}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                colorClass="btn-primary"
                icon={faPlus}
                onBtnClick={createNewFile}
              />
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
                onBtnClick={importFiles}
              />
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          {!activeFile ?
           <div className="start-page">选择或者创建新的Markdown文档</div>
           :
            <>
              <TabList
                files={openedFiles}
                activeId={activeFileID}
                unsaveIds={unsavedFileIDs}
                onTabClick={tabClick}
                onCloseTab={tabClose}
              />
              <SimpleMDE
                key={activeFile && activeFile.id}
                value={activeFile && activeFile.body}
                onChange={(value) => {fileChange(activeFile.id, value)}}
                options={{
                  minHeight: '515px'
                }}/>
              <BottomBtn
                text="保存"
                colorClass="btn-success"
                icon={faSave}
                onBtnClick={saveCurrentFile}
              />
            </>
          }
        </div>
      </div>
    </div>
  );
}

export default App;

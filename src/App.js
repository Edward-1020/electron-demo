import React, { useState } from 'react'
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import FileSearch from './components/FileSearch'
import FileList from './components/FileList'
import defaultFiles from './utils/defaultFiles'
import BottomBtn from './components/BottomBtn'
import TabList from './components/TabList'
import SimpleMDE from "react-simplemde-editor"
import uuidv4 from 'uuid/v4'
import { flattenArr, objToArr } from './utils/helper'
import "easymde/dist/easymde.min.css";

function App() {
  const [ files, setFiles ] = useState(flattenArr(defaultFiles))
  const [ activeFileID, setActiveFileID ] = useState('')
  const [ openedFileIDs, setOpenedFileIDs ] = useState([])
  const [ unsavedFileIDs, setUnsavedFileIDs ] = useState([])
  const [ searchedFiles, setSearchedFiles ] = useState([])
  const filesArr = objToArr(files);
  const fileClick = (fileID) => {
    setActiveFileID(fileID)
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
    delete files[id]
    setFiles(files)
    tabClose(id)
  }
  const updateFileName = (id, title) => {
    const modifiedFile = {...files[id], title, isNew:false }
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
                onBtnClick={() => {}}
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
            </>
          }
        </div>
      </div>
    </div>
  );
}

export default App;

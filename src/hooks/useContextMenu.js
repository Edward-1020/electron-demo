import { useEffect, useRef } from "react"
import { remote, Menu, MenuItem } from "electron"

const useContextMenu = (itemArr) => {
    let clickedElement = useRef(null)
    useEffect(() => {
        const menu = new Menu();
        itemArr.forEach(item => {
            menu.append(new MenuItem(item))
        })
        const handleContextMenu = (e) => {
            clickedElement.current = e.target
            menu.popup({window: remote.getCurrentWindow()})
        }
        window.addEventListener('contextmenu', handleContextMenu)
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu)
        }
    }, [itemArr])
    return clickedElement
}

export default useContextMenu;
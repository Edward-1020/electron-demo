import { useEffect, useRef } from "react"
import { remote, Menu, MenuItem } from "electron"

const useContextMenu = (itemArr, targetSelector, deps) => {
    let clickedElement = useRef(null)
    useEffect(() => {
        const menu = new Menu();
        itemArr.forEach(item => {
            menu.append(new MenuItem(item))
        })
        const handleContextMenu = (e) => {
            if (document.querySelector(targetSelector).contains(e.target)) {
                clickedElement.current = e.target
                menu.popup({window: remote.getCurrentWindow()})
            }
        }
        window.addEventListener('contextmenu', handleContextMenu)
        return () => {
            window.removeEventListener('contextmenu', handleContextMenu)
        }
    }, [itemArr, targetSelector])
    return clickedElement
}

export default useContextMenu;
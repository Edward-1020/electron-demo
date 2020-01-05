import { useState, useEffect } from 'react'

const useKeyPress = (targetKeyCode) => {
    const [keyPressed, setKeyPress] = useState(false)

    const keyDownHandler = ({ keyCode }) => {
        if (keyCode === targetKeyCode) {
            setKeyPress(true)
        }
    }
    const keyUpHandler = ({ keyCode }) => {
        if (keyCode === targetKeyCode) {
            setKeyPress(false)
        }
    }
    useEffect(() => {
        document.addEventListener('keydown', keyDownHandler)
        document.addEventListener('keyup', keyUpHandler)
        return () => {
            document.removeEventListener('keydown', keyDownHandler)
            document.removeEventListener('keyup', keyUpHandler)            
        }
    })
    return keyPressed
}

export default useKeyPress
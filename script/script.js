const showDiv = () => {
    let windowTask = document.querySelector('#window-task')
    let btnCloseWindow = document.querySelector('#btn-close-window')

    if(windowTask.classList.contains('exib-window')){
        windowTask.classList.remove('exib-window')
        windowTask.classList.add('ocult-window')
    }else{
        windowTask.classList.add('exib-window')
        windowTask.classList.remove('ocult-window')
    }

    //fechar quando clicar no x
    btnCloseWindow.onclick = () => {
        windowTask.classList.add('ocult-window')
        windowTask.classList.remove('exib-window')
    }
}
class Task{
    constructor(id, name, category, date, hour, desc, status = false){
        this.id = id
        this.name = name
        this.category = category
        this.date = date
        this.hour = hour
        this.desc = desc
        this.status = status
    }
    
    //validar dados do input (desconsiderando descrição e status)
    validData(){
        for(let i in this){
            if(i === 'desc' || i === 'status'){
                continue
            }
                
            if(this[i] === undefined || this[i] == '' || this[i] == null){
                return false
            } 
        }
        return true
    }

    //validar data
    static validDate(date){
        const regexDate = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

        if(!regexDate.test(date)){
            return false
        }

        return true
    }
    //formatar data
    static formatDate(date){

        if(this.validDate(date)){
            const [year, month, day] = date.split('-')
            return `${day}/${month}/${year}` 
        }else{
            return false
        }    
    }

    //controlar status (finalizado ou aberto)
    static changeStatus(id){
        let tasks = localStorage.getItem('tasks')

        if(tasks.length > 0){
            tasks = JSON.parse(tasks)
        }

        tasks.forEach((item) => {
            if(item.id == id){
                if(item.status == false){
                    item.status = true
                }else{
                    item.status = false
                }
            }
        }) 
        localStorage.setItem('tasks',JSON.stringify(tasks))  
    }
}

class Db{
    constructor(){
    }

    //recuperar todos os obj do array, e depois aplica filtro, se houver.
    getItens(filter = {}){
        //recuperar as tasks salvas
        let tasksSaved = localStorage.getItem('tasks')

        let tasks = []

        //se tiver tasks salvas, converte para array
        if(tasksSaved){
            tasks = JSON.parse(tasksSaved)
        }

        //se estiver recebendo algum filtro
        if(Object.keys(filter).length > 0){
            
            if(typeof filter.name === 'string' && filter.name.trim() !== ''){
                tasks = tasks.filter(item =>
                    item.name.toLowerCase().includes(filter.name.toLowerCase()))
            }

            if(filter.category && filter.category.trim() !== ''){
                tasks = tasks.filter(item =>
                    item.category == filter.category
                )
            }

            if(filter.date && filter.date.trim() !== ''){
                tasks = tasks.filter(item => 
                    item.date == filter.date
                )
            }

            if(filter.hour && filter.hour.trim() !== ''){
                tasks = tasks.filter(item => 
                    item.hour == filter.hour
                )
            }

            if(filter.desc && filter.desc.trim() !== ''){
                tasks = tasks.filter(item => 
                    item.desc.includes(filter.desc)
                )
            }

            if(filter.status && Array.isArray(filter.status) && filter.status.length > 0){
                tasks = tasks.filter(item => {
                    if(filter.status.includes('open') && !item.status) return true
                    if(filter.status.includes('finalized') && item.status) return true
                    return false
                })
            }
        }
        return tasks
    }

    //monta o filtro, de acordo com o que o usuario escolher filtrar
    getItensFilter(){
        let inpNameSearch = document.querySelector('#inp-name-search')
        let inpCategorySearch = document.querySelector('#inp-category-search')
        let inpDateSearch = document.querySelector('#inp-date-search')
        let inpHourSearch = document.querySelector('#inp-hour-search')
        let inpDescSearch = document.querySelector('#inp-desc-search')
        let inpTaskOpenSearch = document.querySelector('#check-task-open')
        let inpTaskFinalySearch = document.querySelector('#check-task-finaly')

        let filterUser = {}

        if(inpNameSearch.value.trim() != ''){
            filterUser.name = inpNameSearch.value.trim()
        }

        if(inpCategorySearch.value.trim() != ''){
            filterUser.category = inpCategorySearch.value.trim()
        }

        if(inpDateSearch.value.trim() != ''){
            filterUser.date = inpDateSearch.value.trim()
        }

        if(inpHourSearch.value.trim() != ''){
            filterUser.hour = inpHourSearch.value.trim()
        }

        if(inpDescSearch.value.trim() != ''){
            filterUser.desc = inpDescSearch.value.trim()
        }

        let statusArr = []
        if(inpTaskOpenSearch.checked){
            statusArr.push('open')
        }

        if(inpTaskFinalySearch.checked){
            statusArr.push('finalized')
        }
        if(statusArr.length > 0){
            filterUser.status = statusArr
        }
        return this.getItens(filterUser)
    }

    //monta o obj, e armazena no localStorage
    insertTask(){
        let inpName = document.querySelector('#inp-name')
        let inpCategory = document.querySelector('#inp-category')
        let inpDate = document.querySelector('#inp-date')
        let inpHour = document.querySelector('#inp-hour')
        let inpDesc = document.querySelector('#inp-desc')

        let id = Date.now()

        let task = new Task(id, inpName.value, inpCategory.value, inpDate.value, inpHour.value, inpDesc.value)

        let arrTasks = localStorage.getItem('tasks')
        arrTasks = arrTasks ? JSON.parse(arrTasks) : [] //se tiver item salvo, armazena na array, se não vira um array vazio

        if(task.validData()){
            if(Task.validDate(task.date)){
                arrTasks.push(task)
                localStorage.setItem('tasks', JSON.stringify(arrTasks))
                this.toast('Tarefa cadastrada com sucesso!', '#008000')
            }else{
                this.toast('Favor verificar a data preenchida!', '#FF0000')
            }
        }else{
            this.toast('Favor verificar os campos preenchidos!', '#FF0000')
        }
        this.showDisplay();

        //limpa os inputs e volta o focus no input name
        inpName.value = ''
        inpCategory.value = ''
        inpDate.value = ''
        inpHour.value = ''
        inpDesc.value = ''
        inpName.focus()
    }

    remove(id){
        let tasks = this.getItens()
        tasks = tasks.filter(v => v.id != id)  
        try{
            localStorage.setItem('tasks', JSON.stringify(tasks))
            this.toast('Tarefa excluida com sucesso!', '#008000')
        }catch(e){
            this.toast('Erro ao remover o item selecionado!','#FF0000')
        }
    }
    
    showDisplay(){
        let bodyPage = document.querySelector('#index-page')
        let consultPage = document.querySelector('#consult-page')

        //se tiver no index
        if(bodyPage){
            let tasks = this.getItens()

            //pegar o corpo da tabela e limpa
            let tableIndex = document.querySelector('#table-list-body-home')
            tableIndex.innerHTML = ''

            //exibe ou nao a tabela dependendo se tiver task
            let headerTableIndex = document.querySelector('#header-table-index')   

            if(tasks.length > 0){
                tableIndex.classList.remove('d-none')
                headerTableIndex.classList.remove('d-none')
            }else{
                tableIndex.classList.add('d-none')
                headerTableIndex.classList.add('d-none')
            }

            tasks.forEach(item => {
                //criando o (tr)
                let row = tableIndex.insertRow()

                //inserir valores, criar as colunas (td)
                row.insertCell(0).innerHTML = `${item.name}`

                //ajustar o tipo
                switch(item.category){
                    case '1':
                        item.category = 'Trabalho'
                        break
                    case '2':
                        item.category = 'Estudo'
                        break
                    case '3':
                        item.category = 'Lazer'
                        break
                    case '4':
                        item.category = 'Saude'
                        break
                    case '5':
                        item.category = 'Compras'
                        break
                    case '6':
                        item.category = 'Viagem'
                        break
                }
                row.insertCell(1).innerHTML = ` ${item.category}`
                row.insertCell(2).innerHTML = ` ${Task.formatDate(item.date)} `
                row.insertCell(3).innerHTML = ` ${item.desc}`
            })

        //se tiver na pagina de consulta
        }else if(consultPage){
            let tasks = this.getItensFilter()

            //pegar o corpo da tabela e limpa
            let tableConsult = document.querySelector('#table-list-body-consult')
            tableConsult.innerHTML = ''

            //caso o usuario tente pesquisar algo, e nao tem nada, retorna uma msg
            if(tasks.length < 1){
                this.toast('Nenhum item cadastrado!', '#FF0000')
                tableConsult.innerHTML = ''
                return
            }

            tasks.forEach(item => {
                let rowConsult = tableConsult.insertRow()

                rowConsult.insertCell(0).innerHTML = `${item.name}` 

                //ajustar o tipo
                switch(item.category){
                    case '1':
                        item.category = 'Trabalho'
                        break
                    case '2':
                        item.category = 'Estudo'
                        break
                    case '3':
                        item.category = 'Lazer'
                        break
                    case '4':
                        item.category = 'Saude'
                        break
                    case '5':
                        item.category = 'Compras'
                        break
                    case '6':
                        item.category = 'Viagem'
                        break
                }
                rowConsult.insertCell(1).innerHTML = ` ${item.category}`
                rowConsult.insertCell(2).innerHTML = ` ${Task.formatDate(item.date)} `
                
                //btn que exibe div com horario, descrição e btnExcluir
                let btnDivInfos = document.createElement('button')
                btnDivInfos.className = 'btn btn-light btn-sm'
                btnDivInfos.innerHTML = '<i class="fas fa-plus"></i>'
                btnDivInfos.onclick = () => {
                    // Chama função externa que mostra a janela
                    showDiv()
                    let tableInfo = document.querySelector('#table-list-body-info')
                    tableInfo.innerHTML = ''

                    let rowInfo = tableInfo.insertRow()
                    rowInfo.insertCell(0).innerHTML = `${item.hour}` 
                    rowInfo.insertCell(1).innerHTML = `${item.desc}` 

                    //cria o btn excluir
                    let btnEx = document.createElement('button')
                    btnEx.className = 'btn btn-danger btn-sm'
                    btnEx.innerHTML = '<i class="fas fa-times"></i>'
                    btnEx.onclick = () => {
                        this.remove(item.id)
                        if(tasks.length == 1){
                            tableConsult.innerHTML = ''
                        }else{
                            this.showDisplay()
                        }  
                        showDiv()
                    }
                    rowInfo.insertCell(2).append(btnEx)
                }
                rowConsult.insertCell(3).append(btnDivInfos)

                //verifica se esta finalizada a task para riscar a linha quando carrega a 1a vez
                if(item.status){
                    rowConsult.classList.add('through')
                }

                //cria o btn finalizar
                let btnFinaly = document.createElement('button')
                btnFinaly.className = 'btn btn-warning btn-sm'
                btnFinaly.innerHTML = '<i class="fas fa-check"></i>'

                //verifica se está finalizada a task para criar o btn correto
                if(item.status){
                    btnFinaly.className = 'btn btn-success btn-sm'
                } else {
                    btnFinaly.className = 'btn btn-warning btn-sm'
                }

                btnFinaly.onclick = () => {
                    Task.changeStatus(item.id)

                    const tasksUpdate = JSON.parse(localStorage.getItem('tasks'))
                    const currentItem = tasksUpdate.find(v => v.id == item.id )

                    if(currentItem && currentItem.status){
                        this.toast('Item finalizado!', '#008000')
                        btnFinaly.className = 'btn btn-success btn-sm'
                        rowConsult.classList.add('through')
                    }else{
                        this.toast('Item aberto!', '#ffc107')
                        btnFinaly.className = 'btn btn-warning btn-sm'
                        rowConsult.classList.remove('through')
                    }    
                }
                rowConsult.insertCell(4).append(btnFinaly)
            })
        } 
    }

    toast = (txt, color) => {
        Toastify({
            text: txt,
            duration: 2500, 
            close: true, 
            gravity: "top", 
            position: "center", 
            backgroundColor: color, 
        }).showToast();
    }
}

//instanciando o obj
const db = new Db()

//eventos

//btnCad
const indexPage = document.querySelector('#index-page')
if(indexPage){
    const btnCad = document.querySelector('#btnCad')
    if(btnCad){
        btnCad.addEventListener('click', () => db.insertTask())
    }
}

//btnSearch
const consultPage = document.querySelector('#consult-page');
if (consultPage) {
    const btnSearch = document.querySelector('#btnSearch');
    if (btnSearch) {
        btnSearch.addEventListener('click', () => db.showDisplay());
    } else {
        console.warn('Botão btnSearch não encontrado na página consult-page');
    }
}

//load table page index
const bodyPage = document.querySelector('#index-page')
if(bodyPage) db.showDisplay()
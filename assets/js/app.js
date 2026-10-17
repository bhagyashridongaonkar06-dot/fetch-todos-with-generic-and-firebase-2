const cl = console.log;

const form = document.getElementById('form')
const todo = document.getElementById('todo')
const todoList = document.getElementById('todoList')
const addTodo = document.getElementById('addTodo')
const updateTodo = document.getElementById('updateTodo')
const spinner = document.getElementById('spinner')

const base_url = `https://bhagyashri-s-first-database-default-rtdb.firebaseio.com`
const todo_url = `${base_url}/todos.json`

//local state
let state = {
    todos :[],
    updateid : null
}

//spinnerHndlr

function spinnerHndlr(){
    spinner.classList.toggle('d-none')
}

//snackbar

function snackbar(msg, icon){
    Swal.fire({
        title : msg,
        icon : icon,
        timer : 3000
    })
}

//nestedObjtoArr
function nestedObjtoArr(obj){
    for (const key in obj) {
        obj[key].id = key;
        state.todos.push(obj[key])
    }
}

//rendering 

function rendering(arr){
    let res = '';

    arr.forEach(todo => {
        res += `<li class="list-group-item d-flex justify-content-between" id="${todo.id}">
                                <h5 class="mt-2">${todo.todo}</h5>

                                <div>
                                    <button onclick="onEdit(this)" type="button" class="btn btn-sm btn-outline-primary">Edit</button>
                                    <button onclick="onRemove(this)" type="button" class="btn btn-sm btn-outline-danger">Remove</button>
                                </div>
                            </li>`
    });
    todoList.innerHTML = res
}

//generic function

function makeApiCall(url, methodName, body){
    body = body?JSON.stringify(body):null
    return fetch(url,{
        method : methodName,
        body : body,
        headers : {
            "content-type" : "application/json",
            "autho" : "JWT token"
        }
    })

    .then(res =>{
        if(!res.ok){
            throw new Error(`http : ${res.status}`)
        }
        return res.json()
    })
}

function fetchTodo(){
    spinnerHndlr();
    makeApiCall(todo_url, "GET")
    .then(data =>{
        // cl(data)
        nestedObjtoArr(data)
        rendering(state.todos)
    })
    .catch(err =>{
        cl(err)
        snackbar(err, 'error')
    })
    .finally(()=>{
        spinnerHndlr()
    })
}

fetchTodo()


//create

function onSubmit(eve){
    eve.preventDefault();

    let newtodo = {
        todo : todo.value
    }

    spinnerHndlr()
    form.reset()

    makeApiCall(todo_url, "POST", newtodo)
    .then(data =>{
        newtodo.id = data.name
        state.todos.push(newtodo)

        let li = document.createElement('li')
        li.id = newtodo.id
        li.className = `list-group-item d-flex justify-content-between`
        li.innerHTML = `
                                <h5>${newtodo.todo}</h5>

                                <div>
                                    <button onclick="onEdit(this)" type="button" class="btn btn-sm btn-outline-primary">Edit</button>
                                    <button onclick="onRemove(this)" type="button" class="btn btn-sm btn-outline-danger">Remove</button>
                                </div>
        `
        todoList.append(li)
        snackbar('new todo created successfully', 'success')
    })
    .catch(err =>{
        cl(err)
        snackbar(err, 'error')
    })
    .finally(()=>{
        spinnerHndlr()
    })
}

//edit
function onEdit(ele){
    let editId = ele.closest('li').id;
    // cl(editId)

    state.updateid = editId

    let editObj = state.todos.find(e => e.id === editId)
    // cl(editObj)

    todo.value = editObj.todo

    addTodo.classList.add('d-none')
    updateTodo.classList.remove('d-none')
}

//update
function onUpdate(){
    let updateId = state.updateid;

    let update_url = `${base_url}/todos/${updateId}.json`

    let updateObj = {
        todo : todo.value,
        id : updateId
    }
    form.reset()
    spinnerHndlr()

    makeApiCall(update_url, "PATCH", updateObj)
    .then(data =>{
        let idx = state.todos.findIndex(e => e.id === updateId)
        state.todos[idx] = updateObj

        let updUI = document.getElementById(updateId)
        updUI.querySelector('h5').innerText = updateObj.todo
        state.updateid = null

        snackbar(`todo with name ${updateObj.todo} updated successfully`, 'success')

        addTodo.classList.remove('d-none')
        updateTodo.classList.add('d-none')
    })
    .catch(err =>{
        cl(err)
        snackbar(err, 'error')
    })
    .finally(()=>{
        spinnerHndlr()
    })
}

//remove

function onRemove(ele){
    let removeId = ele.closest('li').id;
    // cl(removeId)

    
Swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!"
}).then((result) => {
  if (result.isConfirmed){
    spinnerHndlr()
    let remove_url = `${base_url}/todos${removeId}.json`

    makeApiCall(remove_url, "DELETE")

    .then(data =>{
        let idx = state.todos.findIndex(e => e.id === removeId)
        state.todos.splice(idx, 1)

        ele.closest('li').remove()
        snackbar(`todo with id ${removeId} removed successfully`, 'success')
    })
    .catch(err =>{
        cl(err)
        snackbar(err, 'error')
    })
    .finally(()=>{
        spinnerHndlr()
    })
  }
});
}


form.addEventListener('submit', onSubmit)
updateTodo.addEventListener('click', onUpdate)

function itemTemplate(item){
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
    <span class="item-text">${item.name}</span>
    <div>
      <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
      <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
  </li>`
}
//Initial page load render
let insertHTML = items.map(function(item){
    return itemTemplate(item)
}).join(' ')
document.getElementById("item-list").insertAdjacentHTML("beforeend", insertHTML)

//Create feature
let createField = document.getElementById("new-item")
document.getElementById("create-form").addEventListener("submit", function(event){
    event.preventDefault()
    axios.post('/created-item', {name: createField.value}).then(function(response){
       document.getElementById("item-list").insertAdjacentHTML("beforeend", itemTemplate(response.data))
       createField.value = ""
       createField.focus()
    }).catch(function(){
        console.log("Problem")
    })
})

document.addEventListener("click", function(event){
    //delete feature
    if(event.target.classList.contains("delete-me")){
        if(confirm("Do you really want to delete this item?")){
            axios.post('/delete-item', {id: event.target.getAttribute("data-id")}).then(function(){
                event.target.parentElement.parentElement.remove()
            }).catch(function(){
                console.log("Problem")
            })
        }
    }
    //update feature
    if(event.target.classList.contains("edit-me")){
       let userInput =  prompt("Enter new text", event.target.parentElement.parentElement.querySelector(".item-text").innerHTML)
       if(userInput){
        axios.post('/update-item', {name: userInput, id: event.target.getAttribute("data-id")}).then(function(){
            event.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput
        }).catch(function(){
            console.log("Problem")
        })
       }
    }
})
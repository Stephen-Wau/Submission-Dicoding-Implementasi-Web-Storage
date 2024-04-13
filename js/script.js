const todos = [];
const RENDER_EVENT = 'render-todo';
const SAVED_EVENT = 'saved-todo';
const STORAGE_KEY = 'TODO_APPS';

function generateId() {
  return +new Date();
}

function generateTodoObject(id, title, author, year, jenis, isComplete) {
  return {
    id,
    title,
    author,
    year,
    jenis,
    isComplete
  }
}

function findTodo(todoId) {
  for (const todoItem of todos) {
    if (todoItem.id === todoId) {
      return todoItem;
    }
  }
  return null;
}

function findTodoIndex(todoId) {
  for (const index in todos) {
    if (todos[index].id === todoId) {
      return index;
    }
  }
  return -1;
}


/**
 * @returns boolean
 */
function isStorageExist() {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(todos);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const todo of data) {
      todos.push(todo);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
}


function makeTodo(todoObject) {
  const {id, title, author, year, jenis, isComplete} = todoObject;
  
  const textTitle = document.createElement('h2');
  textTitle.innerText = title;
  
  const penulisText = document.createElement('span');
  penulisText.innerText = 'Penulis: ';

  const textAuthor = document.createElement('span');
  textAuthor.innerText = author;

  const br1 = document.createElement('br');
  
  const tahunText = document.createElement('span');
  tahunText.innerText = 'Tahun: ';
  
  const textYear = document.createElement('span');
  textYear.innerText = year;

  const br2 = document.createElement('br');

  const jenisText = document.createElement('span');
  jenisText.innerText = 'Jenis Buku: ';

  const textJenis = document.createElement('span');
  textJenis.innerText = jenis;
  
  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  
  textContainer.append(textTitle, penulisText, textAuthor, br1, tahunText, textYear, br2, jenisText, textJenis);
  
  const container = document.createElement('div');
  container.classList.add('item', 'shadow')
  container.append(textContainer);
  container.setAttribute('id', `todo-${id}`);

  const checkButton = document.createElement('button');
  checkButton.addEventListener('click', function () {
    if (!isComplete) {
      addTaskToCompleted(id);
    } else {
      undoTaskFromCompleted(id);
    }
  });

  if (isComplete) {
    const undoButton = document.createElement('button');
    undoButton.classList.add('undo-button');
    undoButton.addEventListener('click', function () {
      undoTaskFromCompleted(id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.addEventListener('click', function () {
      removeTaskFromCompleted(id);
    });

    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editButton.addEventListener('click', function () {
      editTodo(id);
    });

    container.append(undoButton, editButton, trashButton);
  } else {
    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editButton.addEventListener('click', function () {
      editTodo(id);
    });

    const checkButton = document.createElement('button');
    checkButton.classList.add('check-button');
    checkButton.addEventListener('click', function () {
      addTaskToCompleted(id);
    });

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');
    trashButton.addEventListener('click', function () {
      removeTaskFromCompleted(id);
    });

    container.append(checkButton, editButton, trashButton);
  }

  return container;
}

  function addTodo() {
    const titleTodo = document.getElementById('title').value;
    const authorTodo = document.getElementById('author').value;
    const yearTodo = parseInt(document.getElementById('year').value);
    const categoryTodo = document.getElementById('category').value;
    const isCompleteTodo = document.getElementById('isComplete').checked;

    const generatedID = generateId();
    const todoObject = generateTodoObject(generatedID,titleTodo,authorTodo,yearTodo,categoryTodo,isCompleteTodo);
    todos.push(todoObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    document.getElementById('title').value = '';
    document.getElementById('author').value = '';
    document.getElementById('year').value = '';
    document.getElementById('category').value = '';
    document.getElementById('isComplete').checked = false;
  }

  function addTaskToCompleted(todoId /* HTMLELement */) {
    const todoTarget = findTodo(todoId);

    if (todoTarget == null) return;

    todoTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  function editTodo(todoId) {
    const todoToEdit = findTodo(todoId);

    if (!todoToEdit) {
      console.error('Todo not found');
      return;
    }

    const todoIndex = todos.findIndex(todo => todo.id === todoId);

    if (todoIndex === -1) {
      console.error('Todo not found in the list');
      return;
    }

    const removedTodo = todos.splice(todoIndex, 1)[0];

    document.dispatchEvent(new Event(RENDER_EVENT));

    document.getElementById('title').value = removedTodo.title;
    document.getElementById('author').value = removedTodo.author;
    document.getElementById('year').value = removedTodo.year;
    document.getElementById('category').value = removedTodo.jenis;
    document.getElementById('isComplete').checked = removedTodo.isComplete;

    const submitButton = document.getElementById('submitButton');
    submitButton.removeEventListener('click', addTodo);
    submitButton.addEventListener('click', function () {
      editTodo(todoId);
    });
  }

  function removeTaskFromCompleted(todoId) {
    const todoTarget = findTodoIndex(todoId);
    if (todoTarget === -1) return;
    Swal.fire({
        title: "Apakah Anda yakin?",
        text: "Tugas ini akan dihapus dari daftar buku ?.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus!"
    }).then((result) => {
        if (result.isConfirmed) {
            todos.splice(todoTarget, 1);
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
            Swal.fire({
              title: "Terhapus!",
              text: "Data buku anda berhasil dihapus.",
              icon: "success"
            });
        }
    });
}

  function undoTaskFromCompleted(todoId) {

    const todoTarget = findTodo(todoId);
    if (todoTarget == null) return;

    todoTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  document.addEventListener('DOMContentLoaded', function () {

    const yearInput = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    yearInput.setAttribute('max', currentYear);

    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function (event) {
      event.preventDefault();
      Swal.fire({
        title: "Apakah anda yakin?",
        text: "Data buku akan tersimpan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Simpan!"
      }).then((result) => {
        if (result.isConfirmed) {
          addTodo();
          Swal.fire({
            title: "Tersimpan!",
            text: "Data buku anda berhasil tersimpan.",
            icon: "success"
          });
        }
      });
    });
    

    if (isStorageExist()) {
      loadDataFromStorage();
    }
  });

  document.addEventListener(SAVED_EVENT, () => {
    console.log('Data berhasil di simpan.');
  });

  document.addEventListener(RENDER_EVENT, function () {
    const uncompletedTODOList = document.getElementById('todos');
    const listCompleted = document.getElementById('completed-todos');

    // clearing list item
    uncompletedTODOList.innerHTML = '';
    listCompleted.innerHTML = '';

    let totalUncompleted = 0;
    let totalCompleted = 0;

    for (const todoItem of todos) {
      const todoElement = makeTodo(todoItem);
      if (todoItem.isComplete) {
        listCompleted.append(todoElement);
        totalCompleted++;
      } else {
        uncompletedTODOList.append(todoElement);
        totalUncompleted++;
      }
    }

    const totalBookUncompleted = document.querySelector('.total-uncompleted h2');
    const totalBookCompleted = document.querySelector('.total-completed h2');
    totalBookUncompleted.textContent = `Total buku belum selesai : ${totalUncompleted} buku`;
    totalBookCompleted.textContent = `Total buku selesai : ${totalCompleted} buku`;
  })

  document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    searchButton.addEventListener('click', function () {
      searchTodo();
    });
  });

  function searchTodo() {
    const searchTerm = document.getElementById('search').value.trim().toLowerCase();
    const filteredTodos = filterTodosBySearchTerm(searchTerm);
    renderFilteredTodos(filteredTodos);
  }

  function filterTodosBySearchTerm(searchTerm) {
    return todos.filter(todo =>
      todo.title.toLowerCase().includes(searchTerm)
    );
  }

  function renderFilteredTodos(filteredTodos) {
    const filteredTodoList = document.getElementById('filteredTodos');
    filteredTodoList.innerHTML = '';

    filteredTodos.forEach(todo => {
      const todoElement = makeTodo(todo);
      filteredTodoList.appendChild(todoElement);
    });
  }

  const removeButton = document.getElementById('removeButton');

  removeButton.addEventListener('click', function() {
      const filteredTodosDiv = document.getElementById('filteredTodos');
      filteredTodosDiv.innerHTML = '';
      const searchTerm = document.getElementById('search');
      searchTerm.value = '';
  });



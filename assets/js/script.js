// Retrieve tasks and nextId from localStorage or initialize them if not present
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  const deadlineDate = new Date(task.deadline);
  const formattedDeadline = (deadlineDate.getMonth() + 1).toString().padStart(2, '0') + '-' + deadlineDate.getDate().toString().padStart(2, '0') + '-' + deadlineDate.getFullYear();

  const today = new Date();
  const deadlineDiff = (deadlineDate - today) / (1000 * 60 * 60 * 24);

  let cardColorClass, textColor;
  if (deadlineDiff < 0) {
    cardColorClass = 'bg-danger';
    textColor = 'white';
  } else if (deadlineDiff < 2) {
    cardColorClass = 'bg-warning';
    textColor = 'white';
  } else {
    cardColorClass = 'bg-light';
    textColor = 'black'; // Set text color to black for future deadlines
  }

  return `<div class="card task-card mb-3 ${cardColorClass}" data-task-id="${task.id}">
            <div class="card-body">
              <h5 class="card-title">${task.title}</h5>
              <p class="card-text" style="color: ${textColor};">${task.description}</p> <!-- Added inline style -->
              <p class="card-text" style="color: ${textColor};">Deadline: ${formattedDeadline}</p> <!-- Added inline style -->
              <button type="button" class="btn btn-danger btn-sm delete-task" style="border-color: ${textColor};">Delete</button>
            </div>
          </div>`;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  $('#todo-cards, #in-progress-cards, #done-cards').empty();

  taskList.forEach(task => {
    const card = createTaskCard(task);
    $(`#${task.status}-cards`).append(card);
  });

  // Make all task cards draggable
  $('.task-card').draggable({
    revert: 'invalid',
    helper: 'clone',
    appendTo: 'body',
    scroll: true,
    scrollSensitivity: 100,
    cursor: 'move',
    zIndex: 1000
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const title = $('#task-title').val();
  const description = $('#task-description').val();
  const deadline = $('#task-deadline').val();
  const id = generateTaskId();

  const task = {
    id,
    title,
    description,
    deadline,
    status: 'todo'
  };

  taskList.push(task);
  saveTaskList();
  renderTaskList();
  
  // Hide the modal after saving the task
  $('#formModal').modal('hide');
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(event.target).closest('.task-card').data('task-id');
  taskList = taskList.filter(task => task.id !== taskId);
  saveTaskList();
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data('task-id');
  const newStatus = $(event.target).closest('.lane').attr('id');
  
  const taskToUpdate = taskList.find(task => task.id === taskId);
  
  if (taskToUpdate) {
    taskToUpdate.status = newStatus;
    saveTaskList();
    renderTaskList();
  }
}

// Function to save the task list to localStorage
function saveTaskList() {
  // Create a new array without the 'deadline' property
  const tasksToSave = taskList.map(({ deadline, ...task }) => task);
  
  // Save the modified task list to localStorage
  localStorage.setItem("tasks", JSON.stringify(tasksToSave));
  localStorage.setItem("nextId", nextId);
}


// When the page loads, render the task list and make cards draggable
$(document).ready(function () {
  renderTaskList();

  // Make all lanes droppable
  $('.lane').droppable({
    accept: '.task-card',
    drop: handleDrop
  });

  // Add event listener for deleting tasks
  $(document).on('click', '.delete-task', handleDeleteTask);

  // Add event listener for submitting the add task form
  $('#add-task-form').submit(handleAddTask);

  // Initialize date picker for the deadline field
  $('#task-deadline').datepicker({
    dateFormat: 'mm-dd-yy'
  });
});

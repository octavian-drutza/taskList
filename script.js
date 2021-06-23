const addBtn = document.getElementById("add-button");
const createBtn = document.getElementById("form-button-create");
const editBtn = document.getElementById("ticket-edit");
const delBtn = document.getElementById("ticket-delete");
const saveBtn = document.getElementById("form-button-save");
const modal = document.getElementById("form-container");
const form = document.getElementById("form");
const backLogColumn = document.getElementById("backlog-content");
const inDevelopmentColumn = document.getElementById("development-content");
const inTestingColumn = document.getElementById("testing-content");
const acceptedColumn = document.getElementById("accepted-content");
const inputTitle = document.getElementById("title");
const inputDevName = document.getElementById("developer");
const inputTestName = document.getElementById("tester");
const inputStatus = document.getElementById("status");
const inputDescription = document.getElementById("description");
const message = document.getElementById("message");
const messageDate = document.getElementById("date");
const clsBtn = document.getElementById("close");
const columns = document.querySelectorAll(".column-content");

let ticketList = [];
let editId;
let dragged;

/* retrieve local storage saved tickets and log */
(function populate() {
  ticketList = JSON.parse(localStorage.getItem("tickets")) || [];
  ticketList.forEach((values) => {
    addTicket(buildTicket(values), checkStatus(values.status));
  });
  if (localStorage.getItem("date")) {
    messageDate.innerText = localStorage.getItem("date");
  }
  if (localStorage.getItem("lastMessage")) {
    message.innerText = localStorage.getItem("lastMessage");
  }
})();

/* update local storage */
function updateStorage() {
  localStorage.setItem("tickets", JSON.stringify(ticketList));
}

/* get all available ID's in the ticketList */
function getIDs() {
  if (ticketList.length > 0) {
    return ticketList.reduce((acc, obj) => {
      return acc.concat(obj.id);
    }, []);
  }
  return [];
}

/* generate random ID  */
function generateID() {
  let random = 100;
  if (ticketList.length > 0) {
    let ids = getIDs();
    do {
      random = Math.floor(Math.random() * 1000);
    } while (ids.indexOf(random) >= 0);
  }
  return random;
}

/* retrieves input values */
function getValues(id) {
  let values = {};
  values.id = id;
  values.title = inputTitle.value;
  values.developer = inputDevName.value;
  values.tester = inputTestName.value;
  values.status = inputStatus.value;
  values.description = inputDescription.value;
  values.date = new Date().toString().slice(0, 25);
  return values;
}

/* find ticket type(status) */
function checkStatus(status) {
  let column;
  switch (status) {
    case "in-development":
      column = inDevelopmentColumn;
      break;
    case "in-testing":
      column = inTestingColumn;
      break;
    case "accepted":
      column = acceptedColumn;
      break;
    case "development-content":
      column = inDevelopmentColumn;
      break;
    case "testing-content":
      column = inTestingColumn;
      break;
    case "accepted-content":
      column = acceptedColumn;
      break;
    default:
      column = backLogColumn;
  }
  return column;
}

/* builds ticket */
function buildTicket(values) {
  let ticket = document.createElement("div");
  ticket.classList.add("column-ticket");
  ticket.id = values.id;
  ticket.setAttribute("draggable", "true");
  ticket.innerHTML = `
      <h4>${values.title}</h4>
      <button id="ticket-edit"><i class="far fa-edit"></i></button>
      <button id="ticket-delete"><i class="far fa-trash-alt"></i></button> 
      <div>Last Change: ${values.date}</div>`;
  setDraggable(ticket);
  return ticket;
}

/* adds ticket to DOM */
function addTicket(ticket, column) {
  column.appendChild(ticket);
}

/* adds ticket to DOM and adds the ticket values to the ticket list */
function pushTicket(ticket, column, values) {
  addTicket(ticket, column);
  addListTicket(values);
}

/* add ticket to temp list */
function addListTicket(values) {
  ticketList.push(values);
}

/* removes ticket from DOM */
function removeTicket(id) {
  let toRemove = document.getElementById(id);
  toRemove.remove();
  removeListTicket(toRemove.id);
}

/* removes ticket from temp list */
function removeListTicket(id) {
  ticketList = ticketList.filter((listTicket) => {
    return listTicket.id != id;
  });
}

/* indentify the ticket ticket */
function identifyTicket(id) {
  let toEdit = document.getElementById(id);
  let theTicket = ticketList.filter((listTicket) => {
    return listTicket.id == toEdit.id;
  });
  editId = theTicket[0].id;
  return theTicket[0];
}

/* load the ticket information from localStorage to the form */
function loadTicket(ticket) {
  createBtn.classList.add("hide");
  saveBtn.classList.remove("hide");
  modal.classList.remove("hide");
  inputTitle.value = ticket.title;
  inputDevName.value = ticket.developer;
  inputTestName.value = ticket.tester;
  inputStatus.value = ticket.status;
  inputDescription.value = ticket.description;
}

/* logs the last action in the header */
function showLastAction(action, title) {
  switch (action) {
    case "added":
      message.innerText = `Ticket "${title}" has been created:`;
      break;
    case "edited":
      message.innerText = `Ticket "${title}" has been edited:`;
      break;
    case "status":
      message.innerText = `Ticket "${title}" has changed status:`;
      break;
    case "deleted":
      message.innerText = `Ticket "${title}" has been deleted:`;
      break;
    default:
      message.innerText = "";
  }
  let date = new Date().toString().slice(0, 25);
  let lastMessage = message.innerText;
  localStorage.setItem("lastMessage", lastMessage);
  messageDate.innerText = date;
  localStorage.setItem("date", date);
}

/* make the ticket draggable, ran when ticket is created */
function setDraggable(ticket) {
  ticket.addEventListener("dragstart", (event) => {
    ticket.classList.add("dragstart");
    dragged = event.target;
    /*     console.log(event.target); */
  });
  ticket.addEventListener("dragend", (event) => {
    ticket.classList.remove("dragstart");
  });
}

/* updates status after drop of dragged element */
function updateStatus(targetColumnId) {
  switch (targetColumnId) {
    case "development-content":
      status = "in-development";
      break;
    case "testing-content":
      status = "in-testing";
      break;
    case "accepted-content":
      status = "accepted";
      break;
    case "backlog-content":
      status = "backlog";
      break;
  }
  return status;
}

/* transfer dragged ticket to target column */
function transferWithDrag(target) {
  let values = identifyTicket(dragged.id);
  let beforeStatus = values.status;
  values.status = updateStatus(target);
  if (beforeStatus != values.status) {
    showLastAction("status", values.title);
    values.date = new Date().toString().slice(0, 25);
  }
  removeTicket(dragged.id);
  pushTicket(buildTicket(values), checkStatus(values.status), values);
  updateStorage();
}

/* turn on edit modal */
function startEdit(event, target) {
  event.preventDefault();
  loadTicket(identifyTicket(target));
}

/* remove ticket */
function remove(target) {
  let id = target.id;
  showLastAction("deleted", identifyTicket(id).title);
  removeTicket(id);
}

/* event listeners */

/* close modal */
clsBtn.addEventListener("click", (event) => {
  event.preventDefault();
  modal.classList.add("hide");
});

/* add modal */
addBtn.addEventListener("click", () => {
  form.reset();
  modal.classList.remove("hide");
  saveBtn.classList.add("hide");
  createBtn.classList.remove("hide");
});

/* create button inside modal */
createBtn.addEventListener("click", (event) => {
  event.preventDefault();
  let values = getValues(generateID());
  pushTicket(buildTicket(values), checkStatus(values.status), values);
  modal.classList.add("hide");
  updateStorage();
  showLastAction("added", values.title);
});

/* save button inside modal */
saveBtn.addEventListener("click", (event) => {
  event.preventDefault();
  let values = getValues(editId);
  removeTicket(editId);
  pushTicket(buildTicket(values), checkStatus(values.status), values);
  modal.classList.add("hide");
  updateStorage();
  showLastAction("edited", values.title);
});

/* delete ticket, edit ticket buttons inside the ticket, on ticket drop events  */
columns.forEach((column) => {
  column.addEventListener("click", (event) => {
    if (event.target.id === "ticket-delete") {
      remove(event.target.parentElement);
    } else if (event.target.id === "ticket-edit") {
      startEdit(event, event.target.parentElement.id);
    } else if (event.target.className === "far fa-trash-alt") {
      remove(event.target.parentElement.parentElement);
    } else if (event.target.className === "far fa-edit") {
      startEdit(event, event.target.parentElement.parentElement.id);
    }
    updateStorage();
  });
  column.addEventListener("dragover", (event) => {
    event.preventDefault();
  });
  column.addEventListener("drop", (event) => {
    event.preventDefault();
    if (event.target.className === "column-content") {
      transferWithDrag(event.target.id);
    } else if (
      event.target.className === "column-ticket" ||
      event.target.parentElement.className === "column-ticket"
    ) {
      transferWithDrag(event.target.parentElement.id);
    }
  });
});

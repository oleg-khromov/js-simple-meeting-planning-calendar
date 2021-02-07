class Model {
  constructor() {
    //this.todos = JSON.parse(localStorage.getItem('todos')) || []
  }
}

class View  {
  constructor() {
    this.app = this.getElement('#table');
  }
}


class Controller {
  constructor(model, view) {
    this.model = model
    this.view = view
  }
}

const app = new Controller(new Model(), new View());

export const users = ["Alex", "Bob", "George", "Sara"];
export const day = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const time = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00"
];

if (!localStorage.getItem("calendar")) {
  const eventsArray = [];

  localStorage.setItem("calendar", JSON.stringify(eventsArray));
}

const db = localStorage.getItem("calendar");
let events = JSON.parse(db);

const form = document.querySelector("#createEventForm");

if (form) {
  form.addEventListener("submit", handleSubmitForm, false);
  form.addEventListener("formdata", handleFormData, false);
}

function handleSubmitForm(e) {
  // if ( e.preventDefault ) e.preventDefault();
  // e.returnValue = false;
  e.preventDefault();
  new FormData(form);
}

function handleFormData(e) {
  const data = e.formData;
  let newEvent = {};
  let flag = false;

  for (let [key, value] of data.entries()) {
    if (key === "nameEvent") {
      try {
        if (!validateField(value, 3)) {
          flag = true;
          viewAlert("Invalid field. Min length is 3 characters.");
          throw new Error("Invalid field. Min length is 3 characters.");
        }
      } catch (e) {
        console.log(e);
      }
    }

    if (key === "participants") {
      try {
        if (!validateField(value)) {
          flag = true;
          viewAlert("Invalid field. Select at least one user.");
          throw new Error("Invalid field. Select at least one user.");
        }
      } catch (e) {
        console.log(e);
      }
    }

    if (key === "day" || key === "time") {
      value = Number(value);
    }

    newEvent[key] = value;
  }

  //debugger;

  if (flag) {
    newEvent = null;
  } else {
    try {
      if (!checkBookedData(newEvent)) {
        events.push(newEvent);
        localStorage.setItem("calendar", JSON.stringify(events));
        location.href = "index.html";
      } else {
        viewAlert("Failed to create an event. Time slot is already booked.");
        throw new Error(
          "Failed to create an event. Time slot is already booked."
        );
      }
    } catch (e) {
      console.log(e);
    }
  }
}

function validateField(value, minLenght = 0) {
  return value.length > minLenght;
}

function checkBookedData(obj) {
  const { day, time } = obj;

  return events.find((item) => item.day === day && item.time === time);
}

function viewAlert(text) {
  const wrap = document.querySelector("#alerts");
  let div = document.createElement("div");
  div.className = "alert alert-danger alert-dismissible fade show";
  div.innerHTML = `
      ${text}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  wrap.prepend(div);

  const btnCloseAlert = document.querySelector(".btn-close");
  btnCloseAlert.addEventListener("click", handleDestroyAlert, false);

  setTimeout(function () {
    btnCloseAlert.click();
    btnCloseAlert.removeEventListener("click", handleDestroyAlert, false);
  }, 3000);

  function handleDestroyAlert(e) {
    const element = e.target.parentNode;
    element.classList.remove("show");
    setTimeout(() => element.remove(), 150);
  }
}

function createTable() {
  const wrapper = document.querySelector("#table");

  function createNode(tag, parent, classes) {
    let node = document.createElement(tag);

    if (classes) node.className = classes;
    parent.append(node);

    return node;
  }

  function createCells(tag, parent, row) {
    for (let col = 0; col <= day.length; col++) {
      if (tag === "th") {
        let th = createNode(tag, parent);
        th.innerHTML = col === 0 ? "Name" : day[col - 1];
      } else {
        let td = createNode(tag, parent);
        td.innerHTML = col === 0 ? time[row - 1] : null;

        if (col) {
          td.addEventListener("dragover", (e) => onDragOver(e), false);
          td.addEventListener("dragleave", (e) => onDragLeave(e), false);
          td.addEventListener("drop", (e) => onDrop(e), false);
        }
      }
    }
  }

  let table = createNode("table", wrapper, "table table-box");
  let tbody;

  for (let row = 0; row <= time.length; row++) {
    if (row === 0) {
      let thead = createNode("thead", table, "table-light");
      let tr = createNode("tr", thead);
      createCells("th", tr);
      tbody = createNode("tbody", table);
    } else {
      let tr = createNode("tr", tbody);
      createCells("td", tr, row);
    }
  }
}

if (document.querySelector("#table")) {
  createTable();
  renderEvents();
}

function createPopup() {}

createPopup.create = (e) => {
  const str = e.target.closest("td").querySelector(".event__name").innerText;
  const text = `Are you sure you want to delete <b>"${str}"</b> event?`;

  const wrap = document.querySelector("#app");
  let div = document.createElement("div");
  div.className = "modal fade";
  div.innerHTML = `
      <div class="modal__overlay"></div>
      <div class="modal__inner">
        <p class="modal__text">${text}</p>
        <div class="d-flex justify-content-between align-items-center">
          <button type="button" class="btn btn-secondary js-modal-close">No</button>
          <button type="button" class="btn btn-primary js-event-delete">Yes</button>
        </div>
      </div>
  `;

  wrap.append(div);

  const btnCloseModal = document.querySelector(".js-modal-close");
  btnCloseModal.addEventListener("click", handleCloseModal, false);

  function handleCloseModal(e) {
    const element = e.target.closest("#app").querySelector(".modal");

    element.classList.remove("show");
    element.style.display = "none";
    //element.style.display = "none";

    // setTimeout(() => {
    //   //element.classList.remove("show");
    //   //element.style.display = "none";
    // }, 0)
    setTimeout(() => element.remove(), 150);

    btnCloseModal.removeEventListener("click", handleCloseModal, false);
    btnDeleteEvent.removeEventListener("click", handleDeleteEvent, false);
  }

  const btnDeleteEvent = document.querySelector(".js-event-delete");
  btnDeleteEvent.addEventListener(
    "click",
    () => handleDeleteEvent(e, str),
    false
  );

  function DeleteEvent(str) {
    return events.filter((item) => item.nameEvent !== str);
  }

  function handleDeleteEvent(e, str) {
    events = DeleteEvent(str);
    localStorage.setItem("calendar", JSON.stringify(events));

    const element = e.target.closest("td").querySelector(".event");
    setTimeout(() => element.remove(), 150);

    handleCloseModal(e);
  }
};

function openModal(e) {
  createPopup.create(e);

  const element = e.target.closest("#app").querySelector(".modal");
  element.style.display = "block";

  setTimeout(() => {
    element.classList.add("show");
  }, 0);
}

function renderEvents(sort = "all") {
  const table = document.querySelector("#table table");

  events.map((item) => {
    const { nameEvent, participants, day, time } = item;
    const arr = participants.slice(", ");

    const event =
      sort === "all" || arr.includes(users[sort])
        ? `
      <div class="event" draggable="true" data-event-id="${day}-${time}">
        <span class="event__name">${nameEvent}</span>
        <span class="btn-close event__btn-del js-modal-open"></span>
      </div>
    `
        : null;

    const cell = +day + 1;
    const row = +time + 1;

    table.rows[row].cells[cell].innerHTML = event;
  });

  const btnOpenModal = document.querySelectorAll(".js-modal-open");

  btnOpenModal.forEach(function (btn, index) {
    btn.addEventListener("click", (e) => openModal(e), false);
  });

  const eventElement = document.querySelectorAll(".event");

  eventElement.forEach(function (element) {
    element.addEventListener("dragstart", (e) => onDragStart(e), false);
  });
}

const sort = document.querySelector("#sort");

if (sort) {
  sort.addEventListener("change", handleSortTable, false);
}

function handleSortTable(e) {
  renderEvents(e.target.value);
}

function selectCreator() {
  const selects = {
    users,
    day,
    time,
  };

  const elements = document.querySelectorAll("select[data-select-type]");

  function createOption(text, index) {
    const option = document.createElement("option");

    if (typeof index === "number") {
      option.value = index;
    } else {
      option.value = "all";
    }

    option.innerHTML = text;
    this.append(option);
  }

  if (elements.length) {
    elements.forEach((element) => {
      let type = element.dataset.selectType;

      //if (type === "participants") type = "users";

      if (type === "users" && element.id === "sort") {
        createOption.call(element, "All members");
      }

      selects[type].forEach((item, index) => {
        createOption.call(element, item, index);
      });
    });
  }
}

selectCreator();

function dropCreator() {
  const drops = {
    users,
  };

  const elements = document.querySelectorAll("[data-drop-type]");

  function createElement(text, index) {
    const node = document.createElement("div");
    node.classList.add("form-check");
    node.innerHTML = `
      <input class="form-check-input" type="checkbox" value="${index}" id="check${index}">
      <label class="form-check-label" for="check${index}">
        ${text}
      </label>
    `;
    this.append(node);
  }

  if (elements.length) {
    elements.forEach((element) => {
      let type = element.dataset.dropType;

      if (type === "participants") type = "users";

      if (drops[type]) {
        const nodeWrap = document.createElement("div");
        nodeWrap.classList.add(
          "c-drop__menu",
          "shadow",
          "bg-white",
          "rounded",
          "fade"
        );
        element.after(nodeWrap);

        drops[type].forEach((item, index) => {
          createElement.call(nodeWrap, item, index);
        });

        element.addEventListener("click", () => openDrop(nodeWrap), false);

        const checks = nodeWrap.querySelectorAll(".form-check-input");

        checks.forEach((check, index) => {
          check.addEventListener(
            "change",
            () => checkInput.call(element, drops[type][index]),
            false
          );
        });

        document.addEventListener("click", function (e) {
          if (
            !nodeWrap.contains(e.target) &&
            !nodeWrap.previousSibling.contains(e.target)
          ) {
            if (nodeWrap.classList.contains("show")) {
              nodeWrap.style.display = "none";
              nodeWrap.classList.remove("show");
            }
          }
        });
      }
    });
  }

  function checkInput(name) {
    let value = this.value;
    const arr = value ? value.split(", ") : [];

    if (arr.includes(name)) {
      arr.splice(arr.indexOf(name), 1);
    } else {
      arr.push(name);
    }

    value = arr.sort().join(", ");

    this.value = value;
  }

  function openDrop(element) {
    element.style.display = "block";

    setTimeout(() => {
      element.classList.add("show");
    }, 0);
  }
}

dropCreator();

function onDragStart(event) {
  console.log("onDragStart", event);

  event.dataTransfer.setData("text/plain", event.target.dataset.eventId);

  // event
  //   .currentTarget
  //   .style
  //   .backgroundColor = 'yellow';
}

function onDragOver(event) {
  event.preventDefault();

  event.currentTarget.style.backgroundColor = "rgba(13, 110, 253, .15)";
}

function onDragLeave(event) {
  event.preventDefault();

  event.currentTarget.style.backgroundColor = "";
}

function onDrop(event) {
  //console.log("onDrop", event);
  event.preventDefault();

  event.currentTarget.style.backgroundColor = "";

  if (!event.target.innerHTML) {
    const id = event.dataTransfer.getData("text");

    const [day, time] = id.split("-");
    const newDay = event.target.cellIndex - 1;
    const newTime = event.target.parentNode.rowIndex - 1;

    // console.log(day, time);
    // console.log(newDay, newTime);

    const draggableElement = document.querySelector(`[data-event-id="${id}"]`);
    const draggableElementParent = draggableElement.parentNode;
    draggableElementParent.innerHTML = "";
    draggableElement.dataset.eventId = `${newDay}-${newTime}`;
    //console.log("draggableElement", draggableElement);
    const dropzone = event.target;

    //console.log("dropzone", dropzone);
    dropzone.appendChild(draggableElement);

    events.map((item) => {
      if (item.day == day && item.time == time) {
        item.day = newDay;
        item.time = newTime;
      }
    });

    localStorage.setItem("calendar", JSON.stringify(events));

    event.dataTransfer.clearData();
  }
}

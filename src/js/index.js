const users = ["Alex", "Bob", "George", "Sara"];
const day = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const time = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

class Alert {
  constructor() {
    this.wrapper = document.querySelector("#alerts");
    this.wrapper.addEventListener("click", (e) => this.destroy(e), false);
  }

  render(text, type = "danger") {
    const div = document.createElement("div");
    div.className = `alert alert-${type} alert-dismissible fade show`;
    div.innerHTML = `
        ${text}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    this.wrapper.prepend(div);
  }

  show(text, type) {
    this.render(text, type);
  }

  destroy(e) {
    if (e.target || (e.target && e.target.matches(".btn-close"))) {
      const element = e.target.parentNode;
      element.classList.remove("show");
      setTimeout(() => element.remove(), 150);
    }
  }
}

class Model {
  constructor() {
    this.events = JSON.parse(localStorage.getItem("calendar")) || [];
  }

  getEvents() {
    return this.events;
  }

  _setEvents() {
    localStorage.setItem("calendar", JSON.stringify(this.events));
  }

  addEvent(event) {
    this.events.push(event);

    this._setEvents();
  }

  deleteEvent(id) {
    const [day, time] = id.split("-");
    const index = this.events.findIndex(
      (event) => event.day == day && event.time == time
    );
    if (index >= 0) this.events.splice(index, 1);

    this._setEvents();
  }

  updateEvent({ day, time, newDay, newTime }) {
    this.events.find((event) => {
      if (event.day == day && event.time == time) {
        event.day = newDay;
        event.time = newTime;
      }
    });

    this._setEvents();
  }

  checkEvent({ day, time }) {
    return this.events.find((event) => event.day == day && event.time == time);
  }
}

class View {
  constructor() {
    this.main = this.getElement("#app");
    this.app = this.getElement("#table");
    this.selects = this.getAllElements("select[data-select-type]");
    this.drops = this.getAllElements("[data-drop-type]");
    this.sort = this.getElement("select#sort");
    this.form = this.getElement("form#createEventForm");
  }

  bindShowEvents(callback) {
    this.onShowEvents = callback;
  }

  bindAddEvent(callback) {
    this.onAddEvent = callback;
  }

  bindGetEvents(callback) {
    this.onGetEvents = callback;
  }

  bindCheckEvent(callback) {
    this.onCheckEvent = callback;
  }

  getElement(selector) {
    const element = document.querySelector(selector);
    return element;
  }

  getAllElements(selector) {
    const element = document.querySelectorAll(selector);
    return element;
  }

  createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.className = className;

    return element;
  }

  createElementCells(tag, parent, row) {
    for (let col = 0; col <= day.length; col++) {
      if (tag === "th") {
        let th = this.createElement(tag);
        th.innerHTML = col === 0 ? "Name" : day[col - 1];
        parent.appendChild(th);
      } else {
        let td = this.createElement(tag);
        td.innerHTML = col === 0 ? time[row - 1] : null;
        parent.appendChild(td);
      }
    }
  }

  renderTable() {
    const table = this.createElement("table", "table table-box");
    let tbody;

    for (let row = 0; row <= time.length; row++) {
      if (row === 0) {
        let thead = this.createElement("thead", "table-light");
        table.appendChild(thead);

        let tr = this.createElement("tr");
        thead.appendChild(tr);

        this.createElementCells("th", tr);

        tbody = this.createElement("tbody");
        table.appendChild(tbody);
      } else {
        let tr = this.createElement("tr");
        tbody.appendChild(tr);

        this.createElementCells("td", tr, row);
      }
    }

    this.app.appendChild(table);
  }

  renderSelect() {
    const selects = {
      users,
      day,
      time,
    };

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

    if (this.selects.length) {
      this.selects.forEach((select) => {
        let type = select.dataset.selectType;

        if (type === "users" && select.id === "sort") {
          createOption.call(select, "All members");
        }

        selects[type].forEach((item, index) => {
          createOption.call(select, item, index);
        });
      });
    }
  }

  renderDrop() {
    const drops = {
      users,
    };

    function createElement(text, index) {
      const node = document.createElement("div");
      node.classList.add("form-check");
      node.innerHTML = `
        <input class="form-check-input" name="drop" type="checkbox" value="${index}" id="check${index}">
        <label class="form-check-label" for="check${index}">
          ${text}
        </label>
      `;
      this.append(node);
    }

    if (this.drops.length) {
      this.drops.forEach((drop) => {
        let type = drop.dataset.dropType;

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
          drop.after(nodeWrap);

          drops[type].forEach((item, index) => {
            createElement.call(nodeWrap, item, index);
          });

          drop.addEventListener("click", () => openDrop(nodeWrap), false);

          const checks = nodeWrap.querySelectorAll(".form-check-input");

          checks.forEach((check, index) => {
            check.addEventListener(
              "change",
              () => checkInput.call(drop, drops[type][index]),
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

  renderModal(e) {
    const str = e.target.closest("td").querySelector(".event__name").innerText;
    const eventId = e.target.closest("td").querySelector(".event").dataset
      .eventId;
    const text = `Are you sure you want to delete <b>"${str}"</b> event?`;

    const wrap = document.querySelector("#app");
    let div = document.createElement("div");
    div.className = "modal fade";
    div.dataset.modalEventId = eventId;
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
  }

  deleteEvent(id) {
    const element = document.querySelector(`[data-event-id=\"${id}\"]`);
    element.parentNode.innerHTML = "";
    setTimeout(() => element.remove(), 150);
  }

  closeModal(e) {
    const element = e.target.closest("#app").querySelector(".modal");

    element.classList.remove("show");
    element.style.display = "none";
    //element.style.display = "none";

    // setTimeout(() => {
    //   //element.classList.remove("show");
    //   //element.style.display = "none";
    // }, 0)
    setTimeout(() => element.remove(), 150);
  }

  showEvents(events, sort = "all") {
    const table = this.getElement("#table table");

    events.map((event) => {
      const { nameEvent, participants, day, time } = event;
      const arrParticipants = participants.slice(", ");

      const innerHTML =
        sort === "all" || arrParticipants.includes(users[sort])
          ? `
        <div class="event" draggable="true" data-event-id="${day}-${time}">
          <span class="event__name">${nameEvent}</span>
          <span class="btn-close event__btn-del js-modal-open"></span>
        </div>
      `
          : null;

      const cell = +day + 1;
      const row = +time + 1;

      table.rows[row].cells[cell].innerHTML = innerHTML;
    });
  }

  submitForm() {
    const fields = ["nameEvent", "participants", "day", "time"];
    const elements = this.form.elements;
    let newEvent = {};
    let flag = false;
    const alertMsg = new Alert();

    [...elements].forEach((field) => {
      if (fields.includes(field.name)) {
        const key = field.name;
        let value = field.value;

        if (key === "nameEvent") {
          if (!validateField(value, 3)) {
            flag = true;
            alertMsg.show("Invalid field. Min length is 3 characters.");
          }
        }

        if (key === "participants") {
          if (!validateField(value)) {
            flag = true;
            alertMsg.show("Invalid field. Select at least one user.");
          }
        }

        if (key === "day" || key === "time") {
          value = Number(value);
        }

        newEvent[key] = value;
      }
    });

    if (flag) {
      newEvent = null;
    } else {
      if (!this.onCheckEvent(newEvent)) {
        this.onAddEvent(newEvent);

        alertMsg.show("Successful created event", "success");

        setTimeout(() => {
          location.href = "index.html";
        }, 3000);
      } else {
        alertMsg.show(
          "Failed to create an event. Time slot is already booked."
        );
      }
    }

    function validateField(value, minLenght = 0) {
      return value.length > minLenght;
    }
  }

  showModal(e) {
    const element = e.target.closest("#app").querySelector(".modal");
    element.style.display = "block";

    setTimeout(() => {
      element.classList.add("show");
    }, 0);
  }

  openModal(e) {
    this.renderModal(e);
    this.showModal(e);
  }
}

class Controller {
  constructor() {
    this.model = new Model();
    this.view = new View();

    if (this.view.sort) {
      this.view.sort.addEventListener("change", this.onSortEvents.bind(this), false)
    }

    if (this.view.form) {
      this.view.form.addEventListener("submit", this.onSubmitForm.bind(this), false);
    }

    if (this.view.app) {
      this.view.app.addEventListener("dragstart", this.onDragStartEvent.bind(this), false);
      this.view.app.addEventListener("dragover", this.onDragOverEvent.bind(this), false);
      this.view.app.addEventListener("dragleave", this.onDragLeaveEvent.bind(this), false);
      this.view.app.addEventListener("drop", this.onDropEvent.bind(this), false);
      this.view.app.addEventListener("click", this.onOpenModal.bind(this), false);
      this.view.main.addEventListener("click", this.onCloseModal.bind(this), false);
    }

    this.view.bindShowEvents(this.onShowEvents.bind(this));
    this.view.bindAddEvent(this.onAddEvent.bind(this));
    this.view.bindGetEvents(this.onGetEvents.bind(this));
    this.view.bindCheckEvent(this.onCheckEvent.bind(this));
  }

  onAddEvent(event) {
    this.model.addEvent(event);
  };

  onUpdateEvent(event) {
    this.model.updateEvent(event);
  };

  onDeleteEvent(id) {
    this.model.deleteEvent(id);
    this.view.deleteEvent(id);
  };

  onGetEvents() {
    return this.model.getEvents();
  };

  onCheckEvent(event) {
    return this.model.checkEvent(event);
  };

  onOpenModal(e) {
    if (e.target && e.target.matches(".js-modal-open")) {
      this.view.openModal(e);
    }
  };

  onCloseModal(e) {
    if (e.target && e.target.matches(".js-modal-close")) {
      this.view.closeModal(e);
    }

    if (e.target && e.target.matches(".js-event-delete")) {
      const id = e.target.closest("#app").querySelector(".modal").dataset
        .modalEventId;
      this.onDeleteEvent(id);
      this.view.closeModal(e);
    }
  };

  onDragStartEvent(e) {
    if (e.target && e.target.matches(".event")) {
      e.dataTransfer.setData("text/plain", e.target.dataset.eventId);
    }
  };

  onDragOverEvent(e) {
    if (e.target && e.target.matches("td")) {
      e.preventDefault();

      if (e.target.previousSibling)
        e.target.style.backgroundColor = "rgba(13, 110, 253, .15)";
    }
  };

  onDragLeaveEvent(e) {
    if (e.target && e.target.matches("td")) {
      e.preventDefault();

      if (e.target.previousSibling) e.target.style.backgroundColor = "";
    }
  };

  onDropEvent(e) {
    if (e.target && e.target.matches("td")) {
      e.preventDefault();

      if (e.target.previousSibling) e.target.style.backgroundColor = "";

      if (!e.target.innerHTML) {
        const id = e.dataTransfer.getData("text");

        const [day, time] = id.split("-");
        const newDay = e.target.cellIndex - 1;
        const newTime = e.target.parentNode.rowIndex - 1;

        const draggableElement = document.querySelector(
          `[data-event-id="${id}"]`
        );
        const draggableElementParent = draggableElement.parentNode;
        draggableElementParent.innerHTML = "";
        draggableElement.dataset.eventId = `${newDay}-${newTime}`;

        const dropzone = e.target;
        dropzone.appendChild(draggableElement);

        this.onUpdateEvent({ day, time, newDay, newTime });

        e.dataTransfer.clearData();
      }
    }
  };

  onShowEvents(events) {
    this.view.showEvents(events);
  };

  onSortEvents(e) {
    this.view.showEvents(this.model.events, e.target.value);
  };

  onSubmitForm(e) {
    e.preventDefault();
    this.view.submitForm();
  };

  init() {
    if (this.view.app) {
      this.view.renderTable();
      this.onShowEvents(this.model.events);
    }

    if (this.view.selects) this.view.renderSelect();
    if (this.view.drops) this.view.renderDrop();
  }
}

const app = new Controller();
app.init();

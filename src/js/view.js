import { users, day, time } from "./constants";
import { Alert } from "./classes/alert";

export class View {
  constructor() {
    this.main = this.getElement("#app");
    this.app = this.getElement("#table");
    this.selects = this.getAllElements("[data-select-type]");
    this.drops = this.getAllElements("[data-drop-type]");
    this.sort = this.getElement("[data-select-sort]");
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

  createTableCells(tag, parent, row) {
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

        this.createTableCells("th", tr);

        tbody = this.createElement("tbody");
        table.appendChild(tbody);
      } else {
        let tr = this.createElement("tr");
        tbody.appendChild(tr);

        this.createTableCells("td", tr, row);
      }
    }

    this.app.appendChild(table);
  }

  createSelectOption(text, index) {
    const option = this.createElement("option");

    if (typeof index === "number") {
      option.value = index;
    } else {
      option.value = "all";
    }

    option.innerHTML = text;

    return option;
  }

  renderSelect() {
    const selects = {
      users,
      day,
      time,
    };

    if (this.selects.length) {
      this.selects.forEach((select) => {
        let type = select.dataset.selectType;
        let option;

        if (select.dataset.selectAll) {
          option = this.createSelectOption(select.dataset.selectAll);
          select.append(option);
        }

        selects[type].forEach((text, index) => {
          option = this.createSelectOption(text, index);
          select.append(option);
        });
      });
    }
  }

  createDropCheck(text, index) {
    const div = this.createElement("div");
    div.classList.add("form-check");
    div.innerHTML = `
      <input class="form-check-input" name="drop" type="checkbox" value="${index}" id="check${index}">
      <label class="form-check-label" for="check${index}">
        ${text}
      </label>
    `;

    return div;
  }

  setValueDropInput(name) {
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

  openDrop(element) {
    element.style.display = "block";
    setTimeout(() => element.classList.add("show"), 0);
  }

  renderDrop() {
    const drops = {
      users,
    };

    if (this.drops.length) {
      this.drops.forEach((drop) => {
        let type = drop.dataset.dropType;

        if (drops[type]) {
          const wrap = this.createElement("div");
          wrap.classList.add(
            "c-drop__menu",
            "shadow",
            "bg-white",
            "rounded",
            "fade"
          );
          drop.after(wrap);

          drops[type].forEach((item, index) => {
            const div = this.createDropCheck(item, index);
            wrap.append(div);
          });

          drop.addEventListener("click", () => this.openDrop(wrap), false);

          const checks = wrap.querySelectorAll(".form-check-input");

          checks.forEach((check, index) => {
            check.addEventListener(
              "change",
              () => this.setValueDropInput.call(drop, drops[type][index]),
              false
            );
          });

          document.addEventListener("click", function (e) {
            if (
              !wrap.contains(e.target) &&
              !wrap.previousSibling.contains(e.target)
            ) {
              if (wrap.classList.contains("show")) {
                wrap.classList.remove("show");
                setTimeout(() => wrap.style.display = "none", 0);
              }
            }
          });
        }
      });
    }
  }

  showEvents(events, sort = "all") {
    const table = this.getElement("#table table");

    events.map((event) => {
      const { nameEvent, day, time } = event;
      const participants = event.users.slice(", ");

      const innerHTML =
        sort === "all" || participants.includes(users[sort])
        ? `<div class="event" draggable="true" data-event-id="${day}-${time}">
            <div class="event__inner">
              <span class="event__name">${nameEvent}</span>
              <span class="btn-close event__btn-del js-modal-open"></span>
            </div>
          </div>`
        : null;

      const cell = +day + 1;
      const row = +time + 1;

      table.rows[row].cells[cell].innerHTML = innerHTML;
    });
  }

  deleteEvent(id) {
    const element = document.querySelector(`[data-event-id=\"${id}\"]`);
    element.parentNode.innerHTML = "";
    setTimeout(() => element.remove(), 150);
  }

  validateField(value, minLenght = 0) {
    return value.length > minLenght;
  }

  submitForm() {
    const fields = ["nameEvent", "users", "day", "time"];
    const elements = this.form.elements;
    let newEvent = {};
    let validFlag = false;
    const alertMsg = new Alert();

    [...elements].forEach((field) => {
      if (fields.includes(field.name)) {
        const key = field.name;
        let value = field.value;

        if (key === "nameEvent") {
          if (!this.validateField(value, 3)) {
            validFlag = true;
            alertMsg.show("Invalid field. Min length is 3 characters.");
          }
        }

        if (key === "users") {
          if (!this.validateField(value)) {
            validFlag = true;
            alertMsg.show("Invalid field. Select at least one user.");
          }
        }

        if (key === "day" || key === "time") {
          value = Number(value);
        }

        newEvent[key] = value;
      }
    });

    if (validFlag) {
      newEvent = null;
    } else {
      if (!this.onCheckEvent(newEvent)) {
        this.onAddEvent(newEvent);
        alertMsg.show("Successful created event", "success");

        setTimeout(() => location.href = "index.html", 3000);
      } else {
        alertMsg.show("Failed to create an event. Time slot is already booked.");
      }
    }
  }

  renderModal(e) {
    const str = e.target.closest("td").querySelector(".event__name").innerText;
    const eventId = e.target.closest("td").querySelector(".event").dataset
      .eventId;
    const text = `Are you sure you want to delete <b>"${str}"</b> event?`;

    const div = this.createElement("div");
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

    return div;
  }

  showModal(e) {
    const element = e.target.closest("#app").querySelector(".modal");
    element.style.display = "block";

    setTimeout(() => {
      element.classList.add("show");
    }, 0);
  }

  openModal(e) {
    const wrap = document.querySelector("#app");
    const element = this.renderModal(e);
    wrap.append(element);

    this.showModal(e);
  }

  closeModal(e) {
    const element = e.target.closest("#app").querySelector(".modal");

    element.classList.remove("show");

    setTimeout(() => element.style.zIndex = "-1", 0);
    setTimeout(() => element.remove(), 150);
  }

  DragStartEvent(e) {
    if (e.target && e.target.matches(".event")) {
      e.dataTransfer.setData("text/plain", e.target.dataset.eventId);
    }
  }

  DragOverEvent(e) {
    if (e.target && e.target.matches("td")) {
      e.preventDefault();

      if (e.target.previousSibling)
        e.target.style.backgroundColor = "rgba(13, 110, 253, .15)";
    }
  }

  DragLeaveEvent(e) {
    if (e.target && e.target.matches("td")) {
      e.preventDefault();

      if (e.target.previousSibling) e.target.style.backgroundColor = "";
    }
  }

  DropEvent(e) {
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

        e.dataTransfer.clearData();

        return { day, time, newDay, newTime };
      }
    }
  };
}
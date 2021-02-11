import { Model } from "./model";
import { View } from "./view";

export class Controller {
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
    this.view.DragStartEvent(e);
  };

  onDragOverEvent(e) {
    this.view.DragOverEvent(e);
  };

  onDragLeaveEvent(e) {
    this.view.DragLeaveEvent(e);
  };

  onDropEvent(e) {
    const event = this.view.DropEvent(e)
    this.onUpdateEvent({ ...event });
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

    if (this.view.selects) {
      this.view.renderSelect();
    }

    if (this.view.drops) {
      this.view.renderDrop();
    }
  }
}
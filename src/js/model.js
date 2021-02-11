export class Model {
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

  checkEvent({ day, time }) {
    return this.events.find((event) => event.day == day && event.time == time);
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
}
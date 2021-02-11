export class Alert {
  constructor() {
    this.wrapper = document.querySelector("#alerts");
    this.wrapper.addEventListener("click", (e) => this.destroy(e), false);
  }

  render(text, type = "danger") {
    const div = document.createElement("div");
    div.className = `alert alert-${type} alert-dismissible fade`;
    div.innerHTML = `
        ${text}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    return div;
  }

  show(text, type) {
    const element = this.render(text, type);
    this.wrapper.append(element);
    setTimeout(() => element.classList.add("show"), 150);
  }

  destroy(e) {
    if (e.target || (e.target && e.target.matches(".btn-close"))) {
      const element = e.target.parentNode;
      element.classList.remove("show");
      setTimeout(() => element.remove(), 150);
    }
  }
}
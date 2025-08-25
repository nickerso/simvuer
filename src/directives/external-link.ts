export default {
  mounted(el) {
    const href = el.getAttribute("href")
    if (href && href.startsWith("http")) {
      el.setAttribute("target", "_blank")
      el.setAttribute("rel", "noopener")

      // optional: append an icon
      const icon = document.createElement("span")
      icon.textContent = "↗"
      icon.style.marginLeft = "0.25em"
      el.appendChild(icon)
    }
  }
}

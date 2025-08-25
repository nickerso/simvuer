interface ExternalLinkElement extends HTMLElement {
  getAttribute(name: string): string | null;
  setAttribute(name: string, value: string): void;
  appendChild<T extends Node>(node: T): T;
}

interface ExternalLinkDirective {
  mounted(el: ExternalLinkElement): void;
}

const externalLinkDirective: ExternalLinkDirective = {
  mounted(el: ExternalLinkElement) {
    const href = el.getAttribute("href");
    if (href && href.startsWith("http")) {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");

      // optional: append an icon
      const icon: HTMLSpanElement = document.createElement("span");
      icon.textContent = "↗";
      icon.style.marginLeft = "0.25em";
      el.appendChild(icon);
    }
  }
};

export default externalLinkDirective;

/* CONFIGURAÇÃO: adicione apenas seus contatos reais. Campos vazios ficam inativos.
   Discord aceita um usuário ou um link HTTPS oficial do Discord. */
const CONTACTS = Object.freeze({
  github: "",
  discord: "",
  email: "",
});

(() => {
  "use strict";
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
    );

  // Tokenização de exemplos estáticos; texto do visitante nunca vira HTML.
  function highlight(code) {
    const tokens =
      /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/|<!--[^]*?-->|<\/?[\w-]+|\b(?:const|let|var|public|class|static|void|new|return|function|if|else|for|while|import|from|def|True|False|true|false|document|String|System)\b|\b\d+(?:\.\d+)?\b|\b[\w-]+(?=\s*:)|\b\w+(?=\())/g;
    let result = "",
      position = 0,
      match;
    while ((match = tokens.exec(code))) {
      result += escapeHTML(code.slice(position, match.index));
      const token = match[0];
      let type = "keyword";
      if (/^["'`]/.test(token)) type = "string";
      else if (/^(\/\/|\/\*|<!--)/.test(token)) type = "comment";
      else if (/^<\/?/.test(token)) type = "tag";
      else if (/^\d/.test(token)) type = "number";
      else if (/^\s*:/.test(code.slice(tokens.lastIndex))) type = "property";
      else if (code[tokens.lastIndex] === "(") type = "fn";
      result += `<span class="syntax-${type}">${escapeHTML(token)}</span>`;
      position = tokens.lastIndex;
    }
    return result + escapeHTML(code.slice(position));
  }

  let toastTimer;
  function toast(message) {
    const box = $("#toast");
    clearTimeout(toastTimer);
    box.textContent = message;
    box.classList.add("visible");
    toastTimer = setTimeout(() => box.classList.remove("visible"), 3000);
  }

  async function copy(text, success) {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const field = document.createElement("textarea");
        const previous = document.activeElement;
        field.value = text;
        field.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
        document.body.append(field);
        try {
          field.select();
          if (!document.execCommand("copy")) throw new Error("copy");
        } finally {
          field.remove();
          previous?.focus({ preventScroll: true });
        }
      }
      toast(success);
    } catch {
      toast("Não foi possível copiar automaticamente. Selecione e copie o contato.");
    }
  }

  window.ArthurApp = Object.freeze({
    $,
    $$,
    highlight,
    escapeHTML,
    toast,
    copy,
    contacts: CONTACTS,
    motion,
  });

  // Navegação móvel com Escape, fechamento externo e foco contido enquanto aberta.
  const header = $("#header"),
    toggle = $(".menu-toggle"),
    navigation = $("#navigation");
  function setMenu(open, returnFocus = false) {
    header.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", navigation).forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (!header.classList.contains("menu-open")) return;
    if (event.key === "Escape") {
      setMenu(false, true);
      return;
    }
    if (event.key === "Tab") {
      const items = [toggle, ...$$("a", navigation)];
      const current = items.indexOf(document.activeElement);
      const next = (current + (event.shiftKey ? -1 : 1) + items.length) % items.length;
      event.preventDefault();
      items[next].focus();
    }
  });
  window.matchMedia("(min-width: 651px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });

  // O relógio mantém o fuso brasileiro mesmo em computadores de outros países.
  const clock = $("#clock");
  const clockFormat = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  function tick() {
    const date = new Date();
    clock.textContent = clockFormat.format(date);
    clock.dateTime = date.toISOString();
  }
  tick();
  setInterval(tick, 1000);
  $("#year").textContent = new Date().getFullYear();

  // O perfil em código fica em um detalhe expansível e é renderizado por inteiro.
  const heroCode = $("#hero-code"),
    source = $("code", heroCode).textContent;
  heroCode.replaceChildren(
    ...source.split("\n").map((line, index) => {
      const row = document.createElement("span");
      row.className = "code-line";
      const number = document.createElement("span");
      number.className = "line-number";
      number.setAttribute("aria-hidden", "true");
      number.textContent = index + 1;
      const content = document.createElement("span");
      content.className = "code-content";
      content.innerHTML = highlight(line);
      row.append(number, content);
      return row;
    }),
  );

  // Os painéis são exemplos pequenos, sem níveis de conhecimento inventados.
  const technologies = {
    java: {
      title: "Java",
      category: "APLICAÇÕES E PLUGINS",
      filename: "HelloArthur.java",
      description:
        "Uso e estudo Java para aplicações e plugins de Minecraft. Tenho interesse em orientação a objetos e em APIs como Paper e Spigot.",
      tags: ["POO", "Paper API", "Spigot API"],
      code: 'public class HelloArthur {\n    public static void main(String[] args) {\n        System.out.println("Olá, mundo!");\n    }\n}',
      output: "Olá, mundo!",
    },
    javascript: {
      title: "JavaScript",
      category: "PÁGINAS INTERATIVAS",
      filename: "interface.js",
      description:
        "Uso JavaScript para adicionar interações às páginas, lidar com elementos da interface e experimentar animações. O terminal deste site funciona com ele.",
      tags: ["DOM", "Interatividade", "Web"],
      code: 'const botao = document.querySelector("button");\n\nbotao.addEventListener("click", () => {\n    console.log("Você clicou!");\n});',
      output: "Você clicou!",
    },
    python: {
      title: "Python",
      category: "SCRIPTS E AUTOMAÇÕES",
      filename: "aprender.py",
      description:
        "Estudo Python para fazer scripts, automatizar tarefas e criar ferramentas. Gosto de usar a linguagem para experimentar ideias e praticar lógica.",
      tags: ["Scripts", "Automações", "Ferramentas"],
      code: "def dobro(numero):\n    return numero * 2\n\nprint(dobro(14))",
      output: "28",
    },
    html: {
      title: "HTML5",
      category: "ESTRUTURA DE PÁGINAS",
      filename: "index.html",
      description:
        "Uso HTML para organizar o conteúdo das páginas: títulos, textos, links, formulários e seções. É a estrutura sobre a qual monto uma interface.",
      tags: ["Semântica", "Estrutura", "Acessibilidade"],
      code: '<main>\n  <section aria-label="Apresentação">\n    <h1>Arthur</h1>\n    <p>Programação e Minecraft.</p>\n  </section>\n</main>',
      output: "Título e parágrafo organizados em uma seção.",
    },
    css: {
      title: "CSS3",
      category: "LAYOUT E ESTILO",
      filename: "style.css",
      description:
        "Uso CSS para cuidar das cores, da tipografia e do layout. Também estudo como adaptar uma página para celulares e adicionar movimentos simples.",
      tags: ["Responsividade", "Animações", "Design"],
      code: ".pagina {\n  display: grid;\n  gap: 1.5rem;\n  color: #3478ff;\n  transition: transform 0.3s ease;\n}",
      output: "Um layout em grid com estilo e transição.",
    },
  };
  const tabs = $$("[data-tech]"),
    panel = $("#skill-panel");
  function selectTechnology(key, focus = false) {
    const data = technologies[key];
    if (!data) return;
    tabs.forEach((tab) => {
      const selected = tab.dataset.tech === key;
      tab.classList.toggle("selected", selected);
      tab.setAttribute("aria-selected", String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focus) tab.focus();
    });
    panel.setAttribute("aria-labelledby", "tab-" + key);
    $("#skill-title").innerHTML = escapeHTML(data.title) + '<span class="blue">.</span>';
    $("#skill-category").textContent = data.category;
    $("#skill-description").textContent = data.description;
    $("#skill-filename").textContent = data.filename;
    $("#skill-code").innerHTML = "<code>" + highlight(data.code) + "</code>";
    $("#skill-output").textContent = data.output;
    $(".skill-number").textContent =
      `{ ${String(tabs.findIndex((tab) => tab.dataset.tech === key) + 1).padStart(2, "0")} }`;
    $("#skill-tags").replaceChildren(
      ...data.tags.map((tag) => {
        const element = document.createElement("span");
        element.textContent = tag;
        return element;
      }),
    );
    panel.classList.remove("changing");
    if (!motion.matches) {
      void panel.offsetWidth;
      panel.classList.add("changing");
    }
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTechnology(tab.dataset.tech));
    tab.addEventListener("keydown", (event) => {
      let next = index;
      if (["ArrowDown", "ArrowRight"].includes(event.key)) next = (index + 1) % tabs.length;
      else if (["ArrowUp", "ArrowLeft"].includes(event.key))
        next = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTechnology(tabs[next].dataset.tech, true);
    });
  });
  const mobileTabs = window.matchMedia("(max-width: 650px)");
  function orientTabs() {
    $(".technology-list").setAttribute(
      "aria-orientation",
      mobileTabs.matches ? "horizontal" : "vertical",
    );
  }
  mobileTabs.addEventListener("change", orientTabs);
  orientTabs();
  selectTechnology("java");

  // Os canais só recebem links quando dados reais são configurados acima.
  let configured = 0;
  function configureLink(kind, value, url) {
    const item = $("#contact-" + kind);
    $(".contact-value", item).textContent = value;
    const link = document.createElement("a");
    link.className = "contact-open";
    link.href = url;
    link.setAttribute("aria-label", `Abrir ${kind === "github" ? "GitHub" : "Discord"} de Arthur`);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    item.append(link);
    item.classList.add("contact-configured");
    $(".contact-state", item).textContent = "↗";
    configured++;
  }
  if (/^https:\/\/(www\.)?github\.com\/[^\s]+$/i.test(CONTACTS.github))
    configureLink("github", CONTACTS.github.replace(/^https:\/\/(www\.)?/i, ""), CONTACTS.github);
  if (CONTACTS.discord.trim()) {
    const discord = CONTACTS.discord.trim();
    if (/^https:\/\/(discord\.gg|discord\.com|www\.discord\.com)\//i.test(discord))
      configureLink("discord", "Conversar no Discord", discord);
    else if (!discord.includes("://")) {
      const item = $("#contact-discord");
      $(".contact-value", item).textContent = discord;
      const copyButton = document.createElement("button");
      copyButton.className = "discord-copy";
      copyButton.textContent = "Copiar";
      copyButton.type = "button";
      copyButton.setAttribute("aria-label", "Copiar usuário do Discord");
      copyButton.addEventListener("click", () => copy(discord, "Usuário do Discord copiado!"));
      $(".contact-state", item).replaceWith(copyButton);
      configured++;
    }
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CONTACTS.email)) {
    const item = $("#contact-email");
    const address = document.createElement("a");
    address.href = "mailto:" + CONTACTS.email;
    address.textContent = CONTACTS.email;
    address.className = "contact-value";
    $(".contact-value", item).replaceWith(address);
    const button = $("#copy-email");
    button.disabled = false;
    button.title = "Copiar e-mail";
    button.setAttribute("aria-label", "Copiar e-mail");
    button.addEventListener("click", () => copy(CONTACTS.email, "E-mail copiado!"));
    configured++;
  }
  if (configured === 3) $(".contact-note").hidden = true;
  else if (configured > 0)
    $(".contact-note").lastChild.textContent = " Os outros contatos ainda serão adicionados.";

  // Marca a seção corrente sem sobrescrever o hash durante a leitura.
  const navLinks = $$(".nav a");
  if ("IntersectionObserver" in window) {
    const navigationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const current = link.hash === "#" + entry.target.id;
            link.classList.toggle("active", current);
            if (current) link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        });
      },
      { rootMargin: "-15% 0px -55% 0px", threshold: 0 },
    );
    $$("main section[id]").forEach((section) => navigationObserver.observe(section));
  }
})();

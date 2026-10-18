/* Terminal local simulado. Nenhum comando de sistema é executado. */
(() => {
  "use strict";
  const { $, $$, motion } = window.ArthurApp;
  const form = $("#terminal-form"),
    input = $("#terminal-input"),
    output = $("#terminal-output"),
    screen = $("#terminal-screen");
  const commandNames = [
    "help",
    "about",
    "skills",
    "minecraft",
    "java",
    "whoami",
    "contact",
    "clear",
    "arthur",
  ];
  const history = [];
  let historyIndex = 0,
    draft = "",
    pending = [],
    busy = false,
    generation = 0,
    timer;
  const responses = {
    help: "COMANDOS\n\nhelp       Ver esta lista\nabout      Sobre mim\nskills     Tecnologias que estudo\nminecraft  Plugins e servidores\njava       Meu interesse por Java\nwhoami     Nome e idade\ncontact    Ir para o contato\nclear      Limpar a tela\narthur     Um segredo\n\nUse as setas para o histórico e Tab para completar.",
    about:
      "Sou o Arthur e tenho 14 anos.\n\nEstudo Java, JavaScript, Python, HTML e CSS. Gosto de programação e da parte técnica do Minecraft: plugins, configurações e sistemas de servidores. Também tenho interesse em sites, automações e segurança.",
    skills:
      "Java        Aplicações e plugins Minecraft\nJavaScript  Interações em páginas web\nPython      Scripts e automações\nHTML5       Estrutura de páginas\nCSS3        Layout e estilo\n\nTambém estudo Paper API e Spigot API.",
    minecraft:
      "Gosto de mexer com a parte técnica dos servidores.\n\nMe interesso por plugins em Java, Paper API, Spigot API, configurações e sistemas personalizados. Também quero aprender mais sobre otimização, segurança e administração de servidores.",
    java: 'Estudo Java para criar aplicações e plugins de Minecraft.\n\nQuero aprender mais sobre orientação a objetos e as APIs Paper e Spigot.\n\nSystem.out.println("Olá, mundo!");',
    whoami:
      "Nome:    Arthur\nIdade:   14 anos\nEstudo:  Java, JavaScript, Python, HTML e CSS\nGosto:   Programação e Minecraft",
    contact:
      "Indo para a seção de contato.\nOs canais que ainda não têm dados aparecem como não adicionados.",
    arthur:
      "Você encontrou o segredo!\n\nArthur.dev — O futuro está sendo programado.\n\nwhile (learning) { improve(); }",
  };
  function scrollBottom() {
    screen.scrollTop = screen.scrollHeight;
  }
  function echo(command) {
    const row = document.createElement("div");
    row.className = "terminal-command";
    const prompt = document.createElement("span");
    prompt.className = "prompt";
    prompt.textContent = "arthur@portfolio:~$ ";
    row.append(prompt, document.createTextNode(command));
    output.append(row);
  }
  function pruneOutput() {
    while (output.childElementCount > 100) output.firstElementChild.remove();
  }
  function clearTerminal() {
    generation++;
    clearTimeout(timer);
    pending = [];
    busy = false;
    output.replaceChildren();
    screen.classList.remove("secret-found");
    scrollBottom();
  }
  function writeResponse(element, text, done) {
    if (motion.matches || document.hidden) {
      element.textContent = text;
      scrollBottom();
      done();
      return;
    }
    const thisGeneration = generation;
    const body = document.createTextNode("");
    const cursor = document.createElement("span");
    cursor.className = "terminal-loading";
    cursor.setAttribute("aria-hidden", "true");
    element.append(body, cursor);
    // A região só anuncia a resposta completa, sem soletrar cada atualização.
    element.setAttribute("aria-hidden", "true");
    let position = 0;
    function step() {
      if (thisGeneration !== generation) return;
      position = motion.matches ? text.length : Math.min(text.length, position + 18);
      body.textContent = text.slice(0, position);
      scrollBottom();
      if (position < text.length) timer = setTimeout(step, 14);
      else {
        element.removeAttribute("aria-hidden");
        element.replaceChildren(document.createTextNode(text));
        done();
      }
    }
    step();
  }
  function runNext() {
    if (busy || !pending.length) return;
    busy = true;
    const command = pending.shift(),
      key = command.toLowerCase();
    echo(command);
    const response = document.createElement("div");
    response.className = "terminal-response";
    const exists = Object.hasOwn(responses, key);
    let text = exists
      ? responses[key]
      : `Comando não encontrado: ${command}\nDigite help para ver as opções disponíveis.`;
    if (!exists) response.classList.add("error");
    if (key === "arthur") response.classList.add("easter-egg");
    output.append(response);
    pruneOutput();
    writeResponse(response, text, () => {
      if (key === "contact") {
        const target = $("#contact-title");
        target.tabIndex = -1;
        target.focus({ preventScroll: true });
        $("#contato").scrollIntoView({
          behavior: motion.matches ? "auto" : "smooth",
          block: "start",
        });
      }
      busy = false;
      runNext();
    });
  }
  function submit(value, focus = true) {
    const command = value.trim().slice(0, 120);
    if (!command) {
      if (focus) input.focus({ preventScroll: true });
      return;
    }
    if (history[history.length - 1] !== command) history.push(command);
    if (history.length > 100) history.shift();
    historyIndex = history.length;
    draft = "";
    input.value = "";
    if (command.toLowerCase() === "clear") clearTerminal();
    else {
      pending.push(command);
      runNext();
    }
    if (focus && command.toLowerCase() !== "contact") input.focus({ preventScroll: true });
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submit(input.value);
  });
  $$("[data-command]").forEach((button) =>
    button.addEventListener("click", () => submit(button.dataset.command)),
  );
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (historyIndex === history.length) draft = input.value;
      if (historyIndex > 0) input.value = history[--historyIndex];
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      if (historyIndex < history.length) historyIndex++;
      input.value = historyIndex === history.length ? draft : history[historyIndex];
      input.setSelectionRange(input.value.length, input.value.length);
    } else if (event.key === "Tab" && !event.shiftKey && input.value.trim()) {
      // Campo vazio permite Tab normal, preservando a navegação por teclado.
      const prefix = input.value.trim().toLowerCase(),
        matches = commandNames.filter((name) => name.startsWith(prefix));
      if (!matches.length || (matches.length === 1 && matches[0] === prefix)) return;
      event.preventDefault();
      if (matches.length === 1) input.value = matches[0];
      else if (matches.length > 1) {
        let common = matches[0];
        while (!matches.every((name) => name.startsWith(common))) common = common.slice(0, -1);
        if (common.length > prefix.length) input.value = common;
        else {
          const hints = document.createElement("div");
          hints.className = "terminal-response";
          hints.textContent = "Opções: " + matches.join(" · ");
          output.append(hints);
          scrollBottom();
        }
      }
    } else if (event.key === "Escape") {
      input.value = "";
      historyIndex = history.length;
      draft = "";
    }
  });
})();

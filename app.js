const DATA_URL = "codigo.json";

if (new URLSearchParams(window.location.search).get("admin") === "true") {
  window.location.replace("admin.html");
}

const view = {
  code: document.querySelector("#returnCode"),
  date: document.querySelector("#updatedAt"),
  button: document.querySelector("#copyButton"),
  status: document.querySelector("#copyStatus")
};

let activeCode = "";

view.button.addEventListener("click", handleCopy);
loadCode();

async function loadCode() {
  try {
    const response = await fetch(`${DATA_URL}?t=${Date.now()}`, {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error("Arquivo de código indisponível.");
    }

    const data = await response.json();
    activeCode = String(data.codigo || "").trim();
    drawCode(activeCode, data.atualizadoEm);
  } catch (error) {
    activeCode = "";
    view.code.textContent = "Código indisponível";
    view.code.classList.add("empty");
    view.date.textContent = "Verificar";
    view.button.disabled = true;
    writeStatus(error.message, true);
  }
}

function drawCode(code, updatedAt) {
  const hasCode = Boolean(code);

  view.code.textContent = hasCode ? code : "Aguardando código";
  view.code.classList.toggle("empty", !hasCode);
  view.date.textContent = formatDate(updatedAt);
  view.button.disabled = !hasCode;
  writeStatus(hasCode ? "" : "Envie o código do dia.", false);
}

async function handleCopy() {
  if (!activeCode) return;

  try {
    await copyToClipboard(activeCode);
    writeStatus("Copiado.", false);
  } catch {
    writeStatus("Não foi possível copiar.", true);
  }
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.top = "-999px";
  document.body.appendChild(field);
  field.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(field);

  if (!copied) {
    throw new Error("Clipboard indisponível.");
  }
}

function writeStatus(message, isError) {
  view.status.textContent = message;
  view.status.classList.toggle("error", isError);
}

function formatDate(value) {
  if (!value) return "Sem data";

  let date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    date = new Date(year, month - 1, day);
  } else {
    date = new Date(value);
  }

  if (Number.isNaN(date.getTime())) return "Sem data";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium"
  }).format(date);
}

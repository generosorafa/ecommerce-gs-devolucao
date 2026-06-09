const GITHUB_OWNER = "generosorafa";
const GITHUB_REPO = "ecommerce-gs-devolucao";
const FILE_PATH = "codigo.json";
const BRANCHES = ["main", "gh-pages"];
const TOKEN_KEY = "gs_devolucoes_github_token";

const fields = {
  form: document.querySelector("#adminForm"),
  token: document.querySelector("#githubToken"),
  remember: document.querySelector("#rememberToken"),
  code: document.querySelector("#dailyCode"),
  date: document.querySelector("#codeDate"),
  status: document.querySelector("#adminStatus"),
  clearToken: document.querySelector("#clearToken")
};

fields.token.value = localStorage.getItem(TOKEN_KEY) || "";
fields.remember.checked = Boolean(fields.token.value);
fields.date.value = today();

fields.form.addEventListener("submit", saveCode);
fields.clearToken.addEventListener("click", clearStoredToken);

loadCurrentCode();

async function loadCurrentCode() {
  try {
    const response = await fetch(`codigo.json?t=${Date.now()}`, {
      cache: "no-store"
    });
    if (!response.ok) return;

    const data = await response.json();
    fields.code.value = String(data.codigo || "");
    fields.date.value = data.atualizadoEm || today();
  } catch {
    fields.date.value = today();
  }
}

async function saveCode(event) {
  event.preventDefault();

  const token = fields.token.value.trim();
  const codigo = fields.code.value.trim().toUpperCase();
  const atualizadoEm = fields.date.value || today();

  if (!token) {
    writeStatus("Informe o token GitHub.", true);
    return;
  }

  if (!codigo) {
    writeStatus("Informe o código do dia.", true);
    return;
  }

  const payload = {
    codigo,
    atualizadoEm
  };

  fields.code.value = codigo;
  fields.form.classList.add("is-saving");
  writeStatus("Salvando...", false);

  try {
    for (const branch of BRANCHES) {
      await updateGithubFile(branch, token, payload);
    }

    if (fields.remember.checked) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }

    writeStatus("Salvo. O site público atualiza em alguns segundos.", false);
  } catch (error) {
    writeStatus(error.message, true);
  } finally {
    fields.form.classList.remove("is-saving");
  }
}

async function updateGithubFile(branch, token, payload) {
  const current = await githubRequest(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${branch}`,
    token
  );

  await githubRequest(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`,
    token,
    {
      method: "PUT",
      body: JSON.stringify({
        message: `Atualiza código de devolução ${payload.atualizadoEm}`,
        content: toBase64(JSON.stringify(payload, null, 2) + "\n"),
        sha: current.sha,
        branch
      })
    }
  );
}

async function githubRequest(path, token, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || `GitHub ${response.status}`);
  }
  return data;
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
  fields.token.value = "";
  fields.remember.checked = false;
  writeStatus("Token removido deste navegador.", false);
}

function writeStatus(message, isError) {
  fields.status.textContent = message;
  fields.status.classList.toggle("error", isError);
}

function today() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function toBase64(text) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

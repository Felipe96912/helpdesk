const API = "https://logistica-helpdesk.onrender.com";

let chamadoAbertoId = null; 
let abaAtual = 'Aberto'; 
let todosOsChamados = []; 

/* 🔐 LOGIN */
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const inputEmail = document.getElementById("email");
    const inputSenha = document.getElementById("senha");

    if (inputEmail && inputSenha) {
      try {
        const res = await fetch(`${API}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email: inputEmail.value.trim(), 
            senha: inputSenha.value 
          })
        });

        const data = await res.json();
        if (res.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("tipo", data.tipo);
          window.location.href = "index.html"; 
        } else {
          alert(data.erro || "Erro ao logar");
        }
      } catch (err) {
        console.error("Erro na requisição:", err);
        alert("Servidor offline ou erro de rede.");
      }
    }
  });
}

/* ➕ CRIAR NOVO CHAMADO */
async function abrirChamado() {
  const inputTitulo = document.getElementById("titulo");
  const inputDesc = document.getElementById("descricao");
  const token = localStorage.getItem("token");

  // Verifica se os elementos existem na página atual
  if (!inputTitulo || !inputDesc) return;

  const titulo = inputTitulo.value;
  const descricao = inputDesc.value;

  if (!titulo || !descricao) return alert("Preencha todos os campos!");

  try {
    const res = await fetch(`${API}/chamados`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ titulo, descricao })
    });

    if (res.ok) {
      alert("Chamado aberto com sucesso!");
      window.location.href = "index.html";
    } else {
      alert("Erro ao abrir chamado.");
    }
  } catch (err) {
    console.error("Erro ao abrir chamado:", err);
  }
}

/* 👤 GERENCIAR USUÁRIOS (ADMIN) */
function abrirModalUsuario() {
    const modal = document.getElementById("modalUsuario");
    if (modal) modal.style.display = "flex";
}

function fecharModalUsuario() {
    const modal = document.getElementById("modalUsuario");
    if (modal) modal.style.display = "none";
}

const formUser = document.getElementById("formNovoUsuario");
if (formUser) {
    formUser.addEventListener("submit", async (e) => {
        e.preventDefault();
        const res = await fetch(`${API}/auth/admin/register`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify({
                nome: document.getElementById("regNome").value,
                email: document.getElementById("regEmail").value,
                senha: document.getElementById("regSenha").value,
                tipo: document.getElementById("regTipo").value
            })
        });

        if (res.ok) {
            alert("Usuário criado!");
            formUser.reset();
            fecharModalUsuario();
        } else {
            const erro = await res.json();
            alert("Erro: " + erro.erro);
        }
    });
}

/* 📋 LISTAGEM */
async function carregarChamados() {
  const token = localStorage.getItem("token");
  if (!token) return; 

  try {
    const res = await fetch(`${API}/chamados`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (res.status === 401 || res.status === 403) return logout(); // Token expirado
    
    todosOsChamados = await res.json();
    renderizarLista();
  } catch (err) {
    console.error("Erro ao carregar:", err);
  }
}

function renderizarLista() {
  const lista = document.getElementById("lista");
  if (!lista) return;
  const chamadosFiltrados = todosOsChamados.filter(c => c.status === abaAtual);
  
  lista.innerHTML = chamadosFiltrados.map(c => `
    <li onclick="verDetalhes('${c.id}', '${c.titulo}', '${c.descricao}', '${c.status}', '${c.data_abertura}', '${c.data_finalizacao || ''}', '${c.solucao || ''}')" 
        style="cursor:pointer; margin-bottom: 10px; border: 1px solid #444; padding: 15px; border-radius: 8px; list-style: none; background: #1a1a1a;">
      <div>
        <strong>${c.titulo}</strong> - <span style="color: ${c.status === 'Aberto' ? '#2f80ed' : '#4cd137'}">${c.status}</span>
      </div>
      <small style="color: #888;">${c.status === 'Aberto' ? '📅 Aberto: ' + (c.data_abertura || 'N/A') : '✅ Finalizado: ' + (c.data_finalizacao || 'N/A')}</small>
    </li>
  `).join("");
}

/* 🔍 MODAL DETALHES */
function verDetalhes(id, titulo, descricao, status, abertura, finalizacao, solucao) {
  chamadoAbertoId = id;
  const tipoUsuario = localStorage.getItem("tipo"); 

  const el = {
    titulo: document.getElementById("modalTitulo"),
    desc: document.getElementById("modalDescricao"),
    abertura: document.getElementById("modalDataAbertura"),
    areaSol: document.getElementById("areaSolucao"),
    contFin: document.getElementById("containerFinalizacao")
  };

  if (el.titulo) el.titulo.innerText = titulo;
  if (el.desc) el.desc.innerText = descricao;
  if (el.abertura) el.abertura.innerText = abertura;

  if (status === "Aberto") {
    if (el.areaSol) el.areaSol.style.display = (tipoUsuario === 'admin') ? "block" : "none";
    if (el.contFin) el.contFin.style.display = "none";
  } else {
    if (el.areaSol) el.areaSol.style.display = "none"; 
    const elDataFin = document.getElementById("modalDataFinalizacao");
    const elSolExib = document.getElementById("modalSolucaoExibicao");
    if (elDataFin) elDataFin.innerText = finalizacao;
    if (elSolExib) elSolExib.innerText = solucao || "Sem descrição.";
    if (el.contFin) el.contFin.style.display = "block";
  }

  const modal = document.getElementById("modalDetalhes");
  if (modal) modal.style.display = "flex";
}

/* 🟢 FINALIZAR CHAMADO */
async function finalizarChamadoAtual() {
  const inputSol = document.getElementById("inputSolucao");
  
  if (!inputSol) return;
  if (!inputSol.value) return alert("Por favor, descreva a solução.");
  if (!chamadoAbertoId) return alert("Erro: ID do chamado não encontrado.");

  try {
    const res = await fetch(`${API}/chamados/${chamadoAbertoId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
      },
      body: JSON.stringify({ solucao: inputSol.value }) 
    });

    if (res.ok) {
      alert("Chamado finalizado!");
      fecharModal();
      carregarChamados();
      inputSol.value = ""; 
    } else {
      const errorData = await res.json();
      alert("Erro ao finalizar: " + (errorData.erro || "Erro desconhecido"));
    }
  } catch (err) {
    console.error("Erro na requisição de finalização:", err);
  }
}

/* ❌ UTILITÁRIOS GERAIS */
function fecharModal() {
  const m = document.getElementById("modalDetalhes");
  if (m) m.style.display = "none";
}

function mudarAba(s) {
  abaAtual = s;
  renderizarLista();
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html"; 
}

/* ⭐ INICIALIZAÇÃO */
window.onload = () => {
  const token = localStorage.getItem("token");
  const tipo = localStorage.getItem("tipo");

  // Proteção: Se não tem token e não está no login, volta pro index
  if (!token && !document.getElementById("loginForm")) {
      window.location.href = "index.html";
      return;
  }

  if (token) {
    const loginContainer = document.getElementById("loginContainer");
    const sistema = document.getElementById("sistema");
    const btnAdmin = document.getElementById("btnGerenciarUsuarios");

    if (loginContainer) loginContainer.style.display = "none";
    if (sistema) sistema.style.display = "block";
    
    if (tipo === 'admin' && btnAdmin) {
      btnAdmin.style.display = "inline-block";
    }
    
    if (document.getElementById("lista")) carregarChamados();
  }
};

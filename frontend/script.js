const API = "https://logistica-helpdesk.onrender.com/chamados";
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
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inputEmail.value, senha: inputSenha.value }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("tipo", data.tipo);
        window.location.href = "index.html"; 
      } else {
        alert(data.erro || "Erro ao logar");
      }
    }
  });
}

/* 👤 FUNÇÕES PARA O MODAL DE USUÁRIO (ADMIN) */
function abrirModalUsuario() {
    console.log("Tentando abrir modal de usuário..."); 
    const modal = document.getElementById("modalUsuario");
    if (modal) {
        modal.style.display = "flex";
    } else {
        console.error("Erro: Elemento modalUsuario não encontrado no HTML");
    }
}

function fecharModalUsuario() {
    const modal = document.getElementById("modalUsuario");
    if (modal) modal.style.display = "none";
}

// Lógica para enviar o formulário de cadastro de novo usuário
const formUser = document.getElementById("formNovoUsuario");
if (formUser) {
    formUser.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const dados = {
            nome: document.getElementById("regNome").value,
            email: document.getElementById("regEmail").value,
            senha: document.getElementById("regSenha").value,
            tipo: document.getElementById("regTipo").value
        };

        const res = await fetch("http://localhost:3000/auth/admin/register", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify(dados)
        });

        if (res.ok) {
            alert("Usuário criado com sucesso!");
            formUser.reset();
            fecharModalUsuario();
        } else {
            const erro = await res.json();
            alert("Erro: " + erro.erro);
        }
    });
}

/* 📋 CARREGAR CHAMADOS */
async function carregarChamados() {
  const lista = document.getElementById("lista");
  const token = localStorage.getItem("token");
  if (!lista || !token) return; 

  try {
    const res = await fetch(API, {
      headers: { Authorization: "Bearer " + token },
    });
    if (!res.ok) throw new Error("Falha ao buscar");
    todosOsChamados = await res.json();
    renderizarLista();
  } catch (err) {
    console.error("Erro ao carregar:", err);
  }
}

/* 🎨 RENDERIZAR LISTA */
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
      <small style="color: #888;">${c.status === 'Aberto' ? '📅 Aberto em: ' + (c.data_abertura || 'N/A') : '✅ Finalizado em: ' + (c.data_finalizacao || 'N/A')}</small>
    </li>
  `).join("");
}

/* 🔍 DETALHES NO MODAL */
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
    const elFin = document.getElementById("modalDataFinalizacao");
    const elSolExib = document.getElementById("modalSolucaoExibicao");
    if (elFin) elFin.innerText = finalizacao;
    if (elSolExib) elSolExib.innerText = solucao || "Sem descrição.";
    if (el.contFin) el.contFin.style.display = "block";
  }

  const modal = document.getElementById("modalDetalhes");
  if (modal) modal.style.display = "flex";
}

/* 🟢 FINALIZAR CHAMADO */
async function finalizarChamadoAtual() {
  const inputSol = document.getElementById("inputSolucao");
  if (!inputSol || !inputSol.value) return alert("Por favor, descreva a solução.");

  const res = await fetch(`${API}/${chamadoAbertoId}`, {
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
  location.reload();
}

/* ⭐ INICIALIZAÇÃO */
window.onload = () => {
  const token = localStorage.getItem("token");
  const tipo = localStorage.getItem("tipo");

  if (token) {
    const loginContainer = document.getElementById("loginContainer");
    const sistema = document.getElementById("sistema");
    const btnAdmin = document.getElementById("btnGerenciarUsuarios");

    if (loginContainer) loginContainer.style.display = "none";
    if (sistema) sistema.style.display = "block";
    
    // MOSTRA O BOTÃO SE FOR ADMIN
    if (tipo === 'admin' && btnAdmin) {
      btnAdmin.style.display = "inline-block";
    }
    
    carregarChamados();
  }
};

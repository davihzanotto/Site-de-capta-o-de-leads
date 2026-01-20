/* =========================
   CONFIG (MUDE AQUI)
========================= */
const OWNER_PASSWORD = "malu2612"; // <- sua senha
const POTENTIAL_MIN_INCOME = 3850; // renda > 3850
const STORAGE_KEY = "leads_davih";

/* Links e texto do toast */
const TOAST_OK_TITLE = "Enviado com sucesso!";
const TOAST_OK_TEXT  = "Recebemos seus dados. Vou te chamar no WhatsApp em breve.";

/* =========================
   HELPERS
========================= */
function getLeads(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function setLeads(leads){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}
function nowString(){
  const d = new Date();
  return d.toLocaleString("pt-BR");
}
function toNumberBR(value){
  if(value == null) return 0;
  const s = String(value).trim()
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
function moneyBR(n){
  return n.toLocaleString("pt-BR", { style:"currency", currency:"BRL" });
}
function normalizePhone(raw){
  // Mantém só números
  const digits = (raw || "").replace(/\D/g, "");
  // Se já tem 55, mantém. Se não, tenta prefixar 55 (Brasil)
  if(digits.startsWith("55")) return digits;
  if(digits.length >= 10) return "55" + digits;
  return digits;
}
function showToast(title, text){
  const el = document.getElementById("toast");
  if(!el) return;
  el.innerHTML = `<strong>${title}</strong><span>${text}</span>`;
  el.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(()=> el.classList.remove("show"), 3200);
}

/* =========================
   MENU 3 PONTINHOS + SENHA
========================= */
function setupOwnerMenu(){
  const menuBtn = document.getElementById("menuBtn");
  const menuDrop = document.getElementById("menuDrop");
  const btnOwner = document.getElementById("btnOwner");

  const modal = document.getElementById("senhaModal");
  const senhaInput = document.getElementById("senhaInput");
  const btnCancel = document.getElementById("btnCancelSenha");
  const btnOk = document.getElementById("btnOkSenha");
  const senhaErro = document.getElementById("senhaErro");

  if(!menuBtn || !menuDrop) return;

  function openMenu(){
    menuDrop.classList.add("is-open");
    menuBtn.setAttribute("aria-expanded", "true");
    menuDrop.setAttribute("aria-hidden", "false");
  }
  function closeMenu(){
    menuDrop.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuDrop.setAttribute("aria-hidden", "true");
  }

  function openModal(){
    if(!modal) return;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden","false");
    if(senhaErro) senhaErro.style.display = "none";
    if(senhaInput){
      senhaInput.value = "";
      setTimeout(()=> senhaInput.focus(), 50);
    }
  }
  function closeModal(){
    if(!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden","true");
  }

  function validate(){
    const val = (senhaInput?.value || "").trim();
    if(val === OWNER_PASSWORD){
      closeModal();
      window.location.href = "dashboard.html";
    } else {
      if(senhaErro) senhaErro.style.display = "block";
      senhaInput?.focus();
      senhaInput?.select?.();
    }
  }

  menuBtn.addEventListener("click", (e)=>{
    e.stopPropagation();
    if(menuDrop.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  document.addEventListener("click", ()=> closeMenu());
  menuDrop.addEventListener("click", (e)=> e.stopPropagation());

  btnOwner?.addEventListener("click", ()=>{
    closeMenu();
    openModal();
  });

  modal?.addEventListener("click", (e)=>{
    if(e.target.classList.contains("modalBackdrop")) closeModal();
  });

  btnCancel?.addEventListener("click", closeModal);
  btnOk?.addEventListener("click", validate);

  senhaInput?.addEventListener("keydown", (e)=>{
    if(e.key === "Enter") validate();
    if(e.key === "Escape") closeModal();
  });
}

/* =========================
   CONTADOR ANIMADO (NÚMEROS)
========================= */
function animateCounters(){
  const counters = [...document.querySelectorAll(".count[data-target]")];
  if(!counters.length) return;

  const fmtBR = (n) => n.toLocaleString("pt-BR");

  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const el = entry.target;
      obs.unobserve(el);

      const target = Number(el.getAttribute("data-target") || "0");
      const isBR = el.getAttribute("data-format") === "ptbr";
      const duration = 900;
      const start = performance.now();

      function tick(t){
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = Math.floor(target * eased);
        el.textContent = isBR ? fmtBR(value) : String(value);
        if(p < 1) requestAnimationFrame(tick);
        else el.textContent = isBR ? fmtBR(target) : String(target);
      }
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.35 });

  counters.forEach(c=> obs.observe(c));
}

/* =========================
   INDEX: FORM + CLT CONDICIONAL
========================= */
function setupForm(){
  const form = document.getElementById("leadForm");
  if(!form) return;

  const cltpj = document.getElementById("cltpj");
  const cltExtra = document.getElementById("cltExtra");
  const clt3anos = document.getElementById("clt3anos");

  function updateCLT(){
    const v = (cltpj?.value || "").toUpperCase();
    const isCLT = v === "CLT";
    if(cltExtra){
      cltExtra.style.display = isCLT ? "flex" : "none";
    }
    if(clt3anos){
      clt3anos.required = isCLT;
      if(!isCLT) clt3anos.value = "";
    }
  }
  cltpj?.addEventListener("change", updateCLT);
  updateCLT();

  form.addEventListener("submit", (e)=>{
    e.preventDefault();

    const fd = new FormData(form);
    const nome = (fd.get("nome") || "").toString().trim();
    const telefone = (fd.get("telefone") || "").toString().trim();
    const renda = toNumberBR(fd.get("renda"));
    const pendencias = (fd.get("pendencias") || "").toString().trim();
    const filhos = (fd.get("filhos") || "").toString().trim();
    const cltpjVal = (fd.get("cltpj") || "").toString().trim();
    const clt3 = (fd.get("clt3anos") || "").toString().trim();
    const ir = (fd.get("ir") || "").toString().trim();
    const aluguel = (fd.get("aluguel") || "").toString().trim();
    const obs = (fd.get("obs") || "").toString().trim();

    if(!nome || !telefone || !renda || !pendencias || !filhos || !cltpjVal || !ir || !aluguel){
      showToast("Faltou algo…", "Preencha todos os campos obrigatórios.");
      return;
    }
    if(String(cltpjVal).toUpperCase() === "CLT" && !clt3){
      showToast("Só mais um detalhe…", "Informe se tem mais de 3 anos de carteira assinada.");
      return;
    }

    const leads = getLeads();
    leads.unshift({
      id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
      nome,
      telefone,
      telefone_norm: normalizePhone(telefone),
      renda,
      pendencias,
      filhos,
      cltpj: cltpjVal,
      clt3anos: clt3,
      ir,
      aluguel,
      obs,
      criado: nowString(),
      criado_ts: Date.now()
    });
    setLeads(leads);

    form.reset();
    updateCLT();
    showToast(TOAST_OK_TITLE, TOAST_OK_TEXT);
    // opcional: rolar um pouco pra confirmar
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* =========================
   DASHBOARD: SEPARAR POTENCIAL/OUTROS + COPIAR
========================= */
function setupDashboard(){
  const tbPot = document.getElementById("tbPot");
  const tbOutros = document.getElementById("tbOutros");
  if(!tbPot || !tbOutros) return;

  const dTotal = document.getElementById("dTotal");
  const dPot = document.getElementById("dPot");
  const dOutros = document.getElementById("dOutros");
  const dMedia = document.getElementById("dMedia");

  const search = document.getElementById("search");
  const exportCsv = document.getElementById("exportCsv");
  const clearAll = document.getElementById("clearAll");

  function isPotential(lead){
    const rendaOk = Number(lead.renda || 0) > POTENTIAL_MIN_INCOME;
    const pendOk = String(lead.pendencias || "").toLowerCase() === "não" || String(lead.pendencias || "").toLowerCase() === "nao";
    return rendaOk && pendOk;
  }

  function rowHTML(lead){
    const cltExtra = (String(lead.cltpj).toUpperCase() === "CLT" && lead.clt3anos)
      ? `CLT • 3 anos: ${lead.clt3anos}`
      : lead.cltpj || "-";

    return `
      <tr>
        <td>${lead.nome || "-"}</td>
        <td>${lead.telefone || "-"}</td>
        <td>${moneyBR(Number(lead.renda || 0))}</td>
        <td>${lead.pendencias || "-"}</td>
        <td>${cltExtra}</td>
        <td>${lead.ir || "-"}</td>
        <td>${lead.aluguel || "-"}</td>
        <td>${lead.criado || "-"}</td>
        <td>
          <div class="actionRow">
            <button class="copyBtn" data-copy="${lead.telefone_norm || ""}" title="Copiar telefone" aria-label="Copiar telefone">⧉</button>
          </div>
        </td>
      </tr>
    `;
  }

  function render(){
    const term = (search?.value || "").trim().toLowerCase();
    const leads = getLeads();

    const filtered = !term ? leads : leads.filter(l=>{
      const a = String(l.nome || "").toLowerCase();
      const b = String(l.telefone || "").toLowerCase();
      return a.includes(term) || b.includes(term);
    });

    const pot = filtered.filter(isPotential);
    const outros = filtered.filter(l => !isPotential(l));

    tbPot.innerHTML = pot.map(rowHTML).join("") || `<tr><td colspan="9" class="muted">Nenhum lead com potencial.</td></tr>`;
    tbOutros.innerHTML = outros.map(rowHTML).join("") || `<tr><td colspan="9" class="muted">Nenhum outro lead.</td></tr>`;

    // cards
    const total = filtered.length;
    const media = total ? filtered.reduce((acc,l)=> acc + Number(l.renda||0), 0) / total : 0;
    dTotal.textContent = String(total);
    dPot.textContent = String(pot.length);
    dOutros.textContent = String(outros.length);
    dMedia.textContent = moneyBR(media);

    // bind copy
    document.querySelectorAll(".copyBtn").forEach(btn=>{
      btn.addEventListener("click", async ()=>{
        const val = btn.getAttribute("data-copy") || "";
        if(!val){
          showToast("Não deu pra copiar", "Telefone inválido.");
          return;
        }
        try{
          await navigator.clipboard.writeText(val);
          showToast("Copiado!", `Telefone: ${val}`);
        }catch{
          // fallback
          const ta = document.createElement("textarea");
          ta.value = val;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
          showToast("Copiado!", `Telefone: ${val}`);
        }
      });
    });
  }

  search?.addEventListener("input", render);

  exportCsv?.addEventListener("click", ()=>{
    const leads = getLeads();
    if(!leads.length){
      showToast("Sem dados", "Não há leads para exportar.");
      return;
    }

    const headers = [
      "nome","telefone","renda","pendencias","filhos","cltpj","clt3anos","ir","aluguel","obs","criado"
    ];
    const lines = [
      headers.join(";"),
      ...leads.map(l => headers.map(h => {
        const v = (l[h] ?? "").toString().replaceAll("\n"," ").replaceAll(";"," , ");
        return `"${v}"`;
      }).join(";"))
    ];
    const blob = new Blob([lines.join("\n")], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads_davih.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    showToast("Exportado!", "CSV baixado com sucesso.");
  });

  clearAll?.addEventListener("click", ()=>{
    if(!confirm("Tem certeza que deseja apagar TODOS os leads?")) return;
    setLeads([]);
    render();
    showToast("Tudo limpo", "Leads apagados do LocalStorage.");
  });

  render();
}

/* =========================
   START
========================= */
document.addEventListener("DOMContentLoaded", ()=>{
  setupOwnerMenu();
  animateCounters();

  const page = document.body.getAttribute("data-page");
  if(page === "index"){
    setupForm();
  }
  if(page === "dashboard"){
    setupDashboard();
  }
});

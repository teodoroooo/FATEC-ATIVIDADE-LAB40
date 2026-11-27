// Exemplos JSON para as 40 funcionalidades do laboratório.
const examples = {
1:{valor:200,percentual:15},2:{preco:250,desconto:10},3:{valor:100,acrescimo:12},4:{valor:25,origem:"C",destino:"F"},5:{valor:2.5,origem:"km",destino:"m"},
6:{valores:[7,8,9]},7:{numero:17},8:{numero:5},9:{texto:"FATEC"},10:{texto:"Integração e Entrega Contínua"},11:{texto:"Node.js"},12:{texto:"GitHub Actions"},13:{texto:"CI/CD"},14:{texto:"A sacada da casa"},15:{texto:"  Integração   contínua  "},16:{nome:"Ada Lovelace Byron"},
17:{valores:[8,2,5]},18:{valores:[8,2,5]},19:{valores:[8,2,5]},20:{valores:[1,2,2,3,1]},21:{valores:[2,3,5]},22:{valores:[1,2,3,4]},23:{valores:[1,2,3,4]},24:{valores:[-2,0,5,-1]},25:{ano:2024},
26:{nascimento:"2000-11-26",referencia:"2026-11-26"},27:{data:"2026-11-26"},28:{dataInicial:"2026-11-01",dataFinal:"2026-11-26"},29:{data:"2026-11-26"},30:{dataAlvo:"2026-12-31",referencia:"2026-11-26"},31:{cpf:"529.982.247-25"},32:{email:"aluno@exemplo.com"},33:{idade:22},34:{nota:8.5},35:{distanciaKm:12,valorPorKm:2.5},36:{vendas:5000,percentual:4},37:{valor:999.9,parcelas:3},38:{senha:"Lab40@2026"},39:{texto:"Integração e Entrega Contínua"},40:{minimo:1,maximo:10}
};
let allFeatures = [];

// Evita que textos da API sejam interpretados como HTML.
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}

// Monta cartões de funcionalidades e indicadores de status.
function renderFeatures(items) {
  const container = document.querySelector("#feature-list");
  container.innerHTML = items.map(feature => `
    <article class="feature-card"><div class="card-top">
      <h3>${String(feature.id).padStart(2,"0")} · ${escapeHtml(feature.name)}</h3>
      <span class="status ${feature.implemented?"done":""}">${feature.implemented?"Implementada":"Pendente"}</span>
    </div><p>${escapeHtml(feature.description)}</p><div class="card-actions">
      <code>feature${String(feature.id).padStart(2,"0")}.js</code><button type="button" data-feature="${feature.id}">Selecionar</button>
    </div></article>`).join("");
  container.querySelectorAll("button[data-feature]").forEach(button => button.addEventListener("click",()=>selectFeature(Number(button.dataset.feature))));
  const done = allFeatures.filter(feature=>feature.implemented).length;
  document.querySelector("#implemented-count").textContent = `${done} implementadas`;
  document.querySelector("#pending-count").textContent = `${allFeatures.length-done} pendentes`;
}

// Carrega um módulo e seu exemplo de entrada.
function selectFeature(id) {
  if (!allFeatures.some(feature=>feature.id===id)) return;
  document.querySelector("#feature-select").value = String(id);
  document.querySelector("#input-json").value = JSON.stringify(examples[id]||{},null,2);
  document.querySelector("#output").textContent = `Funcionalidade ${String(id).padStart(2,"0")} selecionada.`;
}

// Consulta a lista de módulos disponibilizada pela API.
async function loadFeatures() {
  const response = await fetch("/api/features");
  const data = await response.json();
  allFeatures = data.items;
  document.querySelector("#feature-select").innerHTML = '<option value="">Selecione uma funcionalidade</option>'+allFeatures.map(item=>`<option value="${item.id}">${String(item.id).padStart(2,"0")} · ${escapeHtml(item.name)}</option>`).join("");
  renderFeatures(allFeatures);
}

// Envia o JSON informado pelo estudante para a rota correspondente.
async function runFeature() {
  const id = Number(document.querySelector("#feature-select").value);
  const output = document.querySelector("#output");
  if (!id) { output.textContent="Selecione uma funcionalidade."; return; }
  try {
    const input = JSON.parse(document.querySelector("#input-json").value);
    const response = await fetch(`/api/features/${id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(input)});
    const result = await response.json();
    output.textContent = JSON.stringify({httpStatus:response.status,...result},null,2);
    if (response.ok) await loadFeatures();
  } catch(error) { output.textContent=`Erro: ${error.message}`; }
}

// Liga os eventos da interface e inicializa o catálogo.
document.querySelector("#run-button").addEventListener("click",runFeature);
document.querySelector("#search").addEventListener("input",event=>{
  const query=event.target.value.toLocaleLowerCase("pt-BR");
  renderFeatures(allFeatures.filter(item=>`${item.name} ${item.description}`.toLocaleLowerCase("pt-BR").includes(query)));
});
document.querySelector("#feature-select").addEventListener("change",event=>{if(event.target.value)selectFeature(Number(event.target.value));});
loadFeatures().catch(error=>{document.querySelector("#output").textContent=`Não foi possível carregar a aplicação: ${error.message}`;});

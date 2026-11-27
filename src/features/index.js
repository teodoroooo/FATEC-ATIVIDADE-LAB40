// Registra os 40 módulos independentes.
const modules = [
  require("./feature01"),
  require("./feature02"),
  require("./feature03"),
  require("./feature04"),
  require("./feature05"),
  require("./feature06"),
  require("./feature07"),
  require("./feature08"),
  require("./feature09"),
  require("./feature10"),
  require("./feature11"),
  require("./feature12"),
  require("./feature13"),
  require("./feature14"),
  require("./feature15"),
  require("./feature16"),
  require("./feature17"),
  require("./feature18"),
  require("./feature19"),
  require("./feature20"),
  require("./feature21"),
  require("./feature22"),
  require("./feature23"),
  require("./feature24"),
  require("./feature25"),
  require("./feature26"),
  require("./feature27"),
  require("./feature28"),
  require("./feature29"),
  require("./feature30"),
  require("./feature31"),
  require("./feature32"),
  require("./feature33"),
  require("./feature34"),
  require("./feature35"),
  require("./feature36"),
  require("./feature37"),
  require("./feature38"),
  require("./feature39"),
  require("./feature40"),
];

// Retorna apenas os metadados públicos dos módulos.
function list() {
  return modules.map(({ id, name, description, implemented }) => ({ id, name, description, implemented }));
}

// Localiza um módulo pelo identificador.
function get(id) {
  return modules.find((feature) => feature.id === id);
}

module.exports = { list, get };

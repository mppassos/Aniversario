export function getHojeLocal() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function calcularIdade(dataNascimento) {
  if (!dataNascimento) return null;
  try {
    const part = String(dataNascimento).split("T")[0];
    const [y, m, d] = part.split("-").map(Number);
    const hoje = getHojeLocal();
    const nasc = new Date(y, m - 1, d);
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const diffM = hoje.getMonth() - nasc.getMonth();
    if (diffM < 0 || (diffM === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
  } catch {
    return null;
  }
}

export function formatarDataNascimento(dataNascimento) {
  try {
    const part = String(dataNascimento || "").split("T")[0];
    const [y, m, d] = part.split("-").map(Number);
    if (!y || !m || !d) return "";
    return new Date(y, m - 1, d);
  } catch {
    return null;
  }
}

export function isDiaHoje(dia) {
  const hoje = getHojeLocal();
  return (
    dia.getDate() === hoje.getDate() &&
    dia.getMonth() === hoje.getMonth() &&
    dia.getFullYear() === hoje.getFullYear()
  );
}

export function getIniciais(nome) {
  return (nome || "")
    .split(" ")
    .filter((p) => p.length > 2)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function getNomeCompacto(nome) {
  const partes = (nome || "")
    .trim()
    .split(" ")
    .filter((p) => p.length > 2);
  if (partes.length <= 2) return nome;
  return `${partes[0]} ${partes[partes.length - 1]}`;
}

export function getAnoAtual() {
  return new Date().getFullYear();
}

export function clienteParabenizadoEsteAno(cliente) {
  return cliente.anoParabenizado === getAnoAtual();
}

export function ordenarPorParabenizado(clientes) {
  const ano = getAnoAtual();
  return [...clientes].sort((a, b) => {
    const aP = a.anoParabenizado === ano;
    const bP = b.anoParabenizado === ano;
    if (aP === bP) return 0;
    return aP ? 1 : -1;
  });
}

const OL_LABORATORIOS = ['ache', 'biolab', 'eurofarma', 'apsen', 'supera'];

function normalizeText(value = '') {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function normalizeEan(value = '') {
  return String(value || '').trim().replace(/\D/g, '');
}

export function isPedidoOl(pedido = {}) {
  if (pedido?.ol === true || pedido?.ol === 1 || pedido?.ol === 'true') {
    return true;
  }

  const laboratorio = normalizeText(pedido?.laboratorio);
  return OL_LABORATORIOS.some((nome) => laboratorio.includes(nome));
}

export function extractEanValue(pedido = {}) {
  if (pedido?.ean) return pedido.ean;
  if (pedido?.ean_desconhecido) return 'Desconhecido';

  const text = String(pedido?.observacoes || '');
  const match = text.match(/(?:EAN|código de barras)\s*[:\-]?\s*([A-Za-z0-9\-\/]+)/i);
  if (match?.[1]) return match[1];

  return '';
}

export function findPedidoByEan(pedidos = [], ean = '') {
  const normalizedEan = normalizeEan(ean);
  if (!normalizedEan) return null;

  return pedidos.find((pedido) => normalizeEan(extractEanValue(pedido)) === normalizedEan) || null;
}

export function buildObservacoesWithEan(
  observacoes = '',
  ean = '',
  eanDesconhecido = false
) {
  const parts = [];

  if (observacoes.trim()) {
    parts.push(observacoes.trim());
  }

  if (eanDesconhecido) {
    parts.push('EAN desconhecido');
  } else if (ean) {
    parts.push(`EAN: ${ean}`);
  }

  return parts.join(' | ');
}

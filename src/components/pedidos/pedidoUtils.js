export function normalizeEan(value = '') {
  return String(value || '').trim().replace(/\D/g, '');
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

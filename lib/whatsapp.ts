import { WhatsAppMessage, OrderData } from '@/types';
import { formatPrice } from './utils';

export function generateWhatsAppMessage(
  orderData: OrderData,
  restaurantName: string,
  template?: string
): string {
  const defaultTemplate = `🍴 *Novo Pedido - {{restaurantName}}*

👤 *Cliente:* {{customerName}}
📱 *Telefone:* {{customerPhone}}
📍 *Endereço:* {{deliveryAddress}}

🛍️ *Pedido:*
{{orderItems}}

💰 *Total:* {{totalAmount}}
💳 *Pagamento:* {{paymentMethod}}
🚚 *Entrega:* {{deliveryType}}

---
⏰ Pedido realizado em: {{timestamp}}`;

  const orderItems = orderData.items
    .map(item => {
      let itemText = `• ${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}`;
      
      if (item.selectedOptions) {
        if (item.selectedOptions.size) {
          itemText += `\n  Tamanho: ${item.selectedOptions.size}`;
        }
        if (item.selectedOptions.extras && item.selectedOptions.extras.length > 0) {
          itemText += `\n  Extras: ${item.selectedOptions.extras.join(', ')}`;
        }
        if (item.selectedOptions.flavor) {
          itemText += `\n  Sabor: ${item.selectedOptions.flavor}`;
        }
      }
      
      if (item.observations) {
        itemText += `\n  Obs: ${item.observations}`;
      }
      
      return itemText;
    })
    .join('\n');

  const paymentMethodNames = {
    CASH: 'Dinheiro',
    PIX: 'PIX',
    DEBIT_CARD: 'Cartão de Débito',
    CREDIT_CARD: 'Cartão de Crédito'
  };

  const deliveryTypeNames = {
    DELIVERY: 'Entrega',
    PICKUP: 'Retirada'
  };

  const message = (template || defaultTemplate)
    .replace('{{restaurantName}}', restaurantName)
    .replace('{{customerName}}', orderData.customerName)
    .replace('{{customerPhone}}', orderData.customerPhone)
    .replace('{{deliveryAddress}}', orderData.deliveryAddress)
    .replace('{{orderItems}}', orderItems)
    .replace('{{totalAmount}}', formatPrice(orderData.total))
    .replace('{{paymentMethod}}', paymentMethodNames[orderData.paymentMethod])
    .replace('{{deliveryType}}', deliveryTypeNames[orderData.deliveryType])
    .replace('{{timestamp}}', new Date().toLocaleString('pt-BR'));

  return message;
}

export function generateWhatsAppUrl(whatsappNumber: string, message: string): string {
  // Remove caracteres especiais do número do WhatsApp
  const cleanNumber = whatsappNumber.replace(/\D/g, '');
  
  // Codifica a mensagem para URL
  const encodedMessage = encodeURIComponent(message);
  
  // Gera a URL do WhatsApp
  return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
}

export function validateWhatsAppNumber(number: string): boolean {
  // Remove caracteres especiais
  const cleanNumber = number.replace(/\D/g, '');
  
  // Verifica se tem o formato correto (Brasil: 55 + DDD + número)
  return cleanNumber.length >= 10 && cleanNumber.length <= 15;
}

export function formatWhatsAppNumber(number: string): string {
  // Remove caracteres especiais
  const cleanNumber = number.replace(/\D/g, '');
  
  // Se não tem código do país, adiciona o código do Brasil
  if (cleanNumber.length === 10 || cleanNumber.length === 11) {
    return `55${cleanNumber}`;
  }
  
  return cleanNumber;
}

export function generateOrderSummary(orderData: OrderData): string {
  const items = orderData.items.map(item => {
    return `${item.quantity}x ${item.name} - ${formatPrice(item.price * item.quantity)}`;
  }).join('\n');

  return `
RESUMO DO PEDIDO:
${items}

Subtotal: ${formatPrice(orderData.subtotal)}
Taxa de Entrega: ${formatPrice(orderData.deliveryFee)}
Total: ${formatPrice(orderData.total)}
  `.trim();
} 
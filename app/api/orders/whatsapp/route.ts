import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleApiError } from '@/lib/api-utils';
import { generateWhatsAppMessage, generateWhatsAppUrl } from '@/lib/whatsapp';
import { generateOrderCode } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      restaurantSlug,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      reference,
      observations,
      paymentMethod,
      deliveryType,
      items
    } = body;

    // Validar dados obrigatórios
    if (!restaurantSlug || !customerName || !customerPhone || !deliveryAddress || !paymentMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Buscar restaurante
    const restaurant = await db.restaurant.findUnique({
      where: { slug: restaurantSlug },
      select: {
        id: true,
        name: true,
        whatsapp: true,
        deliveryFee: true,
        minimumOrder: true,
        isActive: true,
        isOpen: true,
        whatsappTemplate: true
      }
    });

    if (!restaurant || !restaurant.isActive) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado ou inativo' },
        { status: 404 }
      );
    }

    if (!restaurant.isOpen) {
      return NextResponse.json(
        { error: 'Restaurante fechado' },
        { status: 400 }
      );
    }

    if (!restaurant.whatsapp) {
      return NextResponse.json(
        { error: 'WhatsApp não configurado' },
        { status: 400 }
      );
    }

    // Calcular totais
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }

    const deliveryFee = deliveryType === 'DELIVERY' ? (restaurant.deliveryFee || 0) : 0;
    const total = subtotal + deliveryFee;

    // Verificar pedido mínimo
    if (restaurant.minimumOrder && subtotal < restaurant.minimumOrder) {
      return NextResponse.json(
        { error: `Pedido mínimo: R$ ${restaurant.minimumOrder.toFixed(2)}` },
        { status: 400 }
      );
    }

    // Gerar código do pedido
    const orderCode = generateOrderCode();

    // Criar pedido no banco
    const order = await db.order.create({
      data: {
        code: orderCode,
        customerName,
        customerPhone,
        customerEmail,
        deliveryAddress,
        reference,
        observations,
        paymentMethod,
        deliveryType,
        subtotal,
        deliveryFee,
        total,
        restaurantId: restaurant.id,
        items: {
          create: items.map((item: any) => ({
            quantity: item.quantity,
            unitPrice: item.price,
            totalPrice: item.price * item.quantity,
            selectedOptions: item.selectedOptions,
            observations: item.observations,
            productId: item.id
          }))
        }
      }
    });

    // Gerar mensagem do WhatsApp
    const orderData = {
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      reference,
      observations,
      paymentMethod,
      deliveryType,
      items,
      subtotal,
      deliveryFee,
      total
    };

    const message = generateWhatsAppMessage(orderData, restaurant.name, restaurant.whatsappTemplate);
    const whatsappUrl = generateWhatsAppUrl(restaurant.whatsapp, message);

    // Atualizar pedido com URL do WhatsApp
    await db.order.update({
      where: { id: order.id },
      data: {
        whatsappUrl,
        whatsappSent: true,
        sentAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        orderCode: order.code,
        whatsappUrl,
        message
      }
    });

  } catch (error) {
    return handleApiError(error);
  }
} 
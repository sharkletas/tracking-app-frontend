import React from 'react';
import { InlineGrid, Layout, Card, Text, Badge, Button } from '@shopify/polaris';


const KanbanBoard = ({ orders = [], isSyncing }) => {
    if (isSyncing || orders.length === 0) {
        return <div>{(isSyncing ? 'Cargando...' : 'No hay órdenes')}</div>;
    }

    const columns = [
        { title: 'Pendiente', items: orders.filter(order => order.orderType === 'Pre-Orden') },
        { title: 'En Proceso', items: orders.filter(order => order.orderType === 'Entrega Inmediata') },
        { title: 'Completado', items: orders.filter(order => order.orderType === 'Reemplazo') },
    ];

    return (
        <InlineGrid gap="400" columns={columns.length}>
            {columns.map((column, index) => (
                <Layout key={index}>
                    <Layout.Section>
                        <Text variant="headingMd" as="h3">{column.title}</Text>
                    </Layout.Section>
                    <Layout.Section>
                        {column.items.map((order) => (
                            <Card key={order._id} subdued>
                                <Card.Section>
                                    <Text variant="bodyMd">
                                        <b>Order Number:</b> <a href={`/order-details/${order._id}`}>{order.orderNumber}</a>
                                    </Text>
                                    <Button
                                        plain
                                        url={`https://admin.shopify.com/store/2b636b-a7/orders/${order._id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Ver en Shopify
                                    </Button>
                                    <Text variant="bodySm">
                                        <b>Payment Status:</b> <Badge tone="financial" status={getPaymentStatusTone(order.paymentStatus)}>{order.paymentStatus}</Badge>
                                    </Text>
                                    <Text variant="bodySm">
                                        <b>Tipo de Orden:</b> <Badge status={getOrderTypeStatus(order.orderType)}>{order.orderType}</Badge>
                                    </Text>
                                    <Text variant="bodySm">
                                        <b>Status de Productos:</b>
                                        {order.productStatus.map((status, i) => (
                                            <Badge key={i} status="info" style={{ marginRight: '5px' }}>
                                                {status}
                                            </Badge>
                                        ))}
                                    </Text>
                                </Card.Section>
                            </Card>
                        ))}
                    </Layout.Section>
                </Layout>
            ))}
        </InlineGrid>
    );
};

// Helper functions for determining Badge status
function getPaymentStatusTone(paymentStatus) {
    switch (paymentStatus) {
        case 'Pago Completo':
            return 'success';
        case 'Pago Parcial':
            return 'warning';
        default:
            return 'critical';
    }
}

function getOrderTypeStatus(orderType) {
    switch (orderType) {
        case 'Entrega Inmediata':
            return 'success';
        case 'Pre-Orden':
            return 'warning';
        default:
            return 'info';
    }
}

export default KanbanBoard;
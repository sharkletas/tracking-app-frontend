import React, { useState, useEffect } from 'react';
import { 
  Card, 
  TextContainer, 
  Badge, 
  Button, 
  TextField, 
  Select, 
  DataTable, 
  FormLayout, 
  Checkbox,
  Layout 
} from '@shopify/polaris';
import { ExternalSmallIcon } from '@shopify/polaris-icons';

const OrderDetails = ({ order, onClose }) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [canConsolidate, setCanConsolidate] = useState(false);
  const [canPrepare, setCanPrepare] = useState(false);
  const [correosTrackingNumber, setCorreosTrackingNumber] = useState(''); // Estado para el número de tracking

  // Desestructuración de los datos de la orden
  const { 
    shopifyOrderNumber, 
    paymentStatus,
    orderType, 
    shopifyOrderLink, 
    createdAt, 
    orderDetails: { products, totalWeight },
    trackingInfo: { productTrackings },
    fulfillmentStatus: { status: fulfillmentStatus },
    currentStatus
  } = order;

  // Simulación de datos de sucursales
  const branches = ['CJ Dropshipping China Warehouse', 'Sharkletas HQ'];

  // Simulación de opciones para proveedores y compañías de transporte
  const suppliers = ['Proveedor 1', 'Proveedor 2'];
  const carriers = ['Carrier A', 'Carrier B'];

  // Lógica para determinar si se puede consolidar o preparar
  useEffect(() => {
    // Lógica para determinar si se puede consolidar
    const allProductsReceived = products.every(product => 
      product.status.some(status => status.status === 'Recibido por Sharkletas')
    );
    setCanConsolidate(allProductsReceived);

    // Lógica para determinar si se puede preparar (fulfill)
    const isConsolidated = products.some(product => 
      product.status.some(status => status.status === 'Consolidado')
    );
    setCanPrepare(isConsolidated);
  }, [products]);

  // Lógica para consolidar productos
  const handleConsolidateProducts = () => {
    console.log('Consolidar Productos');
    // Aquí deberías enviar una solicitud al backend para actualizar el estado de los productos a 'Consolidado'
    // y moverlos a 'Sharkletas HQ'
    // onClose(); // Si quieres cerrar el modal después de la acción, descomenta esta línea
  };

  // Lógica para preparar productos (fulfill items)
  const handlePrepareProducts = async () => {
    try {
      const response = await fetch(`/api/prepare-products/${order.shopifyOrderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trackingNumber: correosTrackingNumber }),
      });

      if (!response.ok) {
        throw new Error('Error al preparar productos');
      }

      const data = await response.json();
      console.log('Orden preparada:', data);
      onClose(); // Cierra el modal después de la acción
    } catch (error) {
      console.error('Error:', error);
      // Maneja el error, por ejemplo, mostrando un mensaje al usuario
    }
  };

  // Función para abrir el modal de Comprar a Proveedor
  const toggleSupplierModal = () => {
    // Lógica para manejar la apertura de un modal interno para seleccionar proveedor o similar
    // Aquí podrías implementar la lógica para abrir un modal si lo necesitas, pero en este caso, 
    // simplemente se muestra un mensaje en la consola
    console.log('Abrir modal para Comprar a Proveedor');
  };

  // Manejo de selección de productos para Comprar a Proveedor
  const handleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  return (
    <Layout>
      <Layout.Section>
        <Card sectioned>
          <TextContainer>
            <p><strong>Estado del Pago:</strong> <Badge tone={paymentStatus === 'paid' ? 'success' : 'warning'}>{paymentStatus}</Badge></p>
            <p><strong>Tipo de Orden:</strong> {orderType}</p>
            <p><strong>Fecha del Pedido:</strong> {new Date(createdAt).toLocaleDateString()}</p>
            <p><strong>Fecha Estimada de Entrega:</strong> {currentStatus && currentStatus.updatedAt ? new Date(currentStatus.updatedAt).toLocaleDateString() : 'No disponible'}</p>
            <p><strong>Peso Total:</strong> {totalWeight} kg</p>
          </TextContainer>
        </Card>
      </Layout.Section>
      {branches.map(branch => (
        <Layout.Section key={branch}>
          <Card title={branch} sectioned>
            <TextContainer>
              <p><strong>Status del Fulfillment:</strong> <Badge tone={fulfillmentStatus === 'fulfilled' ? 'success' : 'attention'}>{fulfillmentStatus}</Badge></p>
              {branch === 'CJ Dropshipping China Warehouse' && (
                <Button onClick={handleConsolidateProducts} disabled={!canConsolidate}>Consolidar Productos</Button>
              )}
              {branch === 'Sharkletas HQ' && (
                <Button onClick={handlePrepareProducts} disabled={!canPrepare}>Preparar Productos</Button>
              )}
              <Button onClick={toggleSupplierModal}>Comprar a Proveedor</Button>
            </TextContainer>
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'numeric', 'text', 'text', 'text', 'text', 'text']}
              headings={[
                'Nombre del Artículo', 'Cantidad', 'Peso', 'Tipo de Compra', 'PO Proveedor', 'Tracking Proveedor', 'Compañía de Transporte', 'Status'
              ]}
              rows={products.filter(product => product.branch === branch).map(product => {
                const latestStatus = product.status[product.status.length - 1] || {};
                return [
                  product.name,
                  product.quantity.toString(),
                  product.weight.toString(),
                  product.purchaseType,
                  product.supplierPO || '-',
                  productTrackings.find(tracking => tracking.productId === product.productId)?.trackingNumber || '-',
                  productTrackings.find(tracking => tracking.productId === product.productId)?.carrier || '-',
                  latestStatus.status || 'Por Procesar'
                ];
              })}
            />
          </Card>
        </Layout.Section>
      ))}
    </Layout>
  );
};

export default OrderDetails;

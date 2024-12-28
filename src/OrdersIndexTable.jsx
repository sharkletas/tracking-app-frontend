import React, { useState, useEffect, useCallback } from 'react';
import {
  LegacyCard,
  IndexTable,
  Tabs,
  Badge,
  useIndexResourceState,
  Button,
} from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';

function OrdersIndexTable() {
  const [rows, setRows] = useState([]);
  const [queryValue, setQueryValue] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch de órdenes desde el backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`https://tracking-app-backend-iab9.onrender.com/api/orders?page=${currentPage}`);
        const data = await response.json();
        setRows(data.orders);
        setHasNextPage(data.hasNextPage);
      } catch (error) {
        console.error('Error al obtener las órdenes:', error);
      }
    };

    fetchOrders();
  }, [currentPage]);

  // Configuración de tabs
  const tabs = [
    { id: 'all-orders', content: 'Todos' },
    { id: 'pre-orders', content: 'Pre-Orden' },
    { id: 'immediate-delivery', content: 'Entrega Inmediata' },
    { id: 'replacement', content: 'Reemplazo' },
  ];

  const handleTabChange = (selectedTabIndex) => setSelectedTab(selectedTabIndex);

  // Filtrado dinámico por tab
  const filteredRows = (rows || []).filter((row) => {
    if (selectedTab === 1) return row.orderType === 'Pre-Orden';
    if (selectedTab === 2) return row.orderType === 'Entrega Inmediata';
    if (selectedTab === 3) return row.orderType === 'Reemplazo';
    return true; // Tab "Todos"
  });

  const resourceName = {
    singular: 'order',
    plural: 'orders',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(filteredRows);

  const rowMarkup = filteredRows.map(
    ({ _id, orderNumber, orderDate, customer, paymentStatus, orderType, carrier, productStatus }, index) => (
      <IndexTable.Row
        id={_id}
        key={_id}
        selected={selectedResources.includes(_id)}
        position={index}
      >
        <IndexTable.Cell>
          <a
            href={`https://admin.shopify.com/store/2b636b-a7/orders/${_id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {orderNumber}
          </a>
        </IndexTable.Cell>
        <IndexTable.Cell>{new Date(orderDate).toLocaleDateString()}</IndexTable.Cell>
        <IndexTable.Cell>{customer}</IndexTable.Cell>
        <IndexTable.Cell>
          <Badge
            status={
              paymentStatus === 'Pago Completo'
                ? 'success'
                : paymentStatus === 'Pago Parcial'
                ? 'warning'
                : 'critical'
            }
          >
            {paymentStatus}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge
            status={
              orderType === 'Entrega Inmediata'
                ? 'success'
                : orderType === 'Pre-Orden'
                ? 'warning'
                : 'info'
            }
          >
            {orderType}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>{carrier}</IndexTable.Cell>
        <IndexTable.Cell>
          {(productStatus || []).map((status, i) => (
            <Badge key={i} status="info" style={{ marginRight: '5px' }}>
              {status}
            </Badge>
          ))}
        </IndexTable.Cell>
      </IndexTable.Row>
    )
  );

  const promotedBulkActions = [
    {
      content: 'Marcar como completadas',
      onAction: () => console.log('Acción en masa: Completadas'),
    },
  ];

  const bulkActions = [
    {
      content: 'Eliminar órdenes',
      icon: DeleteIcon,
      destructive: true,
      onAction: () => console.log('Acción en masa: Eliminar'),
    },
  ];

  return (
    <LegacyCard>
      <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} />
      <IndexTable
        resourceName={resourceName}
        itemCount={filteredRows.length}
        selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
        bulkActions={bulkActions}
        promotedBulkActions={promotedBulkActions}
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: 'Número de Pedido' },
          { title: 'Fecha de Pedido' },
          { title: 'Cliente' },
          { title: 'Estado de Pago' },
          { title: 'Tipo de Orden' },
          { title: 'Carrier' },
          { title: 'Status de Productos' },
        ]}
        pagination={{
          hasNext: hasNextPage,
          onNext: () => setCurrentPage((prev) => prev + 1),
          hasPrevious: currentPage > 1,
          onPrevious: () => setCurrentPage((prev) => prev - 1),
        }}
      >
        {rowMarkup}
      </IndexTable>
    </LegacyCard>
  );
}

export default OrdersIndexTable;
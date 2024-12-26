import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  IndexTable,
  Filters,
  Badge,
  TextField,
} from '@shopify/polaris';

function OrdersIndexTable() {
  const [rows, setRows] = useState([]); // Estado para las órdenes
  const [queryValue, setQueryValue] = useState('');
  const [filters, setFilters] = useState({
    paymentStatus: null,
    orderType: null,
    carrier: null,
  });

  // Fetch de órdenes desde el backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('https://tracking-app-backend-iab9.onrender.com/api/orders');
        const data = await response.json();
        setRows(data);
      } catch (error) {
        console.error('Error al obtener las órdenes:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleQueryChange = useCallback((value) => setQueryValue(value), []);
  const handleQueryClear = useCallback(() => setQueryValue(''), []);

  const filtersMarkup = (
    <Filters
      queryValue={queryValue}
      onQueryChange={handleQueryChange}
      onQueryClear={handleQueryClear}
      filters={[
        {
          key: 'paymentStatus',
          label: 'Estado de Pago',
          filter: (
            <TextField
              label="Estado de Pago"
              value={filters.paymentStatus || ''}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, paymentStatus: value }))
              }
              placeholder="Ejemplo: Pago Completo"
            />
          ),
        },
        {
          key: 'orderType',
          label: 'Tipo de Orden',
          filter: (
            <TextField
              label="Tipo de Orden"
              value={filters.orderType || ''}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, orderType: value }))
              }
              placeholder="Ejemplo: Pre-Orden"
            />
          ),
        },
        {
          key: 'carrier',
          label: 'Carrier',
          filter: (
            <TextField
              label="Carrier"
              value={filters.carrier || ''}
              onChange={(value) =>
                setFilters((prev) => ({ ...prev, carrier: value }))
              }
              placeholder="Ejemplo: Correos de CR"
            />
          ),
        },
      ]}
    />
  );

  return (
    <Card>
      <IndexTable
        resourceName={{ singular: 'pedido', plural: 'pedidos' }}
        itemCount={rows.length}
        selectable={false}
        headings={[
          { title: 'Número de Pedido' },
          { title: 'Fecha de Pedido' },
          { title: 'Cliente' },
          { title: 'Estado de Pago' },
          { title: 'Tipo de Orden' },
          { title: 'Carrier' },
          { title: 'Status de Productos' },
        ]}
        filters={filtersMarkup}
        bulkActions={[]}
      >
        {rows.map((row, index) => (
          <IndexTable.Row id={row._id} key={row._id} position={index}>
            <IndexTable.Cell>
              <a
                href={`https://admin.shopify.com/store/2b636b-a7/orders/${row._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {row.orderNumber}
              </a>
            </IndexTable.Cell>
            <IndexTable.Cell>{new Date(row.orderDate).toLocaleDateString()}</IndexTable.Cell>
            <IndexTable.Cell>{row.customer}</IndexTable.Cell>
            <IndexTable.Cell>
              <Badge
                status={
                  row.paymentStatus === 'Pago Completo'
                    ? 'success'
                    : row.paymentStatus === 'Pago Parcial'
                    ? 'warning'
                    : row.paymentStatus === 'No Pago'
                    ? 'critical'
                    : 'default'
                }
              >
                {row.paymentStatus}
              </Badge>
            </IndexTable.Cell>
            <IndexTable.Cell>
              <Badge
                status={
                  row.orderType === 'Entrega Inmediata'
                    ? 'success'
                    : row.orderType === 'Pre-Orden'
                    ? 'warning'
                    : 'info'
                }
              >
                {row.orderType}
              </Badge>
            </IndexTable.Cell>
            <IndexTable.Cell>{row.carrier}</IndexTable.Cell>
            <IndexTable.Cell>
              {row.productStatus.map((status, i) => (
                <Badge key={i} status="info" style={{ marginRight: '5px' }}>
                  {status}
                </Badge>
              ))}
            </IndexTable.Cell>
          </IndexTable.Row>
        ))}
      </IndexTable>
    </Card>
  );
}

export default OrdersIndexTable;

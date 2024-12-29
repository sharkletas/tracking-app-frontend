import React, { useState, useCallback } from 'react';
import {
  LegacyCard,
  IndexTable,
  Tabs,
  Badge,
  useIndexResourceState,
  Filters,
  Select,
  TextField,
  IndexFilters,
  useSetIndexFiltersMode,
  Spinner,
} from '@shopify/polaris';
import { DeleteIcon } from '@shopify/polaris-icons';

function OrdersIndexTable({ orders = [], isSyncing }) {
  // Establecer un valor por defecto para sortValue
  const [selectedTab, setSelectedTab] = useState(0);
  const [filterQuery, setFilterQuery] = useState({ orderType: '', paymentStatus: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortValue, setSortValue] = useState('shopifyOrderNumber:asc');
  const [searchValue, setSearchValue] = useState('');
  const [views, setViews] = useState([
    { id: 'all-orders', name: 'Todos' },
    { id: 'pre-orders', name: 'Pre-Orden' },
    { id: 'immediate-delivery', name: 'Entrega Inmediata' },
    { id: 'replacement', name: 'Reemplazo' },
  ]);
  const [selectedView, setSelectedView] = useState('all-orders');

  const tabs = views.map((view) => ({ id: view.id, content: view.name }));

  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelectedTab(selectedTabIndex);
    setSelectedView(tabs[selectedTabIndex].id);
  }, [tabs]);

  const { mode, setMode } = useSetIndexFiltersMode();

  // Filtrar las órdenes basado en los filtros y búsqueda
  const filteredRows = orders.filter((order) => {
    let matches = true;
    
    if (filterQuery.orderType && order.orderType !== filterQuery.orderType) matches = false;
    if (filterQuery.paymentStatus && order.paymentStatus !== filterQuery.paymentStatus) matches = false;
    if (searchValue && !order.shopifyOrderNumber.toLowerCase().includes(searchValue.toLowerCase())) matches = false;
    
    return matches;
  }).filter((row) => {
    if (selectedView === 'pre-orders') return row.orderType === 'Pre-Orden';
    if (selectedView === 'immediate-delivery') return row.orderType === 'Entrega Inmediata';
    if (selectedView === 'replacement') return row.orderType === 'Reemplazo';
    return true; // Vista "Todos"
  });

  // Función para ordenar las órdenes
  const sortOrders = (rows, sortValue) => {
    if (!sortValue) return rows;
    const [field, direction] = sortValue.split(':');
    const sortedRows = [...rows].sort((a, b) => {
      if (a[field] < b[field]) return direction === 'asc' ? -1 : 1;
      if (a[field] > b[field]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortedRows;
  };

  // Aplicar el ordenamiento a las filas filtradas
  const sortedRows = sortOrders(filteredRows, sortValue);
  
  // Calcular los índices para la paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRows = sortedRows.slice(startIndex, endIndex);

  const resourceName = {
    singular: 'orden',
    plural: 'órdenes',
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(paginatedRows);

  const rowMarkup = paginatedRows.map(
    ({ _id, shopifyOrderNumber, createdAt, shopifyOrderLink, paymentStatus, orderType, trackingInfo, productStatus }, index) => (
      <IndexTable.Row
        id={_id}
        key={_id}
        selected={selectedResources.includes(_id)}
        position={index}
      >
        <IndexTable.Cell>
          <a
            href={shopifyOrderLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {shopifyOrderNumber}
          </a>
        </IndexTable.Cell>
        <IndexTable.Cell>{new Date(createdAt).toLocaleDateString()}</IndexTable.Cell>
        <IndexTable.Cell>
          <Badge
            tone={
              paymentStatus === 'paid' ? 'success' :
              paymentStatus === 'partially_paid' || paymentStatus === 'partially_refunded' ? 'financial' :
              paymentStatus === 'refunded' ? 'info' : 
              'default'
            }
            progress={
              paymentStatus === 'paid' ? 'complete' :
              paymentStatus === 'partially_paid' || paymentStatus === 'partially_refunded' ? 'partiallyComplete' :
              paymentStatus === 'refunded' ? 'complete' :
              'incomplete'
            }
          >
            {paymentStatus === 'paid' ? 'Pago Completo' : 
             paymentStatus === 'partially_paid' ? 'Pago Parcial' : 
             paymentStatus === 'partially_refunded' ? 'Parcialmente Reembolsado' : 
             paymentStatus === 'refunded' ? 'Reembolsado' : 'Pago Pendiente'}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Badge 
            tone={orderType === 'Pre-Orden' ? 'warning' : orderType === 'Entrega Inmediata' ? 'success' : 'info'}
            progress={orderType === 'Pre-Orden' ? 'partiallyComplete' : orderType === 'Entrega Inmediata' ? 'complete' : 'incomplete'}
          >
            {orderType}
          </Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>{trackingInfo.orderTracking ? trackingInfo.orderTracking.trackingNumber || 'No asignado' : 'No asignado'}</IndexTable.Cell>
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

  const filters = [
    {
      key: 'orderType',
      label: 'Tipo de orden',
      filter: (
        <Select
          label="Tipo de orden"
          options={['', 'Pre-Orden', 'Entrega Inmediata', 'Reemplazo'].map(type => ({ label: type, value: type }))}
          onChange={(selected) => setFilterQuery(prev => ({ ...prev, orderType: selected }))}
          value={filterQuery.orderType}
        />
      ),
      operatorText: 'es',
    },
    {
      key: 'paymentStatus',
      label: 'Estado de pago',
      filter: (
        <Select
          label="Estado de pago"
          options={['', 'paid', 'partially_paid', 'pending', 'partially_refunded', 'refunded'].map(status => ({ 
            label: status === 'paid' ? 'Pago Completo' : 
                   status === 'partially_paid' ? 'Pago Parcial' : 
                   status === 'partially_refunded' ? 'Parcialmente Reembolsado' : 
                   status === 'refunded' ? 'Reembolsado' : 'Pago Pendiente', 
            value: status 
          }))}
          onChange={(selected) => setFilterQuery(prev => ({ ...prev, paymentStatus: selected }))}
          value={filterQuery.paymentStatus}
        />
      ),
      operatorText: 'es',
    },
  ];

  // Calcular el número total de páginas
  const totalPages = Math.ceil(sortedRows.length / itemsPerPage);

  // Configuración de las columnas ordenables
  const sortableColumns = [
    { field: 'shopifyOrderNumber', label: 'Número de Pedido' },
    { field: 'createdAt', label: 'Fecha de Pedido' },
    { field: 'paymentStatus', label: 'Estado de Pago' },
    { field: 'orderType', label: 'Tipo de Orden' },
    { field: 'trackingInfo.orderTracking.trackingNumber', label: 'Número de Rastreo' },
  ];

  return (
    <LegacyCard>
      {isSyncing ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spinner accessibilityLabel="Cargando órdenes" size="large" />
        </div>
      ) : (
        <React.Fragment>
          <IndexFilters
            sortOptions={sortableColumns.map((column) => ({
              label: column.label,
              value: `${column.field}:asc`,
              directionLabel: 'Asc',
              sortKey: column.field,
            }))}
            sortSelected={sortValue}
            queryValue={searchValue}
            queryPlaceholder="Buscar por número de pedido"
            onQueryChange={setSearchValue}
            onQueryClear={() => setSearchValue('')}
            filters={filters}
            appliedFilters={Object.keys(filterQuery).filter(key => filterQuery[key]).map(key => ({
              key,
              label: filters.find(filter => filter.key === key).label,
              onRemove: () => setFilterQuery(prev => ({ ...prev, [key]: '' })),
            }))}
            onClearAll={() => setFilterQuery({ orderType: '', paymentStatus: '' })}
            tabs={tabs}
            selected={selectedTab}
            onSelect={handleTabChange}
            canCreateNewView={false}
            mode={mode}
            setMode={setMode}
            primaryAction={{
              type: 'save-as',
              onAction: () => console.log('Guardar vista'),
              content: 'Guardar vista',
              disabled: false,
            }}
            cancelAction={{
              onAction: () => console.log('Cancelar cambios'),
              content: 'Cancelar',
              disabled: false,
            }}
          />
          <IndexTable
            resourceName={resourceName}
            itemCount={paginatedRows.length}
            selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
            onSelectionChange={handleSelectionChange}
            bulkActions={bulkActions}
            promotedBulkActions={promotedBulkActions}
            sortValue={sortValue}
            sort={sortableColumns.map((column) => ({
              ...column,
              onSort: (newSortValue) => setSortValue(newSortValue),
            }))}
            stickyHeader
            headings={[
              { title: 'Número de Pedido', sortable: true, sortValue: 'shopifyOrderNumber:asc' },
              { title: 'Fecha de Pedido', sortable: true, sortValue: 'createdAt:desc' },
              { title: 'Estado de Pago', sortable: true, sortValue: 'paymentStatus:asc' },
              { title: 'Tipo de Orden', sortable: true, sortValue: 'orderType:asc' },
              { title: 'Número de Rastreo', sortable: true, sortValue: 'trackingInfo.orderTracking.trackingNumber:asc' },
              { title: 'Status de Productos' },
            ]}
            pagination={{
              hasNext: currentPage < totalPages,
              onNext: () => setCurrentPage(currentPage + 1),
              hasPrevious: currentPage > 1,
              onPrevious: () => setCurrentPage(currentPage - 1),
            }}
          >
            {rowMarkup}
          </IndexTable>
        </React.Fragment>
      )}
    </LegacyCard>
  );
}

export default OrdersIndexTable;
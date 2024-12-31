import React, { useState, useEffect, useCallback } from 'react';
import { Page, Layout, Button, Icon, Tabs, Spinner, SkeletonPage, SkeletonBodyText, SkeletonDisplayText, Modal } from '@shopify/polaris';
import { RefreshIcon, LayoutColumns3Icon, DataTableIcon } from '@shopify/polaris-icons';
import OrdersIndexTable from './OrdersIndexTable';
import KanbanBoard from './KanbanBoard';
import OrderDetails from './OrderDetails';

const OrdersPage = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedView, setSelectedView] = useState(0); // 0 para IndexTable, 1 para KanbanBoard
  const [orders, setOrders] = useState([]);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleSyncOrders = useCallback(async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/sync-orders', { method: 'POST' });
      if (response.ok) {
        await fetchOrders(); // Después de sincronizar, actualiza las órdenes
      } else {
        console.error('Error al sincronizar órdenes: ', response.statusText);
      }
    } catch (error) {
      console.error('Error syncing orders:', error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'Órdenes - Sharkletas';
    fetchOrders(); // Cargar órdenes al montar el componente

    return () => {
      document.title = 'Sharkletas';
    };
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await fetch('https://tracking-app-backend-iab9.onrender.com/api/orders?page=1');
      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  }, []);

  // Función para mostrar el modal de detalles de la orden
  const showOrderDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const viewTabs = [
    {
      id: 'table-view',
      content: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Icon source={DataTableIcon} />
          <span style={{ marginLeft: '8px' }}>Tabla</span>
        </div>
      ),
      accessibilityLabel: 'Tabla',
      panelID: 'table-view-content',
    },
    {
      id: 'kanban-view',
      content: (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Icon source={LayoutColumns3Icon} />
          <span style={{ marginLeft: '8px' }}>Kanban</span>
        </div>
      ),
      accessibilityLabel: 'Kanban',
      panelID: 'kanban-view-content',
    },
  ];

  return (
    <Page
      title="Órdenes"
      fullWidth
      primaryAction={
        <Button
          onClick={handleSyncOrders}
          primary
          icon={RefreshIcon}
          disabled={isSyncing}
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Órdenes'}
        </Button>
      }
    >
      <Layout>
        <Layout.Section>
          <Tabs tabs={viewTabs} selected={selectedView} onSelect={setSelectedView}>
            <div>
              {selectedView === 0 ? (
                isSyncing ? (
                  <SkeletonPage title="Sincronizando órdenes...">
                    <SkeletonDisplayText size="small" />
                    <SkeletonBodyText lines={3} />
                  </SkeletonPage>
                ) : (
                  <OrdersIndexTable isSyncing={isSyncing} orders={orders} onShowOrderDetails={showOrderDetailsModal} />
                )
              ) : (
                <KanbanBoard isSyncing={isSyncing} orders={orders} />
              )}
            </div>
          </Tabs>
          {isSyncing && <div style={{ textAlign: 'center', marginTop: '20px' }}><Spinner size="large" /></div>}
        </Layout.Section>
      </Layout>      
        {showOrderDetails && (
          <Modal
            open={showOrderDetails}
            onClose={() => setShowOrderDetails(false)}
            title={`Detalles de la Orden #${selectedOrder ? selectedOrder.shopifyOrderNumber : ''}`}
            large
          >
            <Modal.Section>
              <OrderDetails order={selectedOrder} onClose={() => setShowOrderDetails(false)} />
            </Modal.Section>
          </Modal>
        )}
    </Page>
  );
};

export default OrdersPage;
import React, { useState, useEffect, useCallback } from 'react';
import { Page, Layout, Button, Icon, Tabs, Spinner, SkeletonPage, SkeletonBodyText, SkeletonDisplayText } from '@shopify/polaris';
import { RefreshIcon } from '@shopify/polaris-icons';
import OrdersIndexTable from './OrdersIndexTable';
import KanbanBoard from './KanbanBoard';

const OrdersPage = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedView, setSelectedView] = useState(0); // 0 para IndexTable, 1 para KanbanBoard
  const [orders, setOrders] = useState([]);

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

  const viewTabs = [
    {
      id: 'table-view',
      content: 'Vista de Tabla',
      accessibilityLabel: 'Vista de Tabla',
      panelID: 'table-view-content',
    },
    {
      id: 'kanban-view',
      content: 'Vista Kanban',
      accessibilityLabel: 'Vista Kanban',
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
                  <OrdersIndexTable isSyncing={isSyncing} orders={orders} />
                )
              ) : (
                <KanbanBoard isSyncing={isSyncing} orders={orders} />
              )}
            </div>
          </Tabs>
          {isSyncing && <div style={{ textAlign: 'center', marginTop: '20px' }}><Spinner size="large" /></div>}
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default OrdersPage;
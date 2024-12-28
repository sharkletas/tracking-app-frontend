// Import necessary components and icons from Shopify Polaris
import { Page, Layout, Button, Icon, Spinner, SkeletonPage, SkeletonBodyText, SkeletonDisplayText } from '@shopify/polaris';
import { RefreshIcon } from '@shopify/polaris-icons';
import React, { useState } from 'react';
import OrdersIndexTable from './OrdersIndexTable';

const OrdersPage = () => {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSyncOrders = async () => {
        setIsSyncing(true);

        try {
            // Trigger the CRON job or API call to sync orders
            await fetch('/api/sync-orders', { method: 'POST' });
        } catch (error) {
            console.error('Error syncing orders:', error);
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <Page
            title="Orders"
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
                    {isSyncing ? (
                        <SkeletonPage title="Synchronizing orders...">
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText lines={3} />
                        </SkeletonPage>
                    ) : (
                        <OrdersIndexTable isSyncing={isSyncing} /> // Replace this with the actual table component showing orders
                    )}

                    {isSyncing && <div style={{ textAlign: 'center', marginTop: '20px' }}><Spinner size="large" /></div>}
                </Layout.Section>
            </Layout>
        </Page>
    );
};

export default OrdersPage;

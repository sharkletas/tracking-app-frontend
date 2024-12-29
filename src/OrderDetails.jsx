import React from 'react';
import { Page, Layout, SkeletonPage, SkeletonBodyText, SkeletonDisplayText } from '@shopify/polaris';

const OrderDetails = ({ match }) => {
    const orderId = match.params.id; // Asume que usas react-router para la navegación

    return (
        <Page title={`Detalles de la Orden #${orderId}`}>
            <Layout>
                <Layout.Section>
                    <SkeletonPage primaryAction secondaryActions={2}>
                        <SkeletonDisplayText size="large" />
                        <SkeletonBodyText lines={10} />
                    </SkeletonPage>
                </Layout.Section>
            </Layout>
        </Page>
    );
};

export default OrderDetails;
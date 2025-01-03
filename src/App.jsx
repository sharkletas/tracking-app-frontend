import React, { useState, useCallback, useEffect } from 'react';
import {
    AppProvider,
    Frame,
    Navigation,
    Page,
    TopBar,
    ActionList,
    Icon,
    Badge,
    Toast
} from '@shopify/polaris';
import {
    OrderIcon,
    PackageIcon,
    ProductIcon,
    PaintBrushRoundIcon,
    StatusActiveIcon,
    HomeIcon,
    DatabaseIcon,
    DataPresentationIcon,
    RefreshIcon
} from '@shopify/polaris-icons';
import logo from './assets/logo.png';
import '@shopify/polaris/build/esm/styles.css';
import OrdersPage from './OrdersPage'; // Importar el componente

function App() {
    const [selected, setSelected] = useState('home');
    const [pendingOrders, setPendingOrders] = useState(15); // Label de órdenes pendientes (simulación)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');

    // Estado para almacenar el estado del backend
    const [backendStatus, setBackendStatus] = useState('Cargando...');
    const [toastProps, setToastProps] = useState({ content: '', error: false, active: false });

    // Llamada al backend para verificar el estado
    const API_URL = 'https://tracking-app-backend-iab9.onrender.com';

    const showToast = useCallback((options) => {
        setToastProps({
            content: options.content,
            error: options.error || false,
            active: true
        });
    }, []);

    const handleToastDismiss = useCallback(() => {
        setToastProps(prev => ({ ...prev, active: false }));
    }, []);

    useEffect(() => {
        const fetchBackendStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/health`);
                const data = await response.text();
                setBackendStatus(data === 'Servidor activo y saludable' ? 'Online' : 'Offline');
            } catch (error) {
                console.error('Error al conectar con el backend:', error);
                setBackendStatus('Offline');
                showToast({ content: 'Problemas de conexión con el servidor', error: true });
            }
        };

        const interval = setInterval(fetchBackendStatus, 60000); // Actualiza cada minuto
    
        fetchBackendStatus(); // Ejecuta inmediatamente
    
        return () => clearInterval(interval); // Limpia el intervalo al desmontar
    }, [showToast]);

    const toggleIsUserMenuOpen = useCallback(
        () => setIsUserMenuOpen((open) => !open),
        []
    );

    const handleSearchChange = useCallback((value) => {
        setSearchValue(value);
        setIsSearchActive(value.length > 0);
    }, []);

    const handleSearchResultsDismiss = useCallback(() => {
        setIsSearchActive(false);
        setSearchValue('');
    }, []);

    const logoMarkup = {
        topBarSource: logo,
        accessibilityLabel: 'Sharkletas',
        url: '#',
        width: 220,
        height: 30,
    };

    const userMenuMarkup = (
        <TopBar.UserMenu
            actions={[
                {
                    items: [{ content: 'Ir a Shopify', onAction: () => window.open('https://admin.shopify.com/store/2b636b-a7', '_blank') }],
                },
                {
                    items: [{ content: 'Cambiar Contraseña', onAction: () => alert('Contraseña actualizada') }],
                },
                {
                    items: [{ content: 'Cerrar Sesión', onAction: () => alert('Sesión cerrada') }],
                },
            ]}
            name="Admin"
            initials="A"
            open={isUserMenuOpen}
            onToggle={toggleIsUserMenuOpen}
        />
    );

    const searchFieldMarkup = (
        <TopBar.SearchField
            onChange={handleSearchChange}
            value={searchValue}
            placeholder="Buscar (número de orden o tracking)"
            showFocusBorder
        />
    );

    const searchResultsMarkup = isSearchActive ? (
        <ActionList
            items={[
                { content: 'Buscar número de orden' },
                { content: 'Buscar tracking number' },
            ]}
        />
    ) : null;

    const topBarMarkup = (
        <TopBar
            userMenu={userMenuMarkup}
            searchResultsVisible={isSearchActive}
            searchField={searchFieldMarkup}
            searchResults={searchResultsMarkup}
            onSearchResultsDismiss={handleSearchResultsDismiss}
        />
    );

    const navigationMarkup = (
        <Navigation location="/">
            <Navigation.Section
                items={[
                    {
                        label: 'Inicio',
                        icon: HomeIcon,
                        onClick: () => setSelected('home'),
                        selected: selected === 'home',
                    },
                    {
                        label: 'Órdenes',
                        icon: OrderIcon,
                        onClick: () => setSelected('orders'),
                        selected: selected === 'orders',
                    },
                    {
                        label: 'Paquetes',
                        icon: PackageIcon,
                        onClick: () => setSelected('packages'),
                        selected: selected === 'packages',
                    },
                    {
                        label: 'Productos',
                        icon: ProductIcon,
                        onClick: () => setSelected('products'),
                        selected: selected === 'products',
                    },
                    {
                        label: 'Reportes',
                        icon: DataPresentationIcon,
                        onClick: () => setSelected('reports'),
                        selected: selected === 'reports',
                    },
                    {
                        label: 'Página de Seguimiento',
                        icon: PaintBrushRoundIcon,
                        onClick: () => setSelected('trackingPage'),
                        selected: selected === 'trackingPage',
                    },
                    {
                        label: 'Status',
                        icon: StatusActiveIcon,
                        onClick: () => setSelected('status'),
                        selected: selected === 'status',
                    },
                ]}
            />
            {/* Footer del menú para el estado del servidor */}
            <div
                style={{
                    width: '100%', // Asegura que el div ocupe todo el ancho
                    padding: '1rem',
                    textAlign: 'center',
                    borderTop: '1px solid #e0e0e0',
                    backgroundColor: '#f9fafb',
                    marginTop: 'auto', // Empuja el footer hacia abajo
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon source={DatabaseIcon} style={{ marginRight: '0.5rem' }} />
                    <p style={{ margin: '0 0.5rem', color: '#202223' }}>Server Status:</p>
                    <Badge tone={backendStatus === 'Online' ? 'success' : (backendStatus === 'Offline' ? 'critical' : 'subdued')} progress={backendStatus === 'Online' ? 'complete' : (backendStatus === 'Offline' ? 'incomplete' : undefined)}>
                        {backendStatus}
                    </Badge>
                </div>
            </div>
        </Navigation>
    );

    const pageContent = {
        home: <p>Esta es la página de inicio.</p>,
        orders: <OrdersPage />, // Vista de Órdenes integrada
        packages: <p>Esta es la página de Paquetes.</p>,
        products: <p>Esta es la página de Productos.</p>,
        reports: <p>Esta es la página de Reportes.</p>,
        trackingPage: <p>Esta es la página de Seguimiento.</p>,
        status: <p>Esta es la página de Status</p>,
    };

    return (
        <AppProvider>
            <Frame
                topBar={topBarMarkup}
                navigation={navigationMarkup}
                logo={logoMarkup}
            >
                <Page title={selected === 'orders' ? '' : selected.toUpperCase()}>
                    {pageContent[selected]}
                </Page>
                    {toastProps.active && (
                        <Toast content={toastProps.content} error={toastProps.error} onDismiss={handleToastDismiss} />
                    )}
            </Frame>
        </AppProvider>
    );
}

export default App;

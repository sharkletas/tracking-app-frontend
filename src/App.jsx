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
} from '@shopify/polaris-icons';
import logo from './assets/logo.png';
import '@shopify/polaris/build/esm/styles.css';

  function App() {
    const [selected, setSelected] = useState('home');
    const [pendingOrders, setPendingOrders] = useState(15); // Label de órdenes pendientes (simulación)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchValue, setSearchValue] = useState('');

  // Estado para almacenar el estado del backend
  const [backendStatus, setBackendStatus] = useState('Cargando...');

  // Llamada al backend para verificar el estado
  const API_URL = 'https://tracking-app-backend-iab9.onrender.com';

  useEffect(() => {
    const fetchBackendStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        const data = await response.text();
        setBackendStatus(data === 'Servidor activo y saludable' ? 'Online' : 'Offline');
      } catch (error) {
        console.error('Error al conectar con el backend:', error);
        setBackendStatus('Offline');
      }
    };

    fetchBackendStatus();
  }, []);

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
            label: 'Home',
            icon: HomeIcon,
            onClick: () => setSelected('home'),
            selected: selected === 'home',
          },
          {
            label: 'Órdenes',
            icon: OrderIcon,
            badge: pendingOrders.toString(),
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
        ]}
      />
      {/* Footer del menú para el estado del servidor */}
      <div
        style={{
          marginTop: 'auto',
          padding: '1rem',
          textAlign: 'center',
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#f9fafb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Icon source={DatabaseIcon} />
          <p style={{ margin: '0 0.5rem', color: '#202223' }}>Server Status:</p>
          <Badge
            tone={backendStatus === 'Online' ? 'success' : 'critical'}
          >
            {backendStatus}
          </Badge>
        </div>
      </div>
    </Navigation>
  );

  const pageContent = {
    home: <p>Esta es la página de inicio.</p>,
    orders: <p>Esta es la página de Órdenes.</p>,
    packages: <p>Esta es la página de Paquetes.</p>,
    products: <p>Esta es la página de Productos.</p>,
    reports: <p>Esta es la página de Reportes.</p>,
    trackingPage: <p>Esta es la página de Seguimiento.</p>,
    };

  return (
    <AppProvider>
      <Frame
        topBar={topBarMarkup}
        navigation={navigationMarkup}
        logo={logoMarkup}
      >
        <Page title={selected.toUpperCase()}>{pageContent[selected]}</Page>
      </Frame>
    </AppProvider>
  );
}

export default App;

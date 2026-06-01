/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './lib/StoreContext';

import Home from './pages/Home';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Products from './pages/admin/Products';
import Orders from './pages/admin/Orders';
import Quotes from './pages/admin/Quotes';
import Catalogues from './pages/admin/Catalogues';
import CatalogueDetail from './pages/admin/CatalogueDetail';
import CatalogueWizard from './pages/admin/CatalogueWizard';
import TemplateCenter from './pages/admin/TemplateCenter';
import Buyers from './pages/admin/Buyers';
import Settings from './pages/admin/Settings';
import CRM from './pages/admin/CRM';

import BuyerLayout from './components/layout/BuyerLayout';
import Storefront from './pages/buyer/Storefront';
import ProductDetail from './pages/buyer/ProductDetail';
import Cart from './pages/buyer/Cart';
import QuoteView from './pages/buyer/QuoteView';

import TemplatePublicView from './pages/public/TemplatePublicView';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/templates/:id" element={<TemplatePublicView />} />
          <Route path="/quote/:quoteId" element={<QuoteView />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="catalogues" element={<Catalogues />} />
            <Route path="catalogues/new" element={<CatalogueWizard />} />
            <Route path="catalogues/:id" element={<CatalogueDetail />} />
            <Route path="buyers" element={<Buyers />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="templates" element={<TemplateCenter />} />
            <Route path="settings" element={<Settings />} />
            <Route path="crm" element={<CRM />} />
          </Route>
          
          {/* Buyer Routes */}
          <Route path="/store" element={<BuyerLayout />}>
            <Route index element={<Storefront />} />
            <Route path="c/:catalogueId" element={<Storefront />} />
            <Route path="product/:id" element={<ProductDetail />} />
            <Route path="cart" element={<Cart />} />
          </Route>

          {/* Direct Alternate Shared Catalogue Routes */}
          <Route path="/catalogue/:catalogueId" element={<BuyerLayout />}>
            <Route index element={<Storefront />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { ShopPage } from './features/shop/ShopPage';
import { CartProvider } from './features/cart/context/CartContext';
import { CartModal } from './features/cart/components/CartModal';

const App: React.FC = () => {
  return (
    // CartProvider로 전체 앱을 감싸야 하위 어디서든 useCartContext() 사용 가능
    <CartProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-surface dark:bg-slate-950 transition-colors">
          <Header />
          <main className="flex-grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full">
            <Routes>
              <Route path="/" element={<ShopPage />} />
              <Route path="/Dashboard" element={<DashboardPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        {/* Drawer는 페이지 밖에 렌더. 어떤 페이지에서도 열릴 수 있도록 라우터 안, 최상단에 배치 */}
        <CartModal />
      </BrowserRouter>
    </CartProvider>
  );
};

export default App;


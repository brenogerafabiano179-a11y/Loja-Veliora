import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { Toaster } from "sonner";
import { StoreProvider } from "@/context/StoreContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { CartDrawer } from "@/components/cart/CartDrawer";
import Home from "@/pages/Home";
import CollectionPage from "@/pages/CollectionPage";
import ProductPage from "@/pages/ProductPage";
import Wishlist from "@/pages/Wishlist";
import Checkout from "@/pages/Checkout";
import OrderConfirmed from "@/pages/OrderConfirmed";
import NotFound from "@/pages/NotFound";

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 120);
      return () => clearTimeout(t);
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const location = useLocation();
  return (
    <StoreProvider>
      <ScrollManager />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
              <Routes location={location}>
                <Route path="/" element={<Home />} />
                <Route path="/loja" element={<CollectionPage />} />
                <Route path="/loja/:categoria" element={<CollectionPage />} />
                <Route path="/produto/:slug" element={<ProductPage />} />
                <Route path="/favoritos" element={<Wishlist />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/pedido-confirmado" element={<OrderConfirmed />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
      <CartDrawer />
      <SearchOverlay />
      <Toaster position="top-center" toastOptions={{ style: { borderRadius: "0", fontFamily: "Archivo, sans-serif", border: "1px solid #E4E2DC", fontSize: "13px" } }} />
    </StoreProvider>
  );
}

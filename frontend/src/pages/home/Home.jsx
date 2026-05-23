import { useHome } from "../../hooks/home/useHome";
import Navbar from "../../components/home/Navbar";
import Hero from "../../components/home/Hero";
import Catalog from "../../components/home/Catalog";
import PromoBanner from "../../components/home/PromoBanner";
import Footer from "../../components/home/Footer";
import Toast from "../../components/home/Toast";
import "./Home.css";

export default function Home() {
  const {
    search, setSearch,
    activeFilter, setFilter,
    toast,
    filtered,
    categories,
    loading,
    stats,
    addToCart,
    navigate,
  } = useHome();

  return (
    <>
      <Navbar
        search={search}
        setSearch={setSearch}
        activeFilter={activeFilter}
        setFilter={setFilter}
        navigate={navigate}
      />
      <Hero navigate={navigate} stats={stats} />
      <Catalog
        filtered={filtered}
        activeFilter={activeFilter}
        setFilter={setFilter}
        addToCart={addToCart}
        categories={categories}
        loading={loading}
      />
      <PromoBanner navigate={navigate} />
      <Footer />
      {toast && <Toast message={toast} />}
    </>
  );
}

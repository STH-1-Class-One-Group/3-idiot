import React, { useState } from 'react';
import { SearchBar } from '../../components/common/SearchBar';
import { ProductCard } from './components/ProductCard';
import { useProducts } from './hooks/useProducts';
import { useProductSearch } from './hooks/useProductSearch';
import type { Product } from './types';

export const ShopPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const pageSize = 8;

  const { products, loading, error, totalCount } = useProducts(page, pageSize);
  const { allProducts } = useProductSearch();

  const totalPages = Math.ceil(totalCount / pageSize);


  const handleNextPage = () => {
    if (page < totalPages) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <>
      <section className="mx-auto mb-10 max-w-2xl px-0 sm:mb-14">
        <SearchBar
          searchType="food"
          placeholder="찾으시는 식품이나 상품명을 입력하세요"
          localItems={allProducts}
          searchKeys={['name']}
          onSearchSelect={(item) => setSelectedProduct(item)}
        />
      </section>

      <section className="mb-10 text-center sm:mb-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="mb-4 text-3xl font-extrabold tracking-tighter text-on-surface dark:text-white sm:text-4xl lg:text-5xl">
            밀리터리 푸드 & 군것질 보관함
          </h1>
          <p className="text-base leading-relaxed text-on-surface-variant dark:text-slate-400 sm:text-lg">
            엄격한 기준을 통과한 고품질 군용 식품들을 만나보세요. 모든 품목은 현지 직송으로 공수되어 최상의 상태를 유지합니다.
          </p>
        </div>
      </section>

      <section className="mb-12 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-8">
        {selectedProduct ? (
          <ProductCard key={selectedProduct.id} product={selectedProduct} />
        ) : error ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-center py-20">
            <span className="text-error">상품 로드 오류: {error}</span>
          </div>
        ) : products.length > 0 ? (
          products.map((product) => <ProductCard key={product.id} product={product} />)
        ) : loading ? (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-center py-20">
            <span className="text-on-surface-variant dark:text-slate-400">상품을 불러오는 중...</span>
          </div>
        ) : (
          <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex justify-center py-20">
            <span className="text-on-surface-variant dark:text-slate-400">판매 중인 상품이 없습니다.</span>
          </div>
        )}
      </section>

      {!selectedProduct && loading && products.length > 0 && (
        <section className="flex justify-center mb-8">
          <span className="text-sm text-on-surface-variant dark:text-slate-400">상품을 더 불러오는 중...</span>
        </section>
      )}

      {!selectedProduct && totalPages > 0 && (
        <section className="mt-8 flex items-center justify-center gap-4 sm:gap-6">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${page === 1 ? 'cursor-not-allowed text-outline-variant' : 'text-on-surface-variant hover:bg-surface-container-high dark:text-slate-400 dark:hover:bg-slate-800'}`}
          >
            <span className="material-symbols-outlined" translate="no">chevron_left</span>
          </button>
          <div className="text-xs font-medium tracking-[0.24em] text-on-surface-variant dark:text-slate-400 sm:text-sm">
            {page} <span className="mx-2 text-outline-variant dark:text-slate-600">/</span> {totalPages}
          </div>
          <button
            onClick={handleNextPage}
            disabled={page === totalPages}
            className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${page === totalPages ? 'cursor-not-allowed text-outline-variant' : 'text-on-surface-variant hover:bg-surface-container-high dark:text-slate-400 dark:hover:bg-slate-800'}`}
          >
            <span className="material-symbols-outlined" translate="no">chevron_right</span>
          </button>
        </section>
      )}
    </>
  );
};

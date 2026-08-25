import type { Product } from '@/data/types';
import { formatPrice } from '@/lib/format';
import { EXTERNAL_LINK_PROPS } from '@/lib/constants';

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="card">
      <div className="card__head">
        <img className="card__icon" src={product.icon} alt={product.brand} width={68} height={68} loading="lazy" />
        <div>
          <h3 className="card__name">{product.name}</h3>
          <span className="card__share">최대 {product.maxShare}인 공유</span>
        </div>
      </div>
      <p className="card__price">
        <span className="card__from">월</span> {formatPrice(product.fromUsd)}~
      </p>
      <ul className="card__features">
        {product.features.slice(0, 3).map((f, i) => <li key={i}>{f}</li>)}
      </ul>
      <a className="card__cta" {...EXTERNAL_LINK_PROPS} aria-label={`${product.name} 최저가로 보기`}>
        최저가로 보기 →
      </a>
    </article>
  );
}

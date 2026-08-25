import { EXTERNAL_LINK_PROPS } from '@/lib/constants';
import { CouponBar } from './CouponBar';

export function Hero() {
  return (
    <header className="hero">
      <h1 className="hero__title">프리미엄 구독,<br/>최대 90% 저렴하게</h1>
      <p className="hero__sub">넷플릭스·ChatGPT·유튜브 등 25종 공유구독을 최저가로. 자동배송·환불보증.</p>
      <CouponBar />
      <a className="hero__cta" {...EXTERNAL_LINK_PROPS}>지금 최저가 보러가기 →</a>
    </header>
  );
}

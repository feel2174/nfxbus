import { EXTERNAL_LINK_PROPS, COUPON } from '@/lib/constants';
export function Footer() {
  return (
    <footer className="footer">
      <a className="footer__cta" {...EXTERNAL_LINK_PROPS}>네픽스버스에서 최저가 보기 (쿠폰 {COUPON}) →</a>
      <p className="footer__disclosure">
        본 페이지는 네픽스버스 공식 사이트가 아니며, 제휴(어필리에이트) 링크를 포함합니다.
        구매 시 운영자가 수수료를 받을 수 있고, 가격·배송·환불·정책은 전적으로 네픽스버스 기준을 따릅니다.
        각 서비스 로고는 식별 목적으로만 사용됩니다.
      </p>
      <p className="footer__copy">© {new Date().getFullYear()} 네픽스버스 할인코</p>
    </footer>
  );
}

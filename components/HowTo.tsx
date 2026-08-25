import { COUPON } from '@/lib/constants';
const STEPS = [
  { n: 1, t: '상품 선택', d: '원하는 구독을 고르고 네픽스버스로 이동' },
  { n: 2, t: `쿠폰 ${COUPON} 입력`, d: '결제 시 쿠폰란에 입력해 10% 추가할인' },
  { n: 3, t: '즉시 수령', d: '자동배송으로 계정/초대를 바로 받기' },
];
export function HowTo() {
  return (
    <section className="howto">
      <h2 className="sec-title">이용 방법</h2>
      <ol className="howto__list">
        {STEPS.map(s => (
          <li key={s.n} className="howto__step">
            <span className="howto__num">{s.n}</span>
            <strong>{s.t}</strong><p>{s.d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

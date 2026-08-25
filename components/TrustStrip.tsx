const ITEMS = [
  { t: '자동 즉시배송', d: '결제 후 바로 수령' },
  { t: '24시간 지원', d: '실시간 채팅 상담' },
  { t: '환불 보증', d: '문제 시 환불' },
  { t: '25종 라인업', d: 'AI·스트리밍·생산성' },
];
export function TrustStrip() {
  return (
    <section className="trust">
      {ITEMS.map((i) => (
        <div key={i.t} className="trust__item">
          <strong>{i.t}</strong><span>{i.d}</span>
        </div>
      ))}
    </section>
  );
}

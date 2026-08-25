const QA = [
  { q: '공유구독은 안전한가요?', a: '네픽스버스는 자동배송·환불보증·24시간 지원을 제공합니다. 결제/정책은 네픽스버스 기준을 따릅니다.' },
  { q: '결제는 어떻게 하나요?', a: '상품 선택 후 네픽스버스에서 결제합니다. 쿠폰 HY2QCU 입력 시 10% 추가할인이 적용됩니다.' },
  { q: '수령은 얼마나 걸리나요?', a: '대부분 결제 즉시 자동배송됩니다. 일부 상품은 안내된 시간 내 처리됩니다.' },
  { q: '환불이 되나요?', a: '상품별 환불정책은 네픽스버스 기준을 따릅니다. 문제가 있으면 실시간 채팅으로 문의하세요.' },
];
export function FAQ() {
  return (
    <section className="faq">
      <h2 className="sec-title">자주 묻는 질문</h2>
      {QA.map((x, i) => (
        <details key={i} className="faq__item">
          <summary>{x.q}</summary>
          <p>{x.a}</p>
        </details>
      ))}
    </section>
  );
}

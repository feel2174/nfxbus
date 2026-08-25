export type Category = 'ai' | 'streaming' | 'creator' | 'etc';
export type Sku = { label: string; months: number | null; usd: number };
export type Product = {
  id: number;
  name: string;      // 한글 표기명
  brand: string;     // 원 서비스명(영문)
  category: Category;
  fromUsd: number;
  skus: Sku[];
  maxShare: number;
  features: string[];
  icon: string;      // /icons/1.webp
};

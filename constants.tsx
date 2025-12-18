
export const AVAILABLE_CATEGORIES = [
  '空间产品',
  '楼宇IP运营',
  '商企行政服务',
  '中海专属',
  '其他服务'
];

export const SERVICE_TYPES = [
  '空间服务',
  '楼宇IP',
  '商企行政',
  '中海专属'
];

export const PRICING_MODELS = [
  '免费',
  '买断式',
  '订阅式',
  '服务中购买',
  '广告合作',
  '议价'
];

export const FEATURE_TAGS = [
  { name: '热门推荐', color: '#FF3B30', bg: '#FFF1F0' }, // Apple Red
  { name: '新品上线', color: '#34C759', bg: '#F2F9F3' }, // Apple Green
  { name: '限时优惠', color: '#FF9500', bg: '#FFF9F2' }, // Apple Orange
  { name: '免费使用', color: '#007AFF', bg: '#F0F7FF' }, // Apple Blue
  { name: '企业专享', color: '#5856D6', bg: '#F5F5FF' }, // Apple Purple
  { name: '智能推荐', color: '#32ADE6', bg: '#F0FAFF' }, // Apple Sky Blue
  { name: '精选服务', color: '#AF52DE', bg: '#F9F2FF' }, // Apple Lavender
  { name: '高性价比', color: '#FF2D55', bg: '#FFF0F3' }  // Apple Pink
];

export const getTagColor = (name: string) => {
  const tag = FEATURE_TAGS.find(t => t.name === name);
  return tag || { color: '#86868b', bg: '#f5f5f7' };
};

/**
 * 标准化价格显示格式
 */
export const formatServicePrice = (model: string, price: string) => {
  if (model === '免费') return '免费';
  if (model === '议价' || model === '服务中购买') return '面议';
  if (model === '广告合作') return '合作分润';
  
  // 提取数字部分
  const numericPart = price.match(/[\d.]+/)?.[0];
  
  if (!numericPart || numericPart === '0') {
    if (model === '买断式' || model === '订阅式') return '面议';
    return price || model;
  }

  if (model === '订阅式') {
    return `${numericPart}元/月`;
  }
  if (model === '买断式') {
    return `${numericPart}元`;
  }
  
  return price || model;
};

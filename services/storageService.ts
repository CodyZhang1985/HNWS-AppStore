
import { ServiceProduct, FeaturedContent } from '../types';

const DB_NAME = 'HainaWanshangDB_v2';
const DB_VERSION = 1;
const STORE_NAME = 'images';

export class StorageService {
  private static db: IDBDatabase | null = null;

  static async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  static async saveImage(blob: Blob): Promise<string> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const data = { blob, createdAt: new Date().toISOString() };
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result.toString());
      request.onerror = () => reject(request.error);
    });
  }

  static async getImage(id: string): Promise<string> {
    if (!id || typeof id !== 'string') return '';
    
    const trimmedId = id.trim();
    
    if (trimmedId.startsWith('http') || trimmedId.startsWith('data:')) {
      return trimmedId;
    }

    if (trimmedId.toLowerCase().includes('pic/') || trimmedId.toLowerCase().includes('pic\\')) {
      const path = trimmedId.replace(/\\/g, '/');
      return path.startsWith('/') ? path : '/' + path;
    }

    const db = await this.initDB();
    return new Promise((resolve) => {
      try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const numericId = parseInt(trimmedId);
        
        if (isNaN(numericId)) {
          resolve(trimmedId); 
          return;
        }

        const request = store.get(numericId);
        request.onsuccess = () => {
          if (request.result && request.result.blob) {
            resolve(URL.createObjectURL(request.result.blob));
          } else {
            resolve('');
          }
        };
        request.onerror = () => resolve('');
      } catch (e) {
        resolve('');
      }
    });
  }

  static setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static getItem<T>(key: string, defaultValue: T): T {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    try {
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed) && parsed.length === 0) return defaultValue;
      return parsed;
    } catch {
      return defaultValue;
    }
  }

  static getServices(): ServiceProduct[] {
    return this.getItem<ServiceProduct[]>('servicesData', []);
  }

  static saveServices(services: ServiceProduct[]): void {
    this.setItem('servicesData', services);
    window.dispatchEvent(new Event('storage'));
  }

  static getFeatured(): FeaturedContent[] {
    return this.getItem<FeaturedContent[]>('featuredData', []);
  }

  static saveFeatured(featured: FeaturedContent[]): void {
    this.setItem('featuredData', featured);
    window.dispatchEvent(new Event('storage'));
  }

  static seedInitialData() {
    console.log('Checking for initial seed data...');
    let services = this.getServices();
    
    // 如果没有数据，初始化20个服务
    if (services.length === 0) {
      console.log('Seeding initial services...');
      const initialServices: ServiceProduct[] = [
        {
          id: 1,
          title: '海纳智慧通行 2.0',
          description: '深度集成人脸识别与多端联动技术，为办公楼宇提供极速通行方案。系统支持离线识别，即使断网也能确保核心业务不中断。',
          icon: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400',
          caseImages: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000', 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1000'],
          highlights: ['0.3秒极速识别', '无感通行体验', '访客闭环管理'],
          serviceType: '空间服务',
          pricingModel: '订阅式',
          price: '399/月',
          featureTags: ['热门推荐'],
          category: '空间产品',
          isPublished: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '中海科技'
        },
        {
          id: 2,
          title: '万商云控能源中心',
          description: '实时监测楼宇能耗，AI 动态策略调节空调与照明，助力达成碳中和目标。',
          icon: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
          caseImages: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000'],
          highlights: ['能耗实时监控', 'AI 策略节能', '碳中和报告'],
          serviceType: '空间服务',
          pricingModel: '买断式',
          price: '29800',
          featureTags: ['精选服务'],
          category: '空间产品',
          isPublished: true,
          sortOrder: 2,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '海纳云'
        },
        {
          id: 3,
          title: '悦享工位预约系统',
          description: '支持移动端可视化选择工位，优化灵动办公空间利用率。',
          icon: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400',
          caseImages: ['https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1000'],
          highlights: ['可视化选位', '考勤联动', '热力图分析'],
          serviceType: '空间服务',
          pricingModel: '订阅式',
          price: '199/月',
          featureTags: ['新品上线'],
          category: '商企行政服务',
          isPublished: true,
          sortOrder: 3,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '灵动科技'
        },
        {
          id: 4,
          title: '悦享办公咖啡预订',
          description: '楼宇内咖啡厅直供，手机下单，工位直达，尊享高效办公午后时光。',
          icon: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
          caseImages: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1000'],
          highlights: ['免排队下单', '咖啡直达工位', '定期优惠折扣'],
          serviceType: '楼宇IP',
          pricingModel: '服务中购买',
          price: '面议',
          featureTags: ['限时优惠'],
          category: '楼宇IP运营',
          isPublished: true,
          sortOrder: 4,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '中海物业'
        },
        {
          id: 5,
          title: '智慧车场无人值守',
          description: '全时段自动车牌识别，无感支付，彻底解决出入口拥堵。',
          icon: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400',
          caseImages: ['https://images.unsplash.com/photo-1562654501-a0ccc0af3fb1?w=1000'],
          highlights: ['云端坐席呼叫', '秒级抬杆', '月票自动续费'],
          serviceType: '空间服务',
          pricingModel: '买断式',
          price: '15800',
          featureTags: ['高性价比'],
          category: '空间产品',
          isPublished: true,
          sortOrder: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '智慧通行'
        },
        {
          id: 6,
          title: '灵动会议室助手',
          description: 'iPad/看板实时显示会议状态，支持钉钉/企业微信同步预约。',
          icon: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=400',
          caseImages: ['https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=1000'],
          highlights: ['多端联动', '自动延时取消', '设备一键开启'],
          serviceType: '空间服务',
          pricingModel: '订阅式',
          price: '299/月',
          featureTags: ['企业专享'],
          category: '商企行政服务',
          isPublished: true,
          sortOrder: 6,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '灵动空间'
        },
        {
          id: 7,
          title: '楼宇空气质量监测',
          description: '部署在每层的传感器，实时监测 PM2.5, CO2, TVOC 并联动新风。',
          icon: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400',
          caseImages: ['https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=1000'],
          highlights: ['环境实时地图', '新风智能调度', '健康办公报告'],
          serviceType: '空间服务',
          pricingModel: '订阅式',
          price: '1200/年',
          featureTags: ['智能推荐'],
          category: '空间产品',
          isPublished: true,
          sortOrder: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '中海环境'
        },
        {
          id: 8,
          title: '中海物业管家 Pro',
          description: '一站式解决报事报修、停车续费、物品出入证申请等全流程。',
          icon: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400',
          caseImages: ['https://images.unsplash.com/photo-1557426272-fc759fbb7a8d?w=1000'],
          highlights: ['全在线流程', '极速派单', '满意度实时评价'],
          serviceType: '中海专属',
          pricingModel: '免费',
          price: '0',
          featureTags: ['免费使用'],
          category: '中海专属',
          isPublished: true,
          sortOrder: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '中海物业'
        },
        {
          id: 9,
          title: '楼宇全域灵动广告',
          description: '电梯厅及公共区域电子屏幕统一调度，支持程序化投放。',
          icon: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
          caseImages: ['https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1000'],
          highlights: ['一键下发', '分时段投放', '效果分析报告'],
          serviceType: '楼宇IP',
          pricingModel: '广告合作',
          price: '面议',
          featureTags: ['热门推荐'],
          category: '楼宇IP运营',
          isPublished: true,
          sortOrder: 9,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '万商媒介'
        },
        {
          id: 10,
          title: '企业团餐配送助手',
          description: '聚合周边白名单餐厅，统一结算，准时送达企业前台。',
          icon: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
          caseImages: ['https://images.unsplash.com/photo-1526367790999-1150624836a2?w=1000'],
          highlights: ['统一开票', '定制化餐标', '准时化率99%'],
          serviceType: '商企行政',
          pricingModel: '服务中购买',
          price: '面议',
          featureTags: ['限时优惠'],
          category: '商企行政服务',
          isPublished: true,
          sortOrder: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '中海行政'
        },
        {
          id: 11,
          title: '万商会员积分商城',
          description: '打通楼宇内消费，积分可兑换停车券、咖啡券、会议室时长。',
          icon: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400',
          caseImages: ['https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000'],
          highlights: ['多场景积分兑换', '等级特权体系', '节日礼包发放'],
          serviceType: '楼宇IP',
          pricingModel: '免费',
          price: '0',
          featureTags: ['精选服务'],
          category: '楼宇IP运营',
          isPublished: true,
          sortOrder: 11,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '万商运营部'
        },
        {
          id: 12,
          title: '云端资产巡检系统',
          description: '利用传感器及离线巡查App，对配电房、水泵房等重资产进行全寿命周期管理。',
          icon: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
          caseImages: ['https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1000'],
          highlights: ['巡检实时定位', '异常自动预警', '资产价值折旧计算'],
          serviceType: '空间服务',
          pricingModel: '订阅式',
          price: '500/月',
          featureTags: ['新品上线'],
          category: '空间产品',
          isPublished: true,
          sortOrder: 12,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '中海运维'
        },
        {
          id: 13,
          title: '楼宇机器人导引',
          description: '智能移动机器人，提供访客领位、快递收发、楼层巡查功能。',
          icon: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
          caseImages: ['https://images.unsplash.com/photo-1531746790731-6c087fecd05a?w=1000'],
          highlights: ['自主避障', '多机协同', '情感交互'],
          serviceType: '空间服务',
          pricingModel: '买断式',
          price: '38000',
          featureTags: ['热门推荐'],
          category: '空间产品',
          isPublished: true,
          sortOrder: 13,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '海纳机器人'
        },
        {
          id: 14,
          title: '企业福利集采平台',
          description: '为中海进驻企业提供节日贺礼、生日关怀的一站式集采方案。',
          // 修正图标：更换为更符合集采、礼品的视觉
          icon: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
          caseImages: ['https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=1000'],
          highlights: ['大客户价格', '定制化包装', '全国极速发货'],
          serviceType: '商企行政',
          pricingModel: '服务中购买',
          price: '面议',
          featureTags: ['精选服务'],
          category: '商企行政服务',
          isPublished: true,
          sortOrder: 14,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '中海供应链'
        },
        {
          id: 15,
          title: '智慧消防实时告警',
          description: '物联网感烟、感温探头接入云端，秒级推送火警信息至移动端。',
          icon: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=400',
          caseImages: ['https://images.unsplash.com/photo-1563911302283-d2bc129e7570?w=1000'],
          highlights: ['精准到点位', '视频联动确认', '消防演习支撑'],
          serviceType: '空间服务',
          pricingModel: '订阅式',
          price: '88/月',
          featureTags: ['新品上线'],
          category: '空间产品',
          isPublished: true,
          sortOrder: 15,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '中海安全'
        },
        {
          id: 16,
          title: '数字化园区访客系统',
          description: '支持微信提前预约，现场扫码取票或直接刷脸进入。',
          // 修正图标：更换为更符合前台、接待的视觉
          icon: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400',
          caseImages: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1000'],
          highlights: ['流程全线上化', '黑名单拦截', '实时访客热力图'],
          serviceType: '空间服务',
          pricingModel: '免费',
          price: '0',
          featureTags: ['免费使用'],
          category: '空间产品',
          isPublished: true,
          sortOrder: 16,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '中海通行'
        },
        {
          id: 17,
          title: '碳中和足迹计算器',
          description: '企业日常办公能效分析工具，生成ESG合规报告。',
          icon: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400',
          caseImages: ['https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1000'],
          highlights: ['碳审计支持', '节能建议算法', '行业基准对比'],
          serviceType: '空间服务',
          pricingModel: '买断式',
          price: '5000',
          featureTags: ['智能推荐'],
          category: '空间产品',
          isPublished: true,
          sortOrder: 17,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '绿色中海'
        },
        {
          id: 18,
          title: '极速电子合同签署',
          description: '针对商户入驻、办公租赁合同的高效数字化签署工具。',
          icon: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
          caseImages: ['https://images.unsplash.com/photo-1589216532372-2c27bd290c53?w=1000'],
          highlights: ['法律效力保障', '合同存证', '批量催办'],
          serviceType: '商企行政',
          pricingModel: '议价',
          price: '按量计费',
          featureTags: ['企业专享'],
          category: '商企行政服务',
          isPublished: true,
          sortOrder: 18,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '中海法务'
        },
        {
          id: 19,
          title: '智慧党建数字化平台',
          description: '楼宇党群中心展示及党员活动预约一站式平台。',
          // 修正图标：更换为更具政府/组织庄重感的场景
          icon: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400',
          caseImages: ['https://images.unsplash.com/photo-1491975474562-1f4e30bc9468?w=1000'],
          highlights: ['红色地图', '活动管理', '学习资料库'],
          serviceType: '中海专属',
          pricingModel: '免费',
          price: '0',
          featureTags: ['热门推荐'],
          category: '中海专属',
          isPublished: true,
          sortOrder: 19,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '中海党建部'
        },
        {
          id: 20,
          title: '楼宇外墙清洗服务',
          description: '引入先进蜘蛛人作业及无人机清洗技术，确保楼宇外观整洁如新。',
          icon: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
          caseImages: ['https://images.unsplash.com/photo-1541888946425-d81bb19480c5?w=1000'],
          highlights: ['高空作业安全险', '清洗效果承诺', '定期巡查'],
          serviceType: '空间服务',
          pricingModel: '议价',
          price: '面议',
          featureTags: ['精选服务'],
          category: '空间产品',
          isPublished: true,
          sortOrder: 20,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: '中海专业服务'
        }
      ];
      this.saveServices(initialServices);
    } else {
      // 自动修正逻辑：如果数据已存在，但图标URL是旧的/损坏的，进行静默更新
      let needsUpdate = false;
      const updatedServices = services.map(s => {
        if (s.id === 14 && s.icon.includes('photo-1549463591')) {
          needsUpdate = true;
          return { ...s, icon: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' };
        }
        if (s.id === 16 && s.icon.includes('photo-1556761175')) {
          needsUpdate = true;
          return { ...s, icon: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400' };
        }
        if (s.id === 19 && s.icon.includes('photo-14541658337')) {
          needsUpdate = true;
          return { ...s, icon: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400' };
        }
        return s;
      });

      if (needsUpdate) {
        console.log('Detected legacy icon URLs, performing silent update...');
        this.saveServices(updatedServices);
      }
    }

    const featured = this.getFeatured();
    if (featured.length === 0) {
      console.log('Seeding initial featured content...');
      const initialFeatured: FeaturedContent[] = [
        {
          id: 101,
          title: '2025 智慧楼宇升级季',
          description: '中海科技为您提供全方位的办公数字化升级，探索未来空间的无限可能。',
          content: '本专题精选了多款智慧办公核心产品...',
          image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200',
          images: [],
          isPublished: true,
          sortOrder: 1,
          recommendedServices: [1, 2, 7, 13, 17],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 102,
          title: '低碳园区绿色实践',
          description: '通过数字化手段，实现楼宇能源的精细化管控，助力可持续发展。',
          content: '绿色建筑不仅仅是节能，更是智慧...',
          image: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=1200',
          images: [],
          isPublished: true,
          sortOrder: 2,
          recommendedServices: [2, 7, 17],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 103,
          title: '高效办公：空间效率革命',
          description: '解构传统工位，重塑灵动办公，让每一平米都发挥最大价值。',
          content: '现代办公不再局限于固定的桌椅...',
          image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200',
          images: [],
          isPublished: true,
          sortOrder: 3,
          recommendedServices: [3, 6, 1],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 104,
          title: '中海·万商企业服务精选',
          description: '一站式商企管家服务，专注于提升企业行政效率与员工满意度。',
          content: '我们照顾好企业的琐事，企业照顾好业务...',
          image: 'https://images.unsplash.com/photo-1542744094-24638eff58bb?w=1200',
          images: [],
          isPublished: true,
          sortOrder: 4,
          recommendedServices: [8, 10, 14, 18],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 105,
          title: '楼宇IP运营新范式',
          description: '打破物理边界，通过数字化和内容运营，赋予建筑生命力与文化深度。',
          content: '楼宇不仅是水泥，更是社区的载体...',
          image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200',
          images: [],
          isPublished: true,
          sortOrder: 5,
          recommendedServices: [4, 9, 11, 19],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.saveFeatured(initialFeatured);
    }
  }
}

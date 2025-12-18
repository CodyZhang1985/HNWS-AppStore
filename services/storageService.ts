
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
    
    // 1. 外部链接或 Base64
    if (trimmedId.startsWith('http') || trimmedId.startsWith('data:')) {
      return trimmedId;
    }

    // 2. 项目 pic/ 目录路径：保持相对路径，不强制加前缀斜杠
    if (trimmedId.toLowerCase().includes('pic/') || trimmedId.toLowerCase().includes('pic\\')) {
      return trimmedId.replace(/\\/g, '/');
    }

    // 3. 数据库二进制 ID
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
      return (Array.isArray(parsed) && parsed.length === 0) ? defaultValue : parsed;
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
    const services = this.getServices();
    if (services.length === 0) {
      const initialServices: ServiceProduct[] = [
        {
          id: 1,
          title: '海纳智慧通行 2.0',
          description: '深度集成人脸识别与多端联动技术，为办公楼宇提供极速通行方案。',
          icon: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=400',
          caseImages: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=1000'],
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
          description: '实时监测楼宇能耗，AI 动态节能降本。',
          icon: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
          caseImages: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000'],
          highlights: ['能耗实时监控', 'AI 策略节能'],
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
        }
      ];
      this.saveServices(initialServices);
    }

    const featured = this.getFeatured();
    if (featured.length === 0) {
      const initialFeatured: FeaturedContent[] = [
        {
          id: 101,
          title: '2025 智慧楼宇升级季',
          description: '中海科技为您提供全方位的办公数字化升级。',
          content: '本专题精选了多款智慧办公核心产品...',
          image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200',
          images: [],
          isPublished: true,
          sortOrder: 1,
          recommendedServices: [1, 2],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.saveFeatured(initialFeatured);
    }
  }
}

# เอกสารประกอบ MiniAppSDK Plugin

ปลั๊กอิน Vue ที่ให้ความสามารถ SDK สำหรับการสื่อสารกับ Mini App ผ่าน API postMessage

## การติดตั้ง

```javascript
import MiniAppSDK from './miniapp-sdk-plugin';

// ในแอป Vue ของคุณ
app.use(MiniAppSDK, {
  origin: 'https://trusted-domain.com', // ไม่จำเป็น
  provide: true // ไม่จำเป็น - เปิดใช้งานการ inject สำหรับ Composition API
});
```

## การใช้งาน

### ตัวเลือก

| ตัวเลือก  | ประเภท    | ค่าเริ่มต้น | คำอธิบาย |
|---------|---------|---------|-------------|
| origin  | string  | null    | ต้นทางที่เชื่อถือได้สำหรับการสื่อสารผ่าน postMessage |
| provide | boolean | false   | กำหนดว่าจะให้อินสแตนซ์ SDK สำหรับ Composition API หรือไม่ |

### เมธอด

#### `send(action: string, payload?: any): Promise<any>`
ส่งข้อความไปยังหน้าต่างหลักและรอการตอบกลับ

#### `getCurrentUser(): Promise<any>`
รับข้อมูลผู้ใช้ปัจจุบัน

#### `getWallet(): Promise<any>`
รับข้อมูลกระเป๋าเงินของผู้ใช้

#### `addBalance(amount: number): Promise<any>`
เพิ่มยอดเงินเข้าไปในบัญชีผู้ใช้

#### `reduceBalance(amount: number): Promise<any>`
ลดยอดเงินจากบัญชีผู้ใช้

#### `addFreeCredit(amount: number): Promise<any>`
เพิ่มเครดิตฟรีให้กับผู้ใช้

#### `reduceFreeCredit(amount: number): Promise<any>`
ลดเครดิตฟรีจากผู้ใช้

#### `setVip(days: number): Promise<any>`
ตั้งค่าสถานะ VIP ให้กับผู้ใช้

#### `setPromotion(promotionCode: string): Promise<any>`
ใช้รหัสโปรโมชันสำหรับผู้ใช้

#### `getGameTransaction(start: number, limit: number, order: string): Promise<any>`
รับประวัติการทำธุรกรรมเกม

#### `getPaymentTransaction(type: string, start: number, limit: number, order: string): Promise<any>`
รับประวัติการทำธุรกรรมการชำระเงิน

#### `getUserPromotions(start: number, limit: number, order: string): Promise<any>`
รับประวัติโปรโมชันของผู้ใช้

#### `getRanking(type: string, start: number, limit: number): Promise<any>`
รับข้อมูลการจัดอันดับ

### คุณสมบัติ

| คุณสมบัติ     | ประเภท  | คำอธิบาย |
|--------------|-------|-------------|
| currentUser  | any   | ข้อมูลผู้ใช้ปัจจุบัน |
| wallet       | any   | ข้อมูลกระเป๋าเงินผู้ใช้ |

## ตัวอย่าง

### Options API

```javascript
export default {
  methods: {
    async loadUser() {
      try {
        const user = await this.$miniapp.getCurrentUser();
        console.log('ผู้ใช้:', user);
      } catch (error) {
        console.error('ไม่สามารถโหลดข้อมูลผู้ใช้:', error);
      }
    }
  }
}
```

### Composition API

```javascript
import { inject } from 'vue';

export default {
  setup() {
    const miniapp = inject('miniapp');
    
    const loadWallet = async () => {
      try {
        const wallet = await miniapp.getWallet();
        console.log('กระเป๋าเงิน:', wallet);
      } catch (error) {
        console.error('ไม่สามารถโหลดข้อมูลกระเป๋าเงิน:', error);
      }
    };
    
    return { loadWallet };
  }
}
```

## การรองรับ TypeScript

ปลั๊กอินนี้มีการประกาศประเภทสำหรับคุณสมบัติส่วนกลางของ Vue:

```typescript
declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $miniapp: MiniAppSDK;
  }
}
```

## ข้อควรระวังด้านความปลอดภัย

- ควรระบุ `origin` ที่เชื่อถือได้ในสภาพแวดล้อม production เพื่อป้องกันการโจมตีผ่าน postMessage
- ระยะเวลารอคำตอบเริ่มต้นคือ 10 วินาที
- ข้อความจากต้นทางที่ไม่น่าเชื่อถือจะถูกปฏิเสธโดยอัตโนมัติเมื่อระบุ origin ไว้

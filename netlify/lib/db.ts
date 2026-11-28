// 진행 기록 데이터베이스(MongoDB Atlas, 2026-11-28). MONGODB_URI는 Netlify 환경 변수에만 둔다. DB_NAME으로 시험용 데이터베이스를 따로 쓸 수 있다.
import { MongoClient, type Db } from 'mongodb';

let ready: Promise<Db> | undefined;

/** 함수가 다시 불릴 때 연결을 다시 쓴다(따뜻한 실행). 연결에 실패하면 다음 호출에서 다시 시도한다. */
export function db(): Promise<Db> {
  if (!ready) {
    const uri = process.env.MONGODB_URI;
    if (!uri) return Promise.reject(new Error('환경 변수 MONGODB_URI가 없습니다.'));
    const c = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 3 });
    // 연결에 실패하면 그 클라이언트를 닫아 따뜻한 실행에서 쌓이지 않게 한다(Fable 검토 지적 12).
    ready = c.connect().then(x => x.db(process.env.DB_NAME || 'fefw')).catch(e => { ready = undefined; void c.close().catch(() => {}); throw e; });
  }
  return ready;
}

export type ProgressDoc = { _id: string; revision: number; updatedAt: string; data: unknown };
export const PROGRESS_ID = 'main';

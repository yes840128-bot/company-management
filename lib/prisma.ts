// Prisma Client 인스턴스를 생성하고 관리하는 파일
// 이 파일은 데이터베이스와 연결하는 도구를 만들어줍니다.

import { PrismaClient } from '@prisma/client';
import { validateDatabaseConfig } from './db-utils';

// 환경 변수 검증 (프로덕션 환경에서만)
if (process.env.NODE_ENV === 'production') {
  try {
    validateDatabaseConfig();
  } catch (error) {
    console.error('❌ Database configuration error:', error);
  }
}

// Prisma Client를 전역 변수로 저장 (개발 환경에서만)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma Client 인스턴스 생성
// 이미 있으면 재사용하고, 없으면 새로 만듭니다.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'minimal',
  });

// 개발 환경이 아니면 전역 변수에 저장하지 않습니다.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// 데이터베이스 연결 헬퍼 함수 (재시도 로직 포함)
export async function ensureDatabaseConnection(): Promise<void> {
  const maxRetries = 3;
  const delay = 1000;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect();
      return;
    } catch (error) {
      if (i === maxRetries - 1) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 데이터베이스 연결 오류';
        console.error('❌ Database connection failed after retries:', errorMessage);
        throw new Error(`데이터베이스 연결 실패: ${errorMessage}`);
      }
      console.warn(`⚠️ Database connection attempt ${i + 1} failed, retrying in ${delay * (i + 1)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}


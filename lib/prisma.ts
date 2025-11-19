// Prisma Client 인스턴스를 생성하고 관리하는 파일
// 이 파일은 데이터베이스와 연결하는 도구를 만들어줍니다.

import { PrismaClient } from '@prisma/client';

// Prisma Client를 전역 변수로 저장 (개발 환경에서만)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma Client 인스턴스 생성
// 이미 있으면 재사용하고, 없으면 새로 만듭니다.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

// 개발 환경이 아니면 전역 변수에 저장하지 않습니다.
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;


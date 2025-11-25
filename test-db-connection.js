// 데이터베이스 연결 테스트 스크립트
const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 데이터베이스 연결 테스트 시작...\n');
  
  const dbUrl = process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('❌ DATABASE_URL 환경 변수가 설정되지 않았습니다.');
    console.log('\n설정 방법:');
    console.log('1. Neon: https://neon.tech 에서 무료 계정 생성');
    console.log('2. 프로젝트 생성 후 연결 문자열 복사');
    console.log('3. npm run setup:neon 실행');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL이 설정되어 있습니다.');
  console.log('URL 미리보기:', dbUrl.substring(0, 50) + '...\n');
  
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
  
  try {
    console.log('🔄 데이터베이스에 연결 중...');
    await prisma.$connect();
    console.log('✅ 데이터베이스 연결 성공!\n');
    
    // 테이블 존재 확인
    console.log('🔍 데이터베이스 스키마 확인 중...');
    
    try {
      const companyCount = await prisma.company.count();
      console.log(`✅ companies 테이블 확인: ${companyCount}개 레코드`);
    } catch (error) {
      console.log('⚠️ companies 테이블이 없습니다. 마이그레이션이 필요할 수 있습니다.');
    }
    
    try {
      const fileCount = await prisma.file.count();
      console.log(`✅ files 테이블 확인: ${fileCount}개 레코드`);
    } catch (error) {
      console.log('⚠️ files 테이블이 없습니다. 마이그레이션이 필요할 수 있습니다.');
    }
    
    // 간단한 쿼리 테스트
    console.log('\n🧪 쿼리 테스트 중...');
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ 쿼리 테스트 성공!\n');
    
    await prisma.$disconnect();
    console.log('✅ 모든 테스트 통과! 데이터베이스가 정상적으로 작동합니다.');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ 데이터베이스 연결 실패:');
    console.error(error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.log('\n💡 해결 방법:');
      console.log('1. 데이터베이스 서버가 실행 중인지 확인');
      console.log('2. 연결 문자열이 올바른지 확인');
      console.log('3. 방화벽 설정 확인');
    }
    
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

testConnection();


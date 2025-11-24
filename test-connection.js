// 데이터베이스 연결 테스트 스크립트
// 사용법: node test-connection.js

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

  try {
    console.log('🔄 Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 
      process.env.DATABASE_URL.substring(0, 30) + '...' : 'NOT SET');
    
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // 간단한 쿼리 테스트
    const count = await prisma.company.count();
    console.log(`✅ Query test successful! Found ${count} companies.`);
    
    await prisma.$disconnect();
    console.log('✅ Disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error.message);
    
    if (error.message.includes("Can't reach database server")) {
      console.error('\n💡 Tip: Make sure you are using Supabase connection pool URL:');
      console.error('   Format: postgres://...@pooler.xxx.supabase.com:6543/...?pgbouncer=true');
    }
    
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

testConnection();


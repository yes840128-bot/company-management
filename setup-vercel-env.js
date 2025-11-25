// Vercel 환경 변수 자동 설정 스크립트
// 사용법: node setup-vercel-env.js [DATABASE_URL]

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupEnvironment() {
  console.log('🚀 Vercel 환경 변수 자동 설정\n');
  
  // 명령줄 인자로 DATABASE_URL이 제공되었는지 확인
  let databaseUrl = process.argv[2];
  
  if (!databaseUrl) {
    console.log('Supabase 연결 풀 URL이 필요합니다.\n');
    console.log('Supabase에서 연결 풀 URL을 가져오는 방법:');
    console.log('1. https://supabase.com/dashboard 접속');
    console.log('2. 프로젝트 선택 > Settings > Database');
    console.log('3. Connection string > Connection pooling 탭');
    console.log('4. Transaction mode 선택 후 연결 문자열 복사\n');
    
    databaseUrl = await question('DATABASE_URL을 입력하세요: ');
  }
  
  if (!databaseUrl || databaseUrl.trim() === '') {
    console.error('❌ DATABASE_URL이 제공되지 않았습니다.');
    process.exit(1);
  }
  
  databaseUrl = databaseUrl.trim();
  
  // Vercel 로그인 확인
  console.log('\n📋 Vercel 로그인 확인 중...');
  try {
    execSync('vercel whoami', { stdio: 'ignore' });
    console.log('✅ Vercel에 로그인되어 있습니다.\n');
  } catch (error) {
    console.log('⚠️ Vercel에 로그인이 필요합니다.');
    console.log('브라우저에서 인증을 완료하세요...\n');
    try {
      execSync('vercel login', { stdio: 'inherit' });
    } catch (loginError) {
      console.error('❌ 로그인에 실패했습니다.');
      process.exit(1);
    }
  }
  
  // 환경 변수 설정
  console.log('🔧 환경 변수 설정 중...\n');
  
  try {
    // Production 환경
    console.log('Setting DATABASE_URL for Production...');
    execSync(`vercel env add DATABASE_URL production "${databaseUrl}"`, { stdio: 'inherit' });
    console.log('✅ Production 환경 변수 설정 완료\n');
  } catch (error) {
    // 이미 존재하는 경우 업데이트
    console.log('⚠️ 환경 변수가 이미 존재합니다. 업데이트 중...');
    try {
      execSync(`vercel env rm DATABASE_URL production --yes`, { stdio: 'ignore' });
      execSync(`vercel env add DATABASE_URL production "${databaseUrl}"`, { stdio: 'inherit' });
      console.log('✅ Production 환경 변수 업데이트 완료\n');
    } catch (updateError) {
      console.error('❌ 환경 변수 설정 실패:', updateError.message);
    }
  }
  
  try {
    // Preview 환경
    console.log('Setting DATABASE_URL for Preview...');
    execSync(`vercel env add DATABASE_URL preview "${databaseUrl}"`, { stdio: 'inherit' });
    console.log('✅ Preview 환경 변수 설정 완료\n');
  } catch (error) {
    try {
      execSync(`vercel env rm DATABASE_URL preview --yes`, { stdio: 'ignore' });
      execSync(`vercel env add DATABASE_URL preview "${databaseUrl}"`, { stdio: 'inherit' });
      console.log('✅ Preview 환경 변수 업데이트 완료\n');
    } catch (updateError) {
      console.error('❌ Preview 환경 변수 설정 실패');
    }
  }
  
  try {
    // Development 환경
    console.log('Setting DATABASE_URL for Development...');
    execSync(`vercel env add DATABASE_URL development "${databaseUrl}"`, { stdio: 'inherit' });
    console.log('✅ Development 환경 변수 설정 완료\n');
  } catch (error) {
    try {
      execSync(`vercel env rm DATABASE_URL development --yes`, { stdio: 'ignore' });
      execSync(`vercel env add DATABASE_URL development "${databaseUrl}"`, { stdio: 'inherit' });
      console.log('✅ Development 환경 변수 업데이트 완료\n');
    } catch (updateError) {
      console.error('❌ Development 환경 변수 설정 실패');
    }
  }
  
  console.log('🎉 환경 변수 설정이 완료되었습니다!');
  console.log('\n다음 단계:');
  console.log('1. Vercel이 자동으로 재배포를 시작합니다');
  console.log('2. 배포가 완료되면 https://company-management-7pqi.vercel.app/companies 접속');
  console.log('3. 정상 작동하는지 확인하세요\n');
  
  rl.close();
}

setupEnvironment().catch(error => {
  console.error('❌ 오류 발생:', error);
  rl.close();
  process.exit(1);
});


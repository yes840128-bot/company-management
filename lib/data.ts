// 데이터베이스에서 업체 정보를 가져오고 저장하는 함수들
// PostgreSQL 데이터베이스를 사용합니다.
import { Company } from '@/types/company';
import { prisma } from './prisma';

// 모든 업체 조회
export async function getAllCompanies(): Promise<Company[]> {
  // 환경 변수 확인
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
    throw new Error(
      'DATABASE_URL 환경 변수가 설정되지 않았습니다. ' +
      'Vercel 대시보드 > Settings > Environment Variables에서 DATABASE_URL을 설정하세요. ' +
      'Supabase를 사용하는 경우 연결 풀 URL을 사용하세요: ' +
      'postgres://...@pooler.xxx.supabase.com:6543/...?pgbouncer=true'
    );
  }

  try {
    const companies = await prisma.company.findMany({
      orderBy: {
        updatedAt: 'desc', // 최근 수정일 순으로 정렬
      },
    });
  
  // Prisma의 DateTime을 ISO 문자열로 변환
  return companies.map((company: {
    id: string;
    companyName: string;
    businessNumber: string;
    representativeName: string;
    address: string | null;
    businessType: string | null;
    businessItem: string | null;
    creditRating: string | null;
    riskRating: string | null;
    memo: string | null;
    establishedAt: Date | null;
    loanStatus: string | null;
    businessLicensePath: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) => ({
    id: company.id,
    companyName: company.companyName,
    businessNumber: company.businessNumber,
    representativeName: company.representativeName,
    address: company.address || '',
    businessType: company.businessType || '',
    businessItem: company.businessItem || '',
    creditRating: company.creditRating || '',
    riskRating: company.riskRating || '',
    memo: company.memo || '',
    establishedAt: company.establishedAt ? company.establishedAt.toISOString() : null,
    loanStatus: company.loanStatus || '',
    businessLicensePath: company.businessLicensePath || null,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  }));
  } catch (error) {
    console.error('❌ getAllCompanies error:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    
    // 데이터베이스 연결 오류인 경우 더 자세한 메시지 제공
    if (errorMessage.includes("Can't reach database server") || 
        errorMessage.includes("P1001") ||
        errorMessage.includes("connection") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("timeout")) {
      const dbUrl = process.env.DATABASE_URL || 'not set';
      const isSupabase = dbUrl.includes('supabase');
      const isPooler = dbUrl.includes('pooler') || dbUrl.includes('pgbouncer');
      
      let helpfulMessage = '데이터베이스 서버에 연결할 수 없습니다.';
      
      if (isSupabase && !isPooler) {
        helpfulMessage += ' Supabase를 사용하는 경우 연결 풀(Connection Pool) URL을 사용해야 합니다. ' +
          'Supabase 대시보드 > Settings > Database > Connection string > Connection pooling에서 연결 풀 URL을 복사하여 ' +
          'Vercel 환경 변수 DATABASE_URL에 설정하세요.';
      } else if (!isSupabase) {
        helpfulMessage += ' DATABASE_URL 환경 변수를 확인하세요.';
      } else {
        helpfulMessage += ' 데이터베이스 서버가 실행 중인지 확인하세요.';
      }
      
      throw new Error(helpfulMessage);
    }
    
    throw error;
  }
}

// ID로 업체 조회
export async function getCompanyById(id: string): Promise<Company | null> {
  try {
    const company = await prisma.company.findUnique({
      where: { id },
    });

    if (!company) {
      return null;
    }

  // Prisma의 DateTime을 ISO 문자열로 변환
  return {
    id: company.id,
    companyName: company.companyName,
    businessNumber: company.businessNumber,
    representativeName: company.representativeName,
    address: company.address || '',
    businessType: company.businessType || '',
    businessItem: company.businessItem || '',
    creditRating: company.creditRating || '',
    riskRating: company.riskRating || '',
    memo: company.memo || '',
    establishedAt: company.establishedAt ? company.establishedAt.toISOString() : null,
    loanStatus: company.loanStatus || '',
    businessLicensePath: company.businessLicensePath || null,
    createdAt: company.createdAt.toISOString(),
    updatedAt: company.updatedAt.toISOString(),
  };
  } catch (error) {
    console.error('❌ getCompanyById error:', error);
    throw error;
  }
}

// 업체 추가
export async function createCompany(
  companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Company> {
  try {
    const newCompany = await prisma.company.create({
    data: {
      companyName: companyData.companyName,
      businessNumber: companyData.businessNumber,
      representativeName: companyData.representativeName,
      address: companyData.address || null,
      businessType: companyData.businessType || null,
      businessItem: companyData.businessItem || null,
      creditRating: companyData.creditRating || null,
      riskRating: companyData.riskRating || null,
      memo: companyData.memo || null,
      establishedAt: companyData.establishedAt ? new Date(companyData.establishedAt) : null,
      loanStatus: companyData.loanStatus || null,
      businessLicensePath: companyData.businessLicensePath || null,
    },
  });

  return {
    id: newCompany.id,
    companyName: newCompany.companyName,
    businessNumber: newCompany.businessNumber,
    representativeName: newCompany.representativeName,
    address: newCompany.address || '',
    businessType: newCompany.businessType || '',
    businessItem: newCompany.businessItem || '',
    creditRating: newCompany.creditRating || '',
    riskRating: newCompany.riskRating || '',
    memo: newCompany.memo || '',
    establishedAt: newCompany.establishedAt ? newCompany.establishedAt.toISOString() : null,
    loanStatus: newCompany.loanStatus || '',
    businessLicensePath: newCompany.businessLicensePath || null,
    createdAt: newCompany.createdAt.toISOString(),
    updatedAt: newCompany.updatedAt.toISOString(),
  };
  } catch (error) {
    console.error('❌ createCompany error:', error);
    throw error;
  }
}

// 업체 수정
export async function updateCompany(
  id: string,
  companyData: Partial<Omit<Company, 'id' | 'createdAt'>>
): Promise<Company | null> {
  try {
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        companyName: companyData.companyName,
        businessNumber: companyData.businessNumber,
        representativeName: companyData.representativeName,
        address: companyData.address !== undefined ? companyData.address : undefined,
        businessType: companyData.businessType !== undefined ? companyData.businessType : undefined,
        businessItem: companyData.businessItem !== undefined ? companyData.businessItem : undefined,
        creditRating: companyData.creditRating !== undefined ? companyData.creditRating : undefined,
        riskRating: companyData.riskRating !== undefined ? companyData.riskRating : undefined,
        memo: companyData.memo !== undefined ? companyData.memo : undefined,
        establishedAt: companyData.establishedAt !== undefined 
          ? (companyData.establishedAt ? new Date(companyData.establishedAt) : null)
          : undefined,
        loanStatus: companyData.loanStatus !== undefined ? companyData.loanStatus : undefined,
        businessLicensePath: companyData.businessLicensePath !== undefined ? companyData.businessLicensePath : undefined,
      },
    });

    return {
      id: updatedCompany.id,
      companyName: updatedCompany.companyName,
      businessNumber: updatedCompany.businessNumber,
      representativeName: updatedCompany.representativeName,
      address: updatedCompany.address || '',
      businessType: updatedCompany.businessType || '',
      businessItem: updatedCompany.businessItem || '',
      creditRating: updatedCompany.creditRating || '',
      riskRating: updatedCompany.riskRating || '',
      memo: updatedCompany.memo || '',
      establishedAt: updatedCompany.establishedAt ? updatedCompany.establishedAt.toISOString() : null,
      loanStatus: updatedCompany.loanStatus || '',
      businessLicensePath: updatedCompany.businessLicensePath || null,
      createdAt: updatedCompany.createdAt.toISOString(),
      updatedAt: updatedCompany.updatedAt.toISOString(),
    };
  } catch (error) {
    // 업체를 찾을 수 없으면 null 반환
    return null;
  }
}

// 업체 삭제
export async function deleteCompany(id: string): Promise<boolean> {
  try {
    await prisma.company.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    // 업체를 찾을 수 없으면 false 반환
    return false;
  }
}

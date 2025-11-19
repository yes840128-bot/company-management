// 업체 정보 타입 정의
export interface Company {
  id: string;
  companyName: string; // 업체명
  businessNumber: string; // 사업자등록번호
  representativeName: string; // 대표자명
  address: string; // 주소
  businessType: string; // 업태
  businessItem: string; // 종목
  creditRating: string; // 신용등급
  riskRating: string; // 위험등급
  memo: string; // 메모
  establishedAt: string | null; // 설립일
  loanStatus: string; // 기대출 현황
  businessLicensePath: string | null; // 사업자등록증 파일 경로
  createdAt: string; // 생성일시
  updatedAt: string; // 수정일시
}



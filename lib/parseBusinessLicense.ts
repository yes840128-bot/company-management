// 사업자등록증 텍스트에서 정보를 추출하는 함수들

/**
 * 사업자등록증 텍스트에서 정보를 추출하여 객체로 반환
 * @param text 사업자등록증 텍스트
 * @returns 추출된 정보 객체
 */
export function parseBusinessLicenseText(text: string): {
  businessNumber?: string;
  companyName?: string;
  representativeName?: string;
  address?: string;
  businessType?: string;
  businessItem?: string;
  establishedAt?: string | null;
} {
  const result: {
    businessNumber?: string;
    companyName?: string;
    representativeName?: string;
    address?: string;
    businessType?: string;
    businessItem?: string;
    establishedAt?: string | null;
  } = {};

  // 텍스트를 줄 단위로 나누고, trim한 뒤, 빈 줄 제거
  const lines = text.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean);

  // 업체명 추출 패턴
  const namePatterns = [
    /(상\s*호|법인명(?:\(상호\)|\(단체명\))?|상호\(법인명\))\s*[:：]?\s*(.+)$/,
  ];

  // 각 줄을 순회하면서 정보 추출
  for (const line of lines) {
    // 업체명 추출
    if (!result.companyName) {
      for (const pattern of namePatterns) {
        const match = line.match(pattern);
        if (match && match[2]) {
          // 괄호, 불필요한 공백 제거하고 trim
          result.companyName = match[2]
            .replace(/[()]/g, '') // 괄호 제거
            .replace(/\s+/g, ' ') // 여러 공백을 한 칸으로
            .trim();
          break;
        }
      }
    }
  }

  // 대표자명 추출
  let representativeName = '';

  // 전체 텍스트를 한 줄처럼 만들어서 검색
  const flat = text.replace(/\r/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ');

  // 대표자 / 성명 패턴 모두 인식 (공백 포함)
  // "대표자", "대 표 자", "성명", "성 명" 모두 인식
  // 한글 이름 2~4글자만 인식
  const repRegex = /(대표자|대\s*표\s*자|성명|성\s*명)\s*[:：]?\s*([가-힣]{2,4})/;

  const m = flat.match(repRegex);
  if (m && m[2]) {
    representativeName = m[2].trim(); // 예: "육대성"
  }

  if (representativeName) {
    result.representativeName = representativeName;
  }

  // 기존 로직을 fallback으로 사용 (줄 단위로 찾지 못한 경우)
  // 등록번호 또는 사업자등록번호 추출
  if (!result.businessNumber) {
    const businessNumberMatch = text.match(/(?:등록번호|사업자등록번호)\s*[:：]?\s*(\d{3}-\d{2}-\d{5})/);
    if (businessNumberMatch) {
      result.businessNumber = businessNumberMatch[1];
    } else {
      console.log('사업자등록번호를 찾을 수 없습니다.');
    }
  }

  // 업체명 fallback (줄 단위로 찾지 못한 경우)
  if (!result.companyName) {
    const companyNameMatch = text.match(/상호\s*[:：]?\s*([^\n\r]+)/);
    if (companyNameMatch) {
      result.companyName = companyNameMatch[1]
        .replace(/[()]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    } else {
      console.log('상호를 찾을 수 없습니다.');
    }
  }

  // 대표자명 fallback (위 로직으로 찾지 못한 경우)
  if (!result.representativeName) {
    console.log('대표자를 찾을 수 없습니다.');
  }

  // 사업장 소재지 또는 소재지 추출
  const addressMatch = text.match(/(?:사업장\s*소재지|소재지)\s*[:：]?\s*([^\n\r]+)/);
  if (addressMatch) {
    result.address = addressMatch[1].trim();
  } else {
    console.log('사업장 소재지를 찾을 수 없습니다.');
  }

  // 업태 추출
  const businessTypeMatch = text.match(/업태\s*[:：]?\s*([^\n\r]+)/);
  if (businessTypeMatch) {
    result.businessType = businessTypeMatch[1].trim();
  } else {
    console.log('업태를 찾을 수 없습니다.');
  }

  // 종목 추출
  const businessItemMatch = text.match(/종목\s*[:：]?\s*([^\n\r]+)/);
  if (businessItemMatch) {
    result.businessItem = businessItemMatch[1].trim();
  } else {
    console.log('종목을 찾을 수 없습니다.');
  }

  // 설립일 추출 (개업연월일, 개업일, 설립연월일, 설립일)
  // 전체 텍스트를 한 줄로 만들어서 검색
  const flatForDate = text.replace(/\r/g, ' ').replace(/\n/g, ' ').replace(/\s+/g, ' ');
  
  // 개업연월일, 개업일, 설립연월일, 설립일 패턴 인식
  const dateMatch = flatForDate.match(
    /(개업연월일|개업일|설립연월일|설립일)\s*[:：]?\s*(\d{4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일/
  );

  let establishedAt: string | null = null;

  if (dateMatch) {
    const year = dateMatch[2];
    const month = dateMatch[3].padStart(2, '0');
    const day = dateMatch[4].padStart(2, '0');
    // HTML date input용 yyyy-MM-dd 포맷
    establishedAt = `${year}-${month}-${day}`;
  }

  if (establishedAt) {
    result.establishedAt = establishedAt;
  } else {
    console.log('설립일을 찾을 수 없습니다.');
  }

  return result;
}

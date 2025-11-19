// 네이버 CLOVA OCR API 호출 함수
// 이미지 Buffer를 받아서 OCR을 수행하고 전체 텍스트를 반환합니다.

interface ClovaOcrResponse {
  version: string;
  requestId: string;
  timestamp: number;
  images: Array<{
    uid: string;
    name: string;
    inferResult: string;
    message: string;
    fields: Array<{
      valueType: string;
      boundingPoly: {
        vertices: Array<{ x: number; y: number }>;
      };
      inferText: string;
      inferConfidence: number;
      type: string;
      lineBreak: boolean;
    }>;
  }>;
}

/**
 * CLOVA OCR API를 호출하여 이미지에서 텍스트를 추출합니다.
 * @param imageBuffer 이미지 파일의 Buffer
 * @param fileName 파일명 (확장자로 형식 판단)
 * @returns 추출된 전체 텍스트 (rawText)
 */
export async function callClovaOcr(imageBuffer: Buffer, fileName?: string): Promise<string> {
  const ocrUrl = process.env.CLOVA_OCR_URL;
  const ocrSecret = process.env.CLOVA_OCR_SECRET;

  if (!ocrUrl || !ocrSecret) {
    throw new Error('CLOVA OCR 설정이 없습니다. .env.local 파일을 확인해주세요.');
  }

  // 이미지를 base64로 인코딩
  const imageBase64 = imageBuffer.toString('base64');

  // 파일 확장자로 형식 판단
  let format = 'jpg'; // 기본값
  if (fileName) {
    const ext = fileName.toLowerCase().split('.').pop();
    if (ext === 'png') format = 'png';
    else if (ext === 'pdf') format = 'pdf';
    else if (ext === 'jpeg' || ext === 'jpg') format = 'jpg';
  }

  // CLOVA OCR API 요청 body
  const requestBody = {
    version: 'V2',
    requestId: `request-${Date.now()}`,
    timestamp: Date.now(),
    images: [
      {
        format: format,
        name: fileName || 'business-license',
        data: imageBase64,
        url: null,
      },
    ],
  };

  try {
    // CLOVA OCR API 호출
    const response = await fetch(ocrUrl, {
      method: 'POST',
      headers: {
        'X-OCR-SECRET': ocrSecret,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`CLOVA OCR API 호출 실패: ${response.status} - ${errorText}`);
    }

    const result: ClovaOcrResponse = await response.json();

    // OCR 결과에서 전체 텍스트 추출
    let rawText = '';
    
    if (result.images && result.images.length > 0) {
      const image = result.images[0];
      
      if (image.fields && image.fields.length > 0) {
        // fields 배열에서 inferText를 추출하여 전체 텍스트 구성
        rawText = image.fields
          .map((field, index) => {
            const text = field.inferText || '';
            // lineBreak가 true이거나 다음 필드와 거리가 멀면 줄바꿈
            if (field.lineBreak) {
              return text + '\n';
            }
            // 마지막 필드가 아니면 공백 추가
            if (index < image.fields.length - 1) {
              return text + ' ';
            }
            return text;
          })
          .join('');
      }
    }

    return rawText.trim();
  } catch (error) {
    console.error('CLOVA OCR 호출 실패:', error);
    throw error;
  }
}


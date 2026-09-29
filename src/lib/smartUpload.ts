/**
 * Akıllı Dosya Yükleyici (Smart Uploader)
 * Vercel Serverless 4.5MB request body sınırını (`FUNCTION_PAYLOAD_TOO_LARGE`) otomatik aşar.
 * 3.5MB'a kadar normal FormData ile gönderir; 3.5MB - 15MB arası büyük GIF ve görselleri
 * parçalı (chunked) olarak 1.5MB'lık güvenli paketler halinde backend'e aktarır.
 */

export interface UploadResult {
  success: boolean;
  urls: string[];
  url?: string;
  error?: string;
}

export async function smartUploadFile(
  file: File | Blob,
  customName?: string,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  const actualFile =
    file instanceof File ? file : new File([file], customName || 'upload.jpg', { type: file.type || 'image/jpeg' });

  const fileSize = actualFile.size;
  const fileName = actualFile.name || 'image.jpg';
  const mimeType = actualFile.type || 'image/jpeg';

  // 15MB Sınır Kontrolü
  if (fileSize > 15 * 1024 * 1024) {
    return { success: false, urls: [], error: 'Dosya boyutu maksimum 15MB olabilir.' };
  }

  // 1. KÜÇÜK DOSYALAR (<= 3.5MB): Standart Hızlı Yükleme
  if (fileSize <= 3.5 * 1024 * 1024) {
    const formData = new FormData();
    formData.append('files', actualFile);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, urls: [], error: data.error || 'Yükleme başarısız oldu.' };
    }

    if (onProgress) onProgress(100);
    return { success: true, urls: data.urls || [], url: data.urls?.[0] };
  }

  // 2. BÜYÜK DOSYALAR & HAREKETLİ GIFLER (> 3.5MB): Parçalı (Chunked) Yükleme
  try {
    const arrayBuffer = await actualFile.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    
    // Convert to binary string in chunks to avoid call stack overflow
    let binary = '';
    const step = 8192;
    for (let i = 0; i < bytes.length; i += step) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + step)));
    }
    const fullBase64 = btoa(binary);

    const uploadId = `upl_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const chunkSize = 1.5 * 1024 * 1024; // 1.5MB Base64 parçaları (Vercel sınırının çok altında)
    const totalChunks = Math.ceil(fullBase64.length / chunkSize);

    let finalResult: any = null;

    for (let i = 0; i < totalChunks; i++) {
      const chunkBase64 = fullBase64.substring(i * chunkSize, (i + 1) * chunkSize);

      const res = await fetch('/api/upload/chunk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId,
          chunkIndex: i,
          totalChunks,
          chunkBase64,
          filename: fileName,
          mimeType,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, urls: [], error: data.error || `Parça ${i + 1} yüklenirken hata oluştu.` };
      }

      if (onProgress) {
        onProgress(Math.round(((i + 1) / totalChunks) * 100));
      }

      finalResult = data;
    }

    return {
      success: true,
      urls: finalResult?.urls || (finalResult?.url ? [finalResult.url] : []),
      url: finalResult?.url || finalResult?.urls?.[0],
    };
  } catch (err: any) {
    return { success: false, urls: [], error: err.message || 'Parçalı yükleme sırasında hata oluştu.' };
  }
}

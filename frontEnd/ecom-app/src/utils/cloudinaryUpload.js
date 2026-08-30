const apiUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1';

export const getSignature = async () => {
  const url = `${apiUrl}/api/v1/admin/cloudinary/signature`;
  
  // console.log('[getSignature] Hitting URL:', url); 

  const res = await fetch(url, {
    credentials: 'include',
  });

  // console.log('[getSignature] Response status:', res.status); 
  // console.log('[getSignature] Response headers:', res.headers.get('content-type')); 

  // If server returns HTML (404 page, login redirect, etc), catch it here
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await res.text();
    console.error('[getSignature] Raw response (first 200 chars):', text.substring(0, 200));
    throw new Error(`Backend returned ${res.status} (HTML/Not JSON). Check if route exists at: ${url}`);
  }

  const data = await res.json();
  // console.log('[getSignature] Parsed JSON:', data); 

  if (!data || !data.success) {
    throw new Error(data?.message || 'Backend signature response invalid');
  }

  // Validate all required fields exist
  const required = ['signature', 'timestamp', 'apiKey', 'cloudName', 'uploadPreset'];
  const missing = required.filter(key => !data[key]);
  if (missing.length > 0) {
    throw new Error(`Signature response missing fields: ${missing.join(', ')}`);
  }

  return data;
};

export const uploadToCloudinary = async (file, signatureData) => {
  // console.log('signatureData', signatureData)
  const { signature, timestamp, apiKey, cloudName, uploadPreset } = signatureData;
  // console.log(uploadPreset, 'upload preset')

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('upload_preset', uploadPreset);

  const url = `${CLOUDINARY_URL}/${cloudName}/image/upload`;
  // console.log('[uploadToCloudinary] Uploading to:', url);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();


  if (!res.ok) {
    throw new Error(data.error?.message || 'Cloudinary upload failed');
  }

  return {
    public_id: data.public_id,
    url: data.secure_url,
  };
};
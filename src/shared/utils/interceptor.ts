import QRCode from "qrcode";

export const generateQRCode = async (
  address: string,
): Promise<string | null> => {
  try {
    return await QRCode.toDataURL(address, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 10,
    });
  } catch (error) {
    console.error('QR Code generation failed:', error);
    return null; // Return null instead of an empty string for better error handling
  }
};
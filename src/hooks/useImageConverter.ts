import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export interface ConvertedImage {
  id: string;
  originalName: string;
  originalSize: number;
  convertedSize: number;
  downloadUrl: string;
  timestamp: Date;
  quality: number;
  width?: number;
  height?: number;
}

export interface ConversionOptions {
  quality: number;
  width?: number;
  height?: number;
  format: 'jpeg' | 'webp';
}

export const useImageConverter = () => {
  const [isConverting, setIsConverting] = useState(false);
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);

  const convertImage = useCallback(async (
    file: File,
    options: ConversionOptions = { quality: 0.9, format: 'jpeg' }
  ): Promise<ConvertedImage> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        try {
          // Calculate dimensions
          let { width, height } = img;
          
          if (options.width && options.height) {
            width = options.width;
            height = options.height;
          } else if (options.width) {
            height = (img.height * options.width) / img.width;
            width = options.width;
          } else if (options.height) {
            width = (img.width * options.height) / img.height;
            height = options.height;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and convert
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to convert image'));
                return;
              }

              const downloadUrl = URL.createObjectURL(blob);
              const convertedImage: ConvertedImage = {
                id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                originalName: file.name,
                originalSize: file.size,
                convertedSize: blob.size,
                downloadUrl,
                timestamp: new Date(),
                quality: options.quality,
                width,
                height,
              };

              resolve(convertedImage);
            },
            `image/${options.format}`,
            options.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const convertImages = useCallback(async (
    files: File[],
    options: ConversionOptions = { quality: 0.9, format: 'jpeg' }
  ) => {
    setIsConverting(true);
    const results: ConvertedImage[] = [];
    const errors: string[] = [];

    try {
      for (const file of files) {
        try {
          const converted = await convertImage(file, options);
          results.push(converted);
          toast.success(`Converted ${file.name}`);
        } catch (error) {
          const errorMsg = `Failed to convert ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMsg);
          toast.error(errorMsg);
        }
      }

      setConvertedImages(prev => [...prev, ...results]);
      
      if (results.length > 0) {
        toast.success(`Successfully converted ${results.length} image${results.length > 1 ? 's' : ''}`);
      }

      return { results, errors };
    } finally {
      setIsConverting(false);
    }
  }, [convertImage]);

  const downloadImage = useCallback((image: ConvertedImage) => {
    const link = document.createElement('a');
    link.href = image.downloadUrl;
    link.download = image.originalName.replace(/\.[^/.]+$/, '.jpg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${link.download}`);
  }, []);

  const downloadAll = useCallback(() => {
    convertedImages.forEach(image => {
      setTimeout(() => downloadImage(image), 100);
    });
  }, [convertedImages, downloadImage]);

  const clearAll = useCallback(() => {
    convertedImages.forEach(image => {
      URL.revokeObjectURL(image.downloadUrl);
    });
    setConvertedImages([]);
    toast.success('Cleared all converted images');
  }, [convertedImages]);

  return {
    isConverting,
    convertedImages,
    convertImage,
    convertImages,
    downloadImage,
    downloadAll,
    clearAll,
  };
};
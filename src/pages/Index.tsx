import { useState } from 'react';
import { Header } from '@/components/Header';
import { FileUpload } from '@/components/FileUpload';
import { ConversionSettingsPanel, ConversionSettings } from '@/components/ConversionSettings';
import { ConversionResults } from '@/components/ConversionResults';
import { ConversionHistory } from '@/components/ConversionHistory';
import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';
import { useImageConverter } from '@/hooks/useImageConverter';
import { useConversionHistory } from '@/hooks/useLocalStorage';
import { toast } from 'sonner';

const Index = () => {
  const [settings, setSettings] = useState<ConversionSettings>({
    quality: 0.85,
    format: 'jpeg',
    enableResize: false,
    maintainAspectRatio: true,
  });

  const { isConverting, convertedImages, convertImages, downloadImage, downloadAll, clearAll } = useImageConverter();
  const { addToHistory } = useConversionHistory();

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    const conversionOptions = {
      quality: settings.quality,
      format: settings.format,
      width: settings.enableResize ? settings.width : undefined,
      height: settings.enableResize ? settings.height : undefined,
    };

    try {
      const { results, errors } = await convertImages(files, conversionOptions);
      
      // Add successful conversions to history
      results.forEach(result => {
        addToHistory({
          originalName: result.originalName,
          originalSize: result.originalSize,
          convertedSize: result.convertedSize,
          quality: result.quality,
          width: result.width,
          height: result.height,
        });
      });

      if (errors.length > 0) {
        toast.error(`Failed to convert ${errors.length} file${errors.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      toast.error('Conversion failed. Please try again.');
      console.error('Conversion error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Convert PNG to JPG
              <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Instantly & Privately
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Professional PNG to JPG conversion with advanced compression, batch processing, 
              and complete privacy. All conversions happen in your browser.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center">✓ No file size limits</span>
              <span className="flex items-center">✓ Batch conversion</span>
              <span className="flex items-center">✓ 100% private</span>
              <span className="flex items-center">✓ Free forever</span>
            </div>
          </div>
        </section>

        {/* Conversion Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <FileUpload 
              onFilesSelected={handleFilesSelected}
              isConverting={isConverting}
            />
            
            {convertedImages.length > 0 && (
              <ConversionResults
                images={convertedImages}
                onDownload={downloadImage}
                onDownloadAll={downloadAll}
                onClear={clearAll}
              />
            )}
          </div>
          
          <div className="space-y-6">
            <ConversionSettingsPanel
              settings={settings}
              onChange={setSettings}
            />
            
            <ConversionHistory />
          </div>
        </div>

        {/* Features Section */}
        <Features />
      </main>

      <Footer />
    </div>
  );
};

export default Index;

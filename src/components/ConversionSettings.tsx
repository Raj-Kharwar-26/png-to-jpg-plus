import { useState } from 'react';
import { Settings, Sliders, Maximize, Minimize } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface ConversionSettings {
  quality: number;
  format: 'jpeg' | 'webp';
  enableResize: boolean;
  width?: number;
  height?: number;
  maintainAspectRatio: boolean;
}

interface ConversionSettingsProps {
  settings: ConversionSettings;
  onChange: (settings: ConversionSettings) => void;
}

export const ConversionSettingsPanel = ({ settings, onChange }: ConversionSettingsProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateSettings = (partial: Partial<ConversionSettings>) => {
    onChange({ ...settings, ...partial });
  };

  const handleDimensionChange = (dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value) || undefined;
    
    if (settings.maintainAspectRatio && settings.width && settings.height) {
      const aspectRatio = settings.width / settings.height;
      
      if (dimension === 'width' && numValue) {
        updateSettings({
          width: numValue,
          height: Math.round(numValue / aspectRatio)
        });
      } else if (dimension === 'height' && numValue) {
        updateSettings({
          height: numValue,
          width: Math.round(numValue * aspectRatio)
        });
      }
    } else {
      updateSettings({ [dimension]: numValue });
    }
  };

  const presets = [
    { name: 'High Quality', quality: 0.95 },
    { name: 'Standard', quality: 0.85 },
    { name: 'Compressed', quality: 0.65 },
    { name: 'Highly Compressed', quality: 0.45 },
  ];

  return (
    <Card className="p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="font-semibold">Conversion Settings</span>
            </div>
            {isOpen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="space-y-6 mt-4">
          {/* Output Format */}
          <div className="space-y-2">
            <Label htmlFor="format">Output Format</Label>
            <Select
              value={settings.format}
              onValueChange={(value) => updateSettings({ format: value as 'jpeg' | 'webp' })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jpeg">JPEG (.jpg)</SelectItem>
                <SelectItem value="webp">WebP (.webp)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="quality">Quality: {Math.round(settings.quality * 100)}%</Label>
              <span className="text-xs text-muted-foreground">
                {settings.quality >= 0.9 ? 'High' : 
                 settings.quality >= 0.7 ? 'Medium' : 'Low'}
              </span>
            </div>
            <Slider
              id="quality"
              min={0.1}
              max={1}
              step={0.05}
              value={[settings.quality]}
              onValueChange={([value]) => updateSettings({ quality: value })}
              className="w-full"
            />
            
            {/* Quality Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant={Math.abs(settings.quality - preset.quality) < 0.01 ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSettings({ quality: preset.quality })}
                  className="text-xs"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Resize Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-resize">Resize Images</Label>
              <Switch
                id="enable-resize"
                checked={settings.enableResize}
                onCheckedChange={(checked) => updateSettings({ enableResize: checked })}
              />
            </div>

            {settings.enableResize && (
              <div className="space-y-4 p-4 bg-secondary/20 rounded-lg">
                <div className="flex items-center justify-between">
                  <Label htmlFor="aspect-ratio">Maintain Aspect Ratio</Label>
                  <Switch
                    id="aspect-ratio"
                    checked={settings.maintainAspectRatio}
                    onCheckedChange={(checked) => updateSettings({ maintainAspectRatio: checked })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width (px)</Label>
                    <Input
                      id="width"
                      type="number"
                      placeholder="Auto"
                      value={settings.width || ''}
                      onChange={(e) => handleDimensionChange('width', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (px)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="Auto"
                      value={settings.height || ''}
                      onChange={(e) => handleDimensionChange('height', e.target.value)}
                    />
                  </div>
                </div>

                {/* Common Size Presets */}
                <div className="space-y-2">
                  <Label>Common Sizes</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { name: 'HD', width: 1920, height: 1080 },
                      { name: 'Square', width: 1080, height: 1080 },
                      { name: 'Web', width: 1200, height: 800 },
                      { name: 'Mobile', width: 480, height: 800 },
                      { name: 'Avatar', width: 512, height: 512 },
                      { name: 'Thumbnail', width: 256, height: 256 },
                    ].map((preset) => (
                      <Button
                        key={preset.name}
                        variant="outline"
                        size="sm"
                        onClick={() => updateSettings({ 
                          width: preset.width, 
                          height: preset.height,
                          maintainAspectRatio: false
                        })}
                        className="text-xs"
                      >
                        {preset.name}
                        <span className="ml-1 text-muted-foreground">
                          {preset.width}×{preset.height}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
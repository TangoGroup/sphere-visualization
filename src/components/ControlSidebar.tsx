import { useState } from 'react';
import { ClipboardCopy } from 'lucide-react';
import { useConfigStore } from '../stores/configStore';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from './ui/sidebar';

export function ControlSidebar() {
  const { config, setConfig, exportConfig, importConfig } = useConfigStore();
  const [micEnabled, setMicEnabled] = useState(false);
  // Initialize microphone analyzer if needed later
  // const mic = useMicAnalyzer({ smoothingTimeConstant: 0.85, fftSize: 1024 });

  const handleCopyConfig = async () => {
    try {
      const exported = exportConfig();
      await navigator.clipboard.writeText(exported);
      alert('Config copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text: string = await navigator.clipboard.readText();
      if (!text) {
        alert('Clipboard is empty or unavailable.');
        return;
      }
      if (importConfig(text)) {
        alert('Config imported successfully!');
      } else {
        alert('Failed to import config. Please check the JSON format.');
      }
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      alert('Could not read clipboard. Check browser permissions.');
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <h1 className="text-xl font-bold">Sphere Waveform</h1>
      </SidebarHeader>
      <SidebarContent>
        {/* Global Controls */}
        <SidebarGroup>
          <SidebarGroupLabel>Global Controls</SidebarGroupLabel>
          <SidebarGroupContent>
          <div>
            <label className="block text-sm font-medium mb-2">Vertex Count</label>
            <Slider
              value={[config.vertexCount]}
              onValueChange={([value]) => setConfig({ vertexCount: value })}
              min={50}
              max={8000}
              step={50}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-400 mt-1">{config.vertexCount}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Point Size</label>
            <Slider
              value={[config.pointSize]}
              onValueChange={([value]) => setConfig({ pointSize: value })}
              min={0.002}
              max={0.1}
              step={0.002}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-400 mt-1">{config.pointSize.toFixed(3)}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Shell Count</label>
            <Slider
              value={[config.shellCount]}
              onValueChange={([value]) => setConfig({ shellCount: value })}
              min={1}
              max={5}
              step={1}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-400 mt-1">{config.shellCount}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Volume</label>
            <Slider
              value={[config.volume]}
              onValueChange={([value]) => setConfig({ volume: value })}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-400 mt-1">{config.volume.toFixed(2)}</div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mic-enabled"
              checked={micEnabled}
              onCheckedChange={(checked) => setMicEnabled(checked as boolean)}
            />
            <label htmlFor="mic-enabled" className="text-sm font-medium">Microphone</label>
          </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-6" />

        {/* Spin Effect */}
        <SidebarGroup>
          <SidebarGroupLabel>Spin Effect</SidebarGroupLabel>
          <SidebarGroupContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-spin"
              checked={config.enableSpin}
              onCheckedChange={(checked) => setConfig({ enableSpin: checked as boolean })}
            />
            <label htmlFor="enable-spin" className="text-sm font-medium">Enable Spin</label>
          </div>
          
          {config.enableSpin && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Spin Speed</label>
                <Slider
                  value={[config.spinSpeed]}
                  onValueChange={([value]) => setConfig({ spinSpeed: value })}
                  min={0.1}
                  max={2.0}
                  step={0.05}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-400 mt-1">{config.spinSpeed.toFixed(2)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Spin Axis X</label>
                <Slider
                  value={[config.spinAxisX]}
                  onValueChange={([value]) => setConfig({ spinAxisX: value })}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-400 mt-1">{config.spinAxisX}°</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Spin Axis Y</label>
                <Slider
                  value={[config.spinAxisY]}
                  onValueChange={([value]) => setConfig({ spinAxisY: value })}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-400 mt-1">{config.spinAxisY}°</div>
              </div>
            </>
          )}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-6" />

        {/* Pulse Effect */}
        <SidebarGroup>
          <SidebarGroupLabel>Pulse Effect</SidebarGroupLabel>
          <SidebarGroupContent>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="enable-pulse"
              checked={config.enablePulse}
              onCheckedChange={(checked) => setConfig({ enablePulse: checked as boolean })}
            />
            <label htmlFor="enable-pulse" className="text-sm font-medium">Enable Pulse</label>
          </div>
          
          {config.enablePulse && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">Pulse Speed</label>
                <Slider
                  value={[config.pulseSpeed]}
                  onValueChange={([value]) => setConfig({ pulseSpeed: value })}
                  min={0.1}
                  max={10.0}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-400 mt-1">{config.pulseSpeed.toFixed(1)}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Pulse Size</label>
                <Slider
                  value={[config.pulseSize]}
                  onValueChange={([value]) => setConfig({ pulseSize: value })}
                  min={0.1}
                  max={10.0}
                  step={0.1}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-400 mt-1">{config.pulseSize.toFixed(1)}</div>
              </div>
            </>
          )}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-6" />

        {/* Debug Tools */}
        <Accordion type="single" collapsible>
          <AccordionItem value="debug">
            <AccordionTrigger className="text-lg font-semibold">Debug Tools</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="freeze-time"
                  checked={config.freezeTime}
                  onCheckedChange={(checked) => setConfig({ freezeTime: checked as boolean })}
                />
                <label htmlFor="freeze-time" className="text-sm font-medium">Freeze Time</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setConfig({ advanceCount: config.advanceCount + 1 })}
                  size="sm"
                >
                  Step Time
                </Button>
                <span className="text-sm text-gray-400">({config.advanceCount})</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="use-analytic"
                  checked={config.useAnalytic}
                  onCheckedChange={(checked) => setConfig({ useAnalytic: checked as boolean })}
                />
                <label htmlFor="use-analytic" className="text-sm font-medium">Use Analytic</label>
              </div>
              
              <Separator />
              
              {/* Config Export/Import */}
              <div>
                <h3 className="text-sm font-medium mb-2">Configuration</h3>
                <div className="space-y-2">
                  <div className="relative">
                    <pre className="w-full max-h-64 overflow-auto rounded border border-gray-600 bg-gray-900 p-3 text-xs text-gray-100">
                      <code className="whitespace-pre">{JSON.stringify(config, null, 2)}</code>
                    </pre>
                    <Button
                      onClick={handleCopyConfig}
                      size="icon"
                      variant="outline"
                      className="absolute right-2 top-2"
                      aria-label="Copy configuration JSON"
                      title="Copy JSON"
                    >
                      <ClipboardCopy />
                    </Button>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handlePasteFromClipboard} size="sm" variant="outline">
                      Paste from Clipboard
                    </Button>
                  </div>
                </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SidebarContent>
    </Sidebar>
  );
}

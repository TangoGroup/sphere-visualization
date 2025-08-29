 
import { ClipboardCopy } from 'lucide-react';
import { useConfigStore } from '../stores/configStore';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Sidebar, SidebarContent, SidebarHeader, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from './ui/sidebar';
import BrandColorPicker from './BrandColorPicker';
import { useAnimationStore } from '@/stores/animationStore';
import { Diamond } from 'lucide-react';


export function ControlSidebar() {
  const { config, setConfig, exportConfig, importConfig } = useConfigStore();
  const { addOrUpdateDraftProp, draft, exportAnimations, importAnimations } = useAnimationStore();
  // Initialize microphone analyzer if needed later
  // const mic = useMicAnalyzer({ smoothingTimeConstant: 0.85, fftSize: 1024 });

  const handleCopyConfig = async () => {
    try {
      const exported = exportConfig();
      const anims = exportAnimations();
      const bundle = JSON.stringify({ config: JSON.parse(exported), animations: JSON.parse(anims) }, null, 2);
      await navigator.clipboard.writeText(bundle);
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
      // Try to parse as combined bundle first
      let handled = false;
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === 'object' && parsed.config && parsed.animations) {
          const okConfig = importConfig(JSON.stringify(parsed.config));
          const okAnims = importAnimations(JSON.stringify(parsed.animations));
          handled = okConfig && okAnims;
        }
      } catch {}
      if (!handled && importConfig(text)) {
        alert('Config imported successfully!');
      } else if (!handled && importAnimations(text)) {
        alert('Animations imported successfully!');
      } else if (handled) {
        alert('Config + animations imported successfully!');
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
      <SidebarContent className="p-4">
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
            <div className="flex items-center justify-between mt-1">
              <div className="text-sm text-gray-400">{config.vertexCount}</div>
              <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('vertexCount', config.vertexCount); }} title="Add vertex count to active animation">
                <Diamond className="text-orange-400" />
              </Button>
            </div>
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
            <div className="flex items-center justify-between mt-1">
              <div className="text-sm text-gray-400">{config.pointSize.toFixed(3)}</div>
              <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('pointSize', config.pointSize); }} title="Add point size to active animation">
                <Diamond className="text-orange-400" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Point Size Randomness</label>
            <Slider
              value={[config.sizeRandomness]}
              onValueChange={([value]) => setConfig({ sizeRandomness: value })}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="flex items-center justify-between mt-1">
              <div className="text-sm text-gray-400">{config.sizeRandomness.toFixed(2)}</div>
              <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('sizeRandomness', config.sizeRandomness); }} title="Add size randomness to active animation">
                <Diamond className="text-orange-400" />
              </Button>
            </div>
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
            <label className="block text-sm font-medium mb-2">Effect Power</label>
            <Slider
              value={[config.volume]}
              onValueChange={([value]) => setConfig({ volume: value })}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="flex items-center justify-between mt-1">
              <div className="text-sm text-gray-400">{config.volume.toFixed(2)}</div>
              <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('volume', config.volume); }} title="Add effect power to active animation">
                <Diamond className="text-orange-400" />
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <label className="block text-sm font-medium mb-2">Global Size</label>
            <Slider
              value={[config.size]}
              onValueChange={([value]) => setConfig({ size: value })}
              min={0}
              max={3}
              step={0.01}
              className="w-full"
            />
            <div className="flex items-center justify-between mt-1">
              <div className="text-sm text-gray-400">{config.size.toFixed(2)}×</div>
              <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('size', config.size); }} title="Add size to active animation">
                <Diamond className="text-orange-400" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Opacity</label>
            <Slider
              value={[config.opacity]}
              onValueChange={([value]) => setConfig({ opacity: value })}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
            <div className="flex items-center justify-between mt-1">
              <div className="text-sm text-gray-400">{config.opacity.toFixed(2)}</div>
              <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('opacity', config.opacity); }} title="Add opacity to active animation">
                <Diamond className="text-orange-400" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rotation X</label>
            <Slider
              value={[config.rotationX]}
              onValueChange={([value]) => setConfig({ rotationX: value })}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between mt-1">
              <div className="text-sm text-gray-400">{config.rotationX.toFixed(0)}°</div>
              <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('rotationX', config.rotationX); }} title="Add rotation X to active animation">
                <Diamond className="text-orange-400" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rotation Y</label>
            <Slider
              value={[config.rotationY]}
              onValueChange={([value]) => setConfig({ rotationY: value })}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between mt-1">
              <div className="text-sm text-gray-400">{config.rotationY.toFixed(0)}°</div>
              <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('rotationY', config.rotationY); }} title="Add rotation Y to active animation">
                <Diamond className="text-orange-400" />
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rotation Z</label>
            <Slider
              value={[config.rotationZ]}
              onValueChange={([value]) => setConfig({ rotationZ: value })}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
            <div className="flex items-center justify-between mt-1">
              <div className="text-sm text-gray-400">{config.rotationZ.toFixed(0)}°</div>
              <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('rotationZ', config.rotationZ); }} title="Add rotation Z to active animation">
                <Diamond className="text-orange-400" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="mic-enabled"
              checked={config.micEnabled}
              onCheckedChange={(checked) => setConfig({ micEnabled: checked as boolean })}
            />
            <label htmlFor="mic-enabled" className="text-sm font-medium">Microphone</label>
          </div>
          {config.micEnabled && (
            <div>
              <label className="block text-sm font-medium mb-2">Mic Volume</label>
              <Slider
                value={[config.micVolume]}
                onValueChange={([value]) => setConfig({ micVolume: value })}
                min={1}
                max={11}
                step={0.1}
                className="w-full"
              />
              <div className="text-right text-sm text-gray-400 mt-1">{config.micVolume.toFixed(1)}×</div>
            </div>
          )}
          {config.micEnabled && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mic-affects-global"
                  checked={config.micAffectsGlobal}
                  onCheckedChange={(checked) => setConfig({ micAffectsGlobal: checked as boolean })}
                />
                <label htmlFor="mic-affects-global" className="text-sm font-medium">Mic multiplies Effect Power</label>
              </div>
            </div>
          )}
          {config.micEnabled && (
            <div>
              <label className="block text-sm font-medium mb-2">Mic Smoothing</label>
              <Slider
                value={[config.micSmoothing]}
                onValueChange={([value]) => setConfig({ micSmoothing: value })}
                min={0}
                max={0.98}
                step={0.01}
                className="w-full"
              />
              <div className="text-right text-sm text-gray-400 mt-1">EMA α = {config.micSmoothing.toFixed(2)}</div>
            </div>
          )}
        <Separator className="my-6" />

        {/* Arcs (Ejections) */}
        <SidebarGroup>
          <SidebarGroupLabel>Arcs</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable-arcs"
                checked={config.enableArcs}
                onCheckedChange={(checked) => setConfig({ enableArcs: checked as boolean })}
              />
              <label htmlFor="enable-arcs" className="text-sm font-medium">Enable</label>
            </div>
            {config.enableArcs && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Count</label>
                  <Slider
                    value={[config.arcMaxCount]}
                    onValueChange={([value]) => setConfig({ arcMaxCount: Math.round(value) })}
                    min={0}
                    max={8}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-gray-400">{config.arcMaxCount}</div>
                    <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('arcMaxCount', config.arcMaxCount); }} title="Add arc max count to active animation">
                      <Diamond className="text-orange-400" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Spawn Rate (arcs/sec)</label>
                  <Slider
                    value={[config.arcSpawnRate]}
                    onValueChange={([value]) => setConfig({ arcSpawnRate: value })}
                    min={0}
                    max={2}
                    step={0.05}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-gray-400">{config.arcSpawnRate.toFixed(2)}</div>
                    <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('arcSpawnRate', config.arcSpawnRate); }} title="Add arc spawn rate to active animation">
                      <Diamond className="text-orange-400" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (s)</label>
                  <Slider
                    value={[config.arcDuration]}
                    onValueChange={([value]) => setConfig({ arcDuration: value })}
                    min={0.5}
                    max={10}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-gray-400">{config.arcDuration.toFixed(1)}s</div>
                    <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('arcDuration', config.arcDuration); }} title="Add arc duration to active animation">
                      <Diamond className="text-orange-400" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Speed (rad/s)</label>
                  <Slider
                    value={[config.arcSpeed]}
                    onValueChange={([value]) => setConfig({ arcSpeed: value })}
                    min={0.1}
                    max={5.0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-gray-400">{config.arcSpeed.toFixed(1)}</div>
                    <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('arcSpeed', config.arcSpeed); }} title="Add arc speed to active animation">
                      <Diamond className="text-orange-400" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Span (deg)</label>
                  <Slider
                    value={[config.arcSpanDeg]}
                    onValueChange={([value]) => setConfig({ arcSpanDeg: value })}
                    min={10}
                    max={180}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-gray-400">{config.arcSpanDeg.toFixed(0)}°</div>
                    <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('arcSpanDeg', config.arcSpanDeg); }} title="Add arc span to active animation">
                      <Diamond className="text-orange-400" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Thickness</label>
                  <Slider
                    value={[config.arcThickness]}
                    onValueChange={([value]) => setConfig({ arcThickness: value })}
                    min={0}
                    max={0.25}
                    step={0.005}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-gray-400">{config.arcThickness.toFixed(3)}</div>
                    <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('arcThickness', config.arcThickness); }} title="Add arc thickness to active animation">
                      <Diamond className="text-orange-400" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Feather</label>
                  <Slider
                    value={[config.arcFeather]}
                    onValueChange={([value]) => setConfig({ arcFeather: value })}
                    min={0}
                    max={1}
                    step={0.005}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-gray-400">{config.arcFeather.toFixed(3)}</div>
                    <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('arcFeather', config.arcFeather); }} title="Add arc feather to active animation">
                      <Diamond className="text-orange-400" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Brightness</label>
                  <Slider
                    value={[config.arcBrightness]}
                    onValueChange={([value]) => setConfig({ arcBrightness: value })}
                    min={0}
                    max={3}
                    step={0.05}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-gray-400">{config.arcBrightness.toFixed(2)}×</div>
                    <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('arcBrightness', config.arcBrightness); }} title="Add arc brightness to active animation">
                      <Diamond className="text-orange-400" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Altitude</label>
                  <Slider
                    value={[config.arcAltitude]}
                    onValueChange={([value]) => setConfig({ arcAltitude: value })}
                    min={0}
                    max={2}
                    step={0.005}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-gray-400">{config.arcAltitude.toFixed(3)}</div>
                    <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('arcAltitude', config.arcAltitude); }} title="Add arc altitude to active animation">
                      <Diamond className="text-orange-400" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Appearance */}
        <SidebarGroup>
          <SidebarGroupLabel>Appearance</SidebarGroupLabel>
          <SidebarGroupContent>
            <BrandColorPicker
              value={config.pointColor}
              onChange={(hex) => setConfig({ pointColor: hex })}
              label="Point Color"
            />
            <div className="flex items-center justify-end mt-2">
              <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('pointColor', config.pointColor); }} title="Add color to active animation">
                <Diamond className="text-orange-400" />
              </Button>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Glow Strength</label>
              <Slider
                value={[config.glowStrength]}
                onValueChange={([value]) => setConfig({ glowStrength: value })}
                min={0}
                max={3}
                step={0.01}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{config.glowStrength.toFixed(2)}</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('glowStrength', config.glowStrength); }} title="Add glow strength to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Glow Radius (× dot radius)</label>
              <Slider
                value={[Math.min(0.5, config.glowRadiusFactor)]}
                onValueChange={([value]) => setConfig({ glowRadiusFactor: Math.min(0.5, value) })}
                min={0}
                max={0.5}
                step={0.01}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{Math.min(0.5, config.glowRadiusFactor).toFixed(2)}×</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('glowRadiusFactor', Math.min(0.5, config.glowRadiusFactor)); }} title="Add glow radius factor to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            {/* Glow Softness removed */}
            <div className="mt-2">
              <BrandColorPicker
                value={config.glowColor}
                onChange={(hex) => setConfig({ glowColor: hex })}
                label="Glow Color"
              />
              <div className="flex items-center justify-end mt-2">
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('glowColor', config.glowColor); }} title="Add glow color to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Background</label>
              <div className="inline-flex gap-2">
                <button
                  className={`h-8 rounded px-3 text-sm border ${config.backgroundTheme === 'dark' ? 'bg-primary text-primary-foreground border-transparent' : 'border-gray-600'}`}
                  onClick={() => setConfig({ backgroundTheme: 'dark' })}
                >
                  Dark
                </button>
                <button
                  className={`h-8 rounded px-3 text-sm border ${config.backgroundTheme === 'light' ? 'bg-primary text-primary-foreground border-transparent' : 'border-gray-600'}`}
                  onClick={() => setConfig({ backgroundTheme: 'light' })}
                >
                  Light
                </button>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-6" />

        {/* Noise - Randomish */}
        <SidebarGroup>
          <SidebarGroupLabel>Randomish Noise</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable-randomish"
                checked={config.enableRandomishNoise}
                onCheckedChange={(checked) => setConfig({ enableRandomishNoise: checked as boolean })}
              />
              <label htmlFor="enable-randomish" className="text-sm font-medium">Enable</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Slider
                value={[config.randomishAmount]}
                onValueChange={([value]) => setConfig({ randomishAmount: value })}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{config.randomishAmount.toFixed(2)}</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('randomishAmount', config.randomishAmount); }} title="Add randomish amount to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pattern Size</label>
              <Slider
                value={[config.pulseSize]}
                onValueChange={([value]) => setConfig({ pulseSize: value })}
                min={0.1}
                max={10.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{config.pulseSize.toFixed(1)}</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('pulseSize', config.pulseSize); }} title="Add pattern size to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Randomish Speed</label>
              <Slider
                value={[config.randomishSpeed]}
                onValueChange={([value]) => setConfig({ randomishSpeed: value })}
                min={0}
                max={10.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{config.randomishSpeed.toFixed(1)}</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('randomishSpeed', config.randomishSpeed); }} title="Add randomish speed to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            {config.micEnabled && (
              <div className="mt-2">
                <label className="block text-sm font-medium mb-2">Mic → Randomish Amount</label>
                <Slider
                  value={[config.randomishMicModAmount ?? 0]}
                  onValueChange={([value]) => setConfig({ randomishMicModAmount: value ?? 0 })}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-400 mt-1">{(config.randomishMicModAmount ?? 0).toFixed(2)}</div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-6" />

        {/* Noise - Sine */}
        <SidebarGroup>
          <SidebarGroupLabel>Sine Noise</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable-sine"
                checked={config.enableSineNoise}
                onCheckedChange={(checked) => setConfig({ enableSineNoise: checked as boolean })}
              />
              <label htmlFor="enable-sine" className="text-sm font-medium">Enable</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Slider
                value={[config.sineAmount]}
                onValueChange={([value]) => setConfig({ sineAmount: value })}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{config.sineAmount.toFixed(2)}</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('sineAmount', config.sineAmount); }} title="Add sine amount to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sine Speed</label>
              <Slider
                value={[config.sineSpeed]}
                onValueChange={([value]) => setConfig({ sineSpeed: value })}
                min={0}
                max={10.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{config.sineSpeed.toFixed(1)}</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('sineSpeed', config.sineSpeed); }} title="Add sine speed to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Sine Scale</label>
              <Slider
                value={[config.sineScale]}
                onValueChange={([value]) => setConfig({ sineScale: value })}
                min={0.1}
                max={5.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{config.sineScale.toFixed(1)}</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('sineScale', config.sineScale); }} title="Add sine scale to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            {config.micEnabled && (
              <div className="mt-2">
                <label className="block text-sm font-medium mb-2">Mic → Sine Amount</label>
                <Slider
                  value={[config.sineMicModAmount ?? 0]}
                  onValueChange={([value]) => setConfig({ sineMicModAmount: value ?? 0 })}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-400 mt-1">{(config.sineMicModAmount ?? 0).toFixed(2)}</div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-6" />

        {/* Noise - Ripple */}
        <SidebarGroup>
          <SidebarGroupLabel>Ripple Noise</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable-ripple"
                checked={config.enableRippleNoise}
                onCheckedChange={(checked) => setConfig({ enableRippleNoise: checked as boolean })}
              />
              <label htmlFor="enable-ripple" className="text-sm font-medium">Enable</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Slider
                value={[config.rippleAmount]}
                onValueChange={([value]) => setConfig({ rippleAmount: value })}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{config.rippleAmount.toFixed(2)}</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('rippleAmount', config.rippleAmount); }} title="Add ripple amount to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Speed</label>
              <Slider
                value={[config.rippleSpeed]}
                onValueChange={([value]) => setConfig({ rippleSpeed: value })}
                min={0}
                max={10.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{config.rippleSpeed.toFixed(1)}</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('rippleSpeed', config.rippleSpeed); }} title="Add ripple speed to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Scale</label>
              <Slider
                value={[config.rippleScale]}
                onValueChange={([value]) => setConfig({ rippleScale: value })}
                min={0.1}
                max={10.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{config.rippleScale.toFixed(1)}</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('rippleScale', config.rippleScale); }} title="Add ripple scale to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            {config.micEnabled && (
              <div className="mt-2">
                <label className="block text-sm font-medium mb-2">Mic → Ripple Amount</label>
                <Slider
                  value={[config.rippleMicModAmount ?? 0]}
                  onValueChange={([value]) => setConfig({ rippleMicModAmount: value ?? 0 })}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-400 mt-1">{(config.rippleMicModAmount ?? 0).toFixed(2)}</div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        <Separator className="my-6" />

        {/* Noise - Surface Ripple */}
        <SidebarGroup>
          <SidebarGroupLabel>Surface Ripple</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="enable-surface-ripple"
                checked={config.enableSurfaceRipple}
                onCheckedChange={(checked) => setConfig({ enableSurfaceRipple: checked as boolean })}
              />
              <label htmlFor="enable-surface-ripple" className="text-sm font-medium">Enable</label>
            </div>
            <p className="text-xs text-gray-400 mb-2">Compression wave propagating from a moving center on the sphere.</p>
            <div>
              <label className="block text-sm font-medium mb-2">Amount</label>
              <Slider
                value={[config.surfaceRippleAmount]}
                onValueChange={([value]) => setConfig({ surfaceRippleAmount: value })}
                min={0}
                max={1}
                step={0.01}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{config.surfaceRippleAmount.toFixed(2)}</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('surfaceRippleAmount', config.surfaceRippleAmount); }} title="Add surface ripple amount to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Speed</label>
              <Slider
                value={[config.surfaceRippleSpeed]}
                onValueChange={([value]) => setConfig({ surfaceRippleSpeed: value })}
                min={0}
                max={10.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{config.surfaceRippleSpeed.toFixed(1)}</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('surfaceRippleSpeed', config.surfaceRippleSpeed); }} title="Add surface ripple speed to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Scale</label>
              <Slider
                value={[config.surfaceRippleScale]}
                onValueChange={([value]) => setConfig({ surfaceRippleScale: value })}
                min={0.1}
                max={10.0}
                step={0.1}
                className="w-full"
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-sm text-gray-400">{config.surfaceRippleScale.toFixed(1)}</div>
                <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('surfaceRippleScale', config.surfaceRippleScale); }} title="Add surface ripple scale to active animation">
                  <Diamond className="text-orange-400" />
                </Button>
              </div>
            </div>
            {config.micEnabled && (
              <div className="mt-2">
                <label className="block text-sm font-medium mb-2">Mic → Surface Ripple Amount</label>
                <Slider
                  value={[config.surfaceRippleMicModAmount ?? 0]}
                  onValueChange={([value]) => setConfig({ surfaceRippleMicModAmount: value ?? 0 })}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-400 mt-1">{(config.surfaceRippleMicModAmount ?? 0).toFixed(2)}</div>
              </div>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Screen-space Mask */}
        <SidebarGroup>
          <SidebarGroupLabel>Mask</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mask-enabled"
                checked={config.maskEnabled}
                onCheckedChange={(checked) => setConfig({ maskEnabled: checked as boolean })}
              />
              <label htmlFor="mask-enabled" className="text-sm font-medium">Enable Mask</label>
            </div>
            {config.maskEnabled && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Mask Radius</label>
                  <Slider
                    value={[config.maskRadius]}
                    onValueChange={([value]) => setConfig({ maskRadius: value })}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-gray-400">{config.maskRadius.toFixed(2)}</div>
                    <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('maskRadius', config.maskRadius); }} title="Add mask radius to active animation">
                      <Diamond className="text-orange-400" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Mask Feather</label>
                  <Slider
                    value={[config.maskFeather]}
                    onValueChange={([value]) => setConfig({ maskFeather: value })}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-sm text-gray-400">{config.maskFeather.toFixed(2)}</div>
                    <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('maskFeather', config.maskFeather); }} title="Add mask feather to active animation">
                      <Diamond className="text-orange-400" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mask-invert"
                    checked={config.maskInvert}
                    onCheckedChange={(checked) => setConfig({ maskInvert: checked as boolean })}
                  />
                  <label htmlFor="mask-invert" className="text-sm font-medium">Invert Mask</label>
                </div>
              </>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

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
                  min={0}
                  max={2.0}
                  step={0.05}
                  className="w-full"
                />
                <div className="flex items-center justify-between mt-1">
                  <div className="text-sm text-gray-400">{config.spinSpeed.toFixed(2)}</div>
                  <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('spinSpeed', config.spinSpeed); }} title="Add spin speed to active animation">
                    <Diamond className="text-orange-400" />
                  </Button>
                </div>
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
                <div className="flex items-center justify-between mt-1">
                  <div className="text-sm text-gray-400">{config.spinAxisX}°</div>
                  <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('spinAxisX', config.spinAxisX); }} title="Add spin axis X to active animation">
                    <Diamond className="text-orange-400" />
                  </Button>
                </div>
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
                <div className="flex items-center justify-between mt-1">
                  <div className="text-sm text-gray-400">{config.spinAxisY}°</div>
                  <Button size="icon" variant="outline" disabled={!draft} onClick={() => { addOrUpdateDraftProp('spinAxisY', config.spinAxisY); }} title="Add spin axis Y to active animation">
                    <Diamond className="text-orange-400" />
                  </Button>
                </div>
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
              
              <Separator />
              
              {/* Config Export/Import */}
              <div>
                <h3 className="text-sm font-medium mb-2">Configuration</h3>
                <div className="space-y-2">
                  <div className="relative">
                    <pre className="w-full max-h-64 overflow-auto rounded border border-gray-600 bg-gray-900 p-3 text-xs text-gray-100">
                      <code className="whitespace-pre">{JSON.stringify({ config, animations: useAnimationStore.getState().animations }, null, 2)}</code>
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

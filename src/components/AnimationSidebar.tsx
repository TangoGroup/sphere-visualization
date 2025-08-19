import { useAnimationStore } from '@/stores/animationStore';
import { Button } from './ui/button';
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader } from './ui/sidebar';
import { Play, Pencil, Trash2, Copy } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Combobox, type ComboboxOption } from './ui/combobox';
import { useConfigStore } from '@/stores/configStore';

export function AnimationSidebar() {
  const {
    animations,
    activeId,
    draft,
    create,
    beginEdit,
    discardDraft,
    saveDraft,
    remove,
    duplicate,
    requestPlay,
    setDraftDuration,
    setDraftEase,
    setDraftName,
    replaceDraftTo,
  } = useAnimationStore();
  const { config } = useConfigStore();
  
  const editing = draft;
  const easeOptions: ComboboxOption[] = [
    // Common
    { value: 'linear', label: 'linear', group: 'Common' },
    { value: 'power1.in', label: 'power1.in', group: 'Power1' },
    { value: 'power1.out', label: 'power1.out', group: 'Power1' },
    { value: 'power1.inOut', label: 'power1.inOut', group: 'Power1' },
    { value: 'power2.in', label: 'power2.in', group: 'Power2' },
    { value: 'power2.out', label: 'power2.out', group: 'Power2' },
    { value: 'power2.inOut', label: 'power2.inOut', group: 'Power2' },
    { value: 'power3.in', label: 'power3.in', group: 'Power3' },
    { value: 'power3.out', label: 'power3.out', group: 'Power3' },
    { value: 'power3.inOut', label: 'power3.inOut', group: 'Power3' },
    { value: 'power4.in', label: 'power4.in', group: 'Power4' },
    { value: 'power4.out', label: 'power4.out', group: 'Power4' },
    { value: 'power4.inOut', label: 'power4.inOut', group: 'Power4' },
    { value: 'sine.in', label: 'sine.in', group: 'Sine' },
    { value: 'sine.out', label: 'sine.out', group: 'Sine' },
    { value: 'sine.inOut', label: 'sine.inOut', group: 'Sine' },
    { value: 'expo.in', label: 'expo.in', group: 'Expo' },
    { value: 'expo.out', label: 'expo.out', group: 'Expo' },
    { value: 'expo.inOut', label: 'expo.inOut', group: 'Expo' },
    { value: 'back.in', label: 'back.in', group: 'Back' },
    { value: 'back.out', label: 'back.out', group: 'Back' },
    { value: 'back.inOut', label: 'back.inOut', group: 'Back' },
    { value: 'elastic.in', label: 'elastic.in', group: 'Elastic' },
    { value: 'elastic.out', label: 'elastic.out', group: 'Elastic' },
    { value: 'elastic.inOut', label: 'elastic.inOut', group: 'Elastic' },
    { value: 'bounce.in', label: 'bounce.in', group: 'Bounce' },
    { value: 'bounce.out', label: 'bounce.out', group: 'Bounce' },
    { value: 'bounce.inOut', label: 'bounce.inOut', group: 'Bounce' },
    // You can extend with slowMo/steps/custom as needed later
  ];

  return (
    <Sidebar side="right">
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Animations</h2>
          <Button size="sm" onClick={() => create()}>New</Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel>List</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-0.5">
              {animations.map(a => (
                <div key={a.id} className={`px-1 py-2 border-b ${a.id === activeId ? 'border-primary/60' : 'border-gray-700'}`}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium truncate">{a.name}</div>
                    <div className="text-xs text-gray-400 ml-2">{a.duration.toFixed(1)}s</div>
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Button size="icon" title="Play" onClick={() => requestPlay(a.id)}>
                      <Play />
                    </Button>
                    <Button size="icon" variant="outline" title="Edit" onClick={() => beginEdit(a.id)}>
                      <Pencil />
                    </Button>
                    <Button size="icon" variant="outline" title="Duplicate" onClick={() => duplicate(a.id)}>
                      <Copy />
                    </Button>
                    <Button size="icon" variant="destructive" title="Delete" onClick={() => remove(a.id)} disabled={a.system}>
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              ))}
              {animations.length === 0 && (
                <div className="text-sm text-gray-400">No animations. Create one to start editing.</div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <Sheet modal={false} open={!!editing} onOpenChange={() => { /* ignore outside/esc close; use Save/Cancel */ }}>
          <SheetContent side="right" showOverlay={false} dismissible={false} onClose={discardDraft}>
            <SheetHeader>
              <SheetTitle>Animation Editor</SheetTitle>
            </SheetHeader>
            {editing && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    className="bg-transparent text-sm flex-1 mr-2 outline-none border border-gray-600 rounded px-2 py-1"
                    value={editing.name}
                    onChange={(e) => setDraftName(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={discardDraft}>Cancel</Button>
                    <Button size="sm" onClick={saveDraft}>Save</Button>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <label className="text-sm w-24">Duration</label>
                  <input
                    type="number"
                    className="w-24 bg-transparent border border-gray-600 rounded px-2 py-1 text-sm"
                    value={editing.duration}
                    min={0}
                    step={0.1}
                    onChange={(e) => setDraftDuration(parseFloat(e.target.value) || 0)}
                  />
                  <label className="text-sm w-16 text-right">Ease</label>
                  <div className="flex-1">
                    <Combobox
                      value={editing.ease}
                      onChange={(val) => setDraftEase(val as any)}
                      options={easeOptions}
                      placeholder="Select ease"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">Properties in this animation:</div>
                  <Button size="sm" variant="outline" onClick={() => replaceDraftTo(config)}>Fill from current state</Button>
                </div>
                <pre className="text-xs border border-gray-600 rounded p-2 max-h-56 overflow-auto">{JSON.stringify(editing.to, null, 2)}</pre>
                <div className="text-xs text-gray-500">Tip: Use the Apply button next to a property in the left sidebar to add/update it here.</div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </SidebarContent>
    </Sidebar>
  );
}

export default AnimationSidebar;



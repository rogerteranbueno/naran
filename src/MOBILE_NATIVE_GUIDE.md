# Mobile-Native Enhancement Guide

## Overview
Naran has been enhanced with mobile-native patterns while maintaining full web/PWA compatibility.

## Key Changes

### 1. Unified Header Component
**File**: `components/Header.jsx`

- Displays brand logo (🍊 naran) on root screens (`/`, `/login`, `/demo`, `/unirse`)
- Shows iOS-style back button (`← Atrás`) on child screens
- Integrated into `MobileLayout` — automatic across all pages
- No need to add manual back buttons to pages

**Usage**: Just add pages to routes in `App.jsx` — header is automatic.

---

### 2. Tab Stack Preservation
**Files**: 
- `lib/TabStackContext.jsx` — Context for managing scroll state
- `components/BottomTabNav.jsx` — Enhanced with tab stack awareness
- `App.jsx` — Wrapped with `TabStackProvider`

**Behavior**:
- Switching between Home, History, Practice, Profile tabs now **preserves scroll position**
- Scroll position saved in both context and sessionStorage (dual fallback)
- Smooth restoration when returning to a tab

**Usage**: Automatic — no code changes needed in pages.

---

### 3. Bottom Sheet for Controls (Vaul-based)
**File**: `components/SelectBottomSheet.jsx`

Replace traditional `<Select>` components with iOS-style bottom sheet:

```jsx
// Before (desktop-style popover)
<Select value={value} onValueChange={setValue}>
  <SelectTrigger><SelectValue placeholder="Choose..." /></SelectTrigger>
  <SelectContent>
    <SelectItem value="opt1">Option 1</SelectItem>
    <SelectItem value="opt2">Option 2</SelectItem>
  </SelectContent>
</Select>

// After (mobile-native bottom sheet)
<SelectBottomSheet
  label="Choose option"
  value={value}
  options={[
    { label: 'Option 1', value: 'opt1' },
    { label: 'Option 2', value: 'opt2' },
  ]}
  onChange={setValue}
  variant="outline"
/>
```

**Benefits**:
- Native iOS Action Sheet feel
- Touch-optimized buttons
- Animated drawer from bottom
- Drag handle for mobile
- Works on all devices

---

### 4. Optimistic UI Updates

#### Reframe.jsx - Save Action
- Shows "Guardado ✓" + checkmark **immediately**
- Syncs to backend in background
- Fallback to error if offline

```javascript
const handleSave = async () => {
  setSaved(true);        // Optimistic
  setSaving(true);
  showToast('Guardado ✓');
  
  // Sync in background
  const result = await saveLog(...);
  setSaving(false);
};
```

#### TestimonialWall - Applaud Action
- Increments applause count instantly
- Updates backend asynchronously
- Smooth animation

---

## Migration Checklist

### For Existing Pages
- [ ] Remove manual `ArrowLeft` back buttons (Header handles it)
- [ ] Remove tab root back buttons (Home, History, Practice, Profile)
- [ ] Replace `<Select>` with `<SelectBottomSheet>` for better mobile UX
- [ ] Add optimistic UI to critical actions (save, applaud, etc.)

### For New Pages
- [ ] Use Header automatically (built-in)
- [ ] Use TabStack for scroll preservation (built-in)
- [ ] Use SelectBottomSheet for all selection controls
- [ ] Implement optimistic UI for user actions

---

## Code Examples

### Example 1: Using SelectBottomSheet
```jsx
import SelectBottomSheet from '@/components/SelectBottomSheet';

function MyComponent() {
  const [emotion, setEmotion] = useState('enojo');

  return (
    <SelectBottomSheet
      label="¿Cómo te sientes?"
      value={emotion}
      options={[
        { label: 'Enojo', value: 'enojo' },
        { label: 'Tristeza', value: 'tristeza' },
        { label: 'Ansiedad', value: 'ansiedad' },
      ]}
      onChange={setEmotion}
    />
  );
}
```

### Example 2: Optimistic UI Pattern
```jsx
const [saved, setSaved] = useState(false);
const [saving, setSaving] = useState(false);

const handleSave = async () => {
  setSaved(true);      // Show success immediately
  setSaving(true);
  showToast('Guardado ✓');
  
  try {
    await saveToBackend(data);
    // Keep saved state visible
  } catch (error) {
    setSaved(false);   // Revert if error
    showToast('Error al guardar');
  } finally {
    setSaving(false);
  }
};
```

### Example 3: Using Tab Stack
```jsx
import { useTabStack } from '@/lib/TabStackContext';

function MyPage() {
  const { saveScroll } = useTabStack();
  const { pathname } = useLocation();

  // Auto-managed by BottomTabNav + MobileLayout
  // Just write your page normally
  
  return <div>{/* Your content */}</div>;
}
```

---

## Desktop / PWA Compatibility

All changes are **fully compatible** with:
- Desktop web browsers
- iPad / tablet layouts
- PWA installations
- Responsive design

**Benefits persist across devices**:
- Scroll preservation works on all screen sizes
- Bottom sheets scale gracefully
- Header adapts to available space
- Optimistic UI improves perceived performance everywhere

---

## Component API Reference

### SelectBottomSheet
```jsx
<SelectBottomSheet
  label={string}              // Button label & sheet title
  value={string}              // Current selected value
  options={Array}             // [{label, value}, ...]
  onChange={Function}         // Called with new value
  variant="default"|"outline" // Button style
  disabled={boolean}          // Disable selection
/>
```

### Header
- Auto-detected based on route
- No props needed
- Integrated in MobileLayout

### TabStackProvider
- Wraps entire app (in App.jsx)
- Managed internally
- Use `useTabStack()` hook for custom scroll management

---

## Testing Checklist

- [ ] Tab navigation preserves scroll position
- [ ] Header shows logo on root screens
- [ ] Header shows back button on child screens
- [ ] SelectBottomSheet opens from bottom
- [ ] Optimistic UI updates appear instantly
- [ ] App works on mobile (iOS Safari, Chrome Mobile)
- [ ] App works on desktop
- [ ] App works on tablet
- [ ] Offline mode syncs when online

---

## Future Enhancements

- Gesture-based navigation (swipe back)
- Voice control for selections
- Bottom sheet for confirmation dialogs
- Haptic feedback on selections
- Share sheets for native sharing
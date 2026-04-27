---
name: IndiCarbon Eco-Tech
colors:
  surface: '#f8faf2'
  surface-dim: '#d8dbd3'
  surface-bright: '#f8faf2'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f5ec'
  surface-container: '#ecefe6'
  surface-container-high: '#e6e9e1'
  surface-container-highest: '#e1e4db'
  on-surface: '#191d18'
  on-surface-variant: '#41493e'
  inverse-surface: '#2e312c'
  inverse-on-surface: '#eff2e9'
  outline: '#717a6d'
  outline-variant: '#c0c9bb'
  surface-tint: '#2e6b2f'
  primary: '#002c06'
  on-primary: '#ffffff'
  primary-container: '#00450d'
  on-primary-container: '#74b46e'
  inverse-primary: '#95d78e'
  secondary: '#00639a'
  on-secondary: '#ffffff'
  secondary-container: '#7ec1fe'
  on-secondary-container: '#004f7c'
  tertiary: '#361f19'
  on-tertiary: '#ffffff'
  tertiary-container: '#4e342d'
  on-tertiary-container: '#c09c93'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b0f3a7'
  primary-fixed-dim: '#95d78e'
  on-primary-fixed: '#002203'
  on-primary-fixed-variant: '#135219'
  secondary-fixed: '#cee5ff'
  secondary-fixed-dim: '#96ccff'
  on-secondary-fixed: '#001d32'
  on-secondary-fixed-variant: '#004a75'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#e5beb4'
  on-tertiary-fixed: '#2b1610'
  on-tertiary-fixed-variant: '#5c4039'
  background: '#f8faf2'
  on-background: '#191d18'
  surface-variant: '#e1e4db'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  title-sm:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  mono-stream:
    fontFamily: ui-monospace, monospace
    fontSize: 14px
    lineHeight: '1.5'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  container-padding: 32px
  section-gap: 80px
  glass-padding: 24px
---

## Brand & Style
The brand personality is **Technical, Transparent, and Future-Forward**. It positions itself at the intersection of heavy industrial compliance and cutting-edge AI intelligence. The visual style is a sophisticated blend of **Modern Corporate** reliability and **Glassmorphism**.

The UI evokes an "Environmental Intelligence" atmosphere using a palette of deep botanical greens paired with ethereal, translucent surfaces. Key emotional drivers are trust (through clean typography), innovation (through blurred glass layers), and organic growth (through asymmetric "leaf" shapes). The interface should feel like a high-end command center for ecological sustainability.

## Colors
The palette is rooted in **Fidelity Green**, representing the core mission of carbon tracking. 
- **Primary:** A deep, authoritative forest green used for headers and core brand identity.
- **Secondary:** A technical blue used for active processing states, progress bars, and "live" indicators.
- **Tertiary:** Earthy clay tones reserved for secondary agents or background logic elements.
- **Surface Strategy:** We utilize a "layered white" approach. Backgrounds are a very pale, warm neutral (`#f7fbf1`), while active containers use semi-transparent white with a high-strength backdrop blur to create a sense of lightness despite the complex data density.

## Typography
The system uses a high-contrast typographic pairing to balance technicality with readability.
- **Space Grotesk** is used for headings and brand elements. Its geometric, slightly quirky terminals reinforce the "AI and Science" theme.
- **Manrope** handles all UI labels and body text, providing a highly legible, modern sans-serif experience that remains neutral.
- **Caps & Spacing:** Small labels should always use uppercase with increased letter-spacing to denote status or categories.
- **Monospaced Utility:** For AI reasoning streams and data logs, use a clean monospace font to signify "raw" or "processed" data output.

## Layout & Spacing
The layout follows a **Fluid Bento Grid** model. The screen is divided into 12 columns for large displays, with content prioritized using asymmetrical spans (e.g., an 8-column main card paired with a 4-column side card).

- **Margins:** A generous `32px` outer container padding ensures the interface feels airy.
- **Rhythm:** A `4px` base unit is used for all internal component spacing.
- **Navigation:** The left sidebar is fixed at `256px` (64 units), providing a stable anchor for the fluid content area. 
- **Glass Padding:** All major cards should utilize `24px` internal padding to prevent data from feeling cramped against the borders.

## Elevation & Depth
Depth is achieved through **Glassmorphism and Tonal Layering** rather than traditional heavy shadows.
- **Level 1 (Background):** A flat, off-white surface.
- **Level 2 (Navigation/Header):** `backdrop-blur: 20px` with a `white/60` fill and a very thin, high-contrast white border (`border-white/40`) to catch the light.
- **Level 3 (Primary Cards):** Similar glass effect but with a soft `shadow-xl` (low opacity, large blur) to pull them forward.
- **Level 4 (In-Card Containers):** These are recessed using `shadow-inner` and a darker surface tint (`surface-container-low`) to create a "well" for data logs and terminal streams.

## Shapes
The design system employs a **Leaf-Signature Shape Language**. 
- **Standard Cards:** Use a base `16px` (1rem) radius.
- **Feature Cards:** Use asymmetric rounding—`32px` for top-left and bottom-right corners, and `12px` for the others—to mimic an organic leaf shape.
- **Interactive Elements:** Buttons and search bars use "Full" (Pill) rounding for a friendly, approachable feel.
- **Indicators:** Small status dots and profile avatars are always perfectly circular.

## Components
- **Buttons:** Primary buttons should be pill-shaped with subtle gradients or solid deep greens. Secondary buttons should use the "glass" style (semi-transparent with a border).
- **Cards:** Must feature the `backdrop-blur` and thin light borders. The "Leaf" card style is reserved for the primary dashboard focus.
- **Progress Bars:** Use a dual-color gradient (Secondary to Primary) to show progression, housed in a recessed, rounded track.
- **Status Chips:** Small, fully rounded capsules with a leading dot indicator (e.g., Pulsing blue for "In Progress").
- **AI Stream:** A specific component for logging. It uses a monospace font, 14px size, and staggered opacity (30% for past, 60% for recent, 100% for active) to show time-based reasoning.
- **Navigation:** Sidebar links use a "vertical pill" indicator on the right side of the active item to maintain a clean, modern aesthetic.
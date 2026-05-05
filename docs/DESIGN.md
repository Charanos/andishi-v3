---
name: Andishi v3 Cosmic Identity
colors:
  surface: '#15121b'
  surface-dim: '#15121b'
  surface-bright: '#3b3742'
  surface-container-lowest: '#0f0d15'
  surface-container-low: '#1d1a23'
  surface-container: '#211e27'
  surface-container-high: '#2c2832'
  surface-container-highest: '#37333d'
  on-surface: '#e7e0ed'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e7e0ed'
  inverse-on-surface: '#322f39'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb869'
  on-tertiary: '#482900'
  tertiary-container: '#ca801e'
  on-tertiary-container: '#3f2300'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdcbb'
  tertiary-fixed-dim: '#ffb869'
  on-tertiary-fixed: '#2c1700'
  on-tertiary-fixed-variant: '#673d00'
  background: '#15121b'
  on-background: '#e7e0ed'
  surface-variant: '#37333d'
typography:
  display-xl:
    fontFamily: Outfit
    fontSize: 80px
    fontWeight: '300'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '300'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '400'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: 0em
  label-caps:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.15em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  gutter: 24px
  margin-safe: 64px
  section-gap: 160px
  glass-padding: 32px
---

## Brand & Style

This design system establishes a cinematic, high-end editorial aesthetic that prioritizes atmospheric depth and intellectual elegance. The identity is built upon the concept of "Cosmic Order," moving away from generic sci-fi tropes toward a sophisticated, gallery-inspired execution. It targets creative professionals and visionaries who value precision, fluidity, and immersive digital environments.

The visual style is a hyper-refined **Layered Glassmorphism**. Unlike standard glass effects, this system utilizes varying refractive indices and multi-layered transparency to simulate the depth of nebulae and the clarity of orbital lenses. Imagery should consist of high-fidelity 3D cosmic illustrations—specifically star clusters, orbital paths, and gas clouds—rendered with soft, photorealistic light scattering. Animations are staggered and physics-based, creating a sense of weightlessness and intentionality. Strict adherence to the "no-bold" and "no-sparkle" policy ensures the brand remains premium and avoids visual clutter.

## Colors

The palette is dual-themed, transitioning between the vastness of deep space and the clarity of stellar luminosity.

**Nebula Dark** utilizes a #07050F base. It is not a pure black, but a deeply saturated violet-tinted void. Primary violet and cyan hues are used as glowing interactive elements or soft background orbs. 

**Stellar Light** mimics high-end frosted glass. It uses a clean arctic blue and lavender accent system against a neutral, high-key background. 

Both themes rely on **glassmorphism** for surface definition. Surfaces are defined by their backdrop blur (30px-60px) and a subtle 1px inner stroke that mimics light catching the edge of a lens. Avoid solid fills for containers; prefer semi-transparent layers that allow background cosmic illustrations to bleed through softly.

## Typography

This design system exclusively uses **Outfit** to achieve a geometric yet humanistic feel. To maintain the high-end creative aesthetic, **bold weights are strictly prohibited**. Emphasis is created through scale, letter spacing, and color shifts rather than thickness.

- **Display & Headlines:** Use weight 300 for a sophisticated, "hairline" elegance. Large displays should have tight letter spacing to feel like a singular architectural element.
- **Body Text:** Use weight 400 for optimal readability against glass backgrounds. 
- **Labels & Navigation:** Use weight 500 in uppercase with generous letter spacing to act as "instrumentation" style markers, grounding the cosmic visuals with technical precision.
- **Contrast:** High contrast is achieved by pairing light grey text on dark backgrounds or deep indigo text on light backgrounds.

## Layout & Spacing

The layout philosophy follows a **fixed-width grid** with expansive, "breathtaking" whitespace. Inspired by high-end editorial portfolios, the layout uses staggered offsets to create a sense of floating objects in 3D space.

Elements are placed on a 12-column grid, but components should frequently break the grid or span asymmetrical columns (e.g., a 7-column main card paired with a 3-column orbital sidebar). Spacing is generous; section gaps of 160px or more are encouraged to let the cosmic illustrations "breathe." Content within glass cards should use a minimum of 32px padding to maintain the feeling of airy transparency.

## Elevation & Depth

Depth is not communicated through traditional shadows, but through **Z-axis stacking and refraction**.

1.  **Level 0 (Deep Space):** The base background layer (#07050F) containing the primary 3D cosmic illustrations.
2.  **Level 1 (Orbital Planes):** Large, low-opacity glass panels with heavy blur (60px). These act as the primary structural containers.
3.  **Level 2 (Active Elements):** Smaller, more opaque glass cards or buttons with a slight "glow" (inner shadow with color tint) instead of a drop shadow.
4.  **Level 3 (Interaction):** Floating tooltips or modals that use a 1px "Stellar" border—a linear gradient stroke that mimics a ray of light hitting an edge.

Shadows, if used, must be extremely diffused and tinted with the secondary color (#06B6D4) at 5-10% opacity, acting more as an ambient occlusion effect than a shadow.

## Shapes

The shape language is defined by **perfect circles and ultra-refined soft rectangles**. 

- **Primary Containers:** 1rem (16px) corner radius. This provides a modern, "iPhone-pro" feel that is friendly yet professional.
- **Interactive Elements:** Pill-shapes are reserved for small labels and chips to contrast against the larger rectangular glass panes.
- **Masking:** Use large circular masks for cosmic 3D assets to mimic the view through a telescope or porthole.
- **Borders:** All glass elements must feature a 1px border. In the dark theme, use a gradient border (Transparent -> Cyan/Violet -> Transparent) to simulate orbital light paths.

## Components

- **Buttons:** Use a "Ghost Glass" style. No solid backgrounds. A button is a glass container with a 1px border. On hover, the border glow intensifies and the backdrop blur increases.
- **Input Fields:** Minimalist under-lines or very subtle glass wells. The focus state is a "pulse" of the primary violet color.
- **Cards:** The hallmark of the design system. Cards feature a vertical gradient from top-left (low opacity) to bottom-right (higher opacity) to create a sense of light direction.
- **Staggered Lists:** Use Framer Motion to animate list items with a "slide-and-fade" effect, where each item appears 0.1s after the previous, simulating a planetary alignment sequence.
- **The Logo (Anchor):** The logo ({{DATA:DOCUMENT:DOCUMENT_5}}) should be placed in the top-left or center-hero position, acting as the "Sun" of the layout. It should be treated as a physical object within the glass layers, occasionally casting a soft cyan light on nearby elements.
- **Avoid:** Do not use basic mesh gradients (use 3D renders instead) and do not use sparkle or star icons which cheapen the professional "Stellar" aesthetic.
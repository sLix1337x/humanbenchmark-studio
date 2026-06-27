---
name: Design-UI-Dark
description: Design System — Agent Instructions
---

# Design System — Agent Instructions

This skill describes the visual design language for all UI output. Every component, layout, and page should follow the design specs in the module files below. These describe *what the design looks like* — you choose how to implement the styles.

## Style
Space Mission — a bold, dark mission-control interface: mars red (#BD5347) glow on a near-black (#050505) surface, with orange and slate accents. Flat by design (no shadows, no gradients on surfaces), single continuous background, Space Grotesk typography, and a tactile pill button. Evokes spacecraft dashboards and mission-control telemetry.


## Before Writing Any Code

1. **Read every module that applies.** For a landing page, read at minimum: `layout.md`, `typography.md`, `colors.md`, `buttons.md`, `cards.md`, `shadows.md`, `radius.md`, `borders.md`. Do NOT write JSX until you have loaded all relevant modules.

## Critical Rules

- **Tokens are AGNOSTIC, NOT Tailwind classes:** The tokens defined in the `.md` files (like `neutral-primary-soft`, `heading`, `border-default`) are agnostic design system tokens, NOT literal Tailwind classes. Do not blindly use classes like `bg-neutral-primary-soft` unless you have explicitly mapped them in the CSS/Tailwind configuration. You must implement the mapping yourself.

- **Cross-reference modules.** A card containing buttons must satisfy both `cards.md` AND `buttons.md`.
- **Single dark surface.** This is a dark-first mission-control system. The whole app shares one section/background surface (#050505); cards sit on a lighter derivate (#0D0B08). The color tokens carry the same dark values in both light and dark modes via `@media (prefers-color-scheme: dark)` — never manually swap colors and never alternate or tint section backgrounds.
- **Consistent section spacing.** Every section uses the same vertical padding with equal top and bottom (96px), so the gap between any two consecutive sections is always symmetric. Never give a section more padding on one side than the other.
- **Flat by design.** No box-shadow on cards, inputs, or other components, and no gradients on surfaces. Depth comes from surface color steps and 1px borders. (The tactile button in `buttons.md` is the only component whose layered insets are part of its own surface.)
- **Every interactive element needs hover, focus, and disabled states** — defined in the relevant module.
- **Use semantic HTML:** proper heading hierarchy (`h1`→`h6`), `<button>` for actions, `<a>` for navigation, ARIA attributes where needed.

## Module Index

### Foundation (read first for any UI work)
- [colors.md](colors.md) — all background, text, and border color tokens
- [typography.md](typography.md) — heading scale, paragraphs, labels, links
- [layout.md](layout.md) — spacing rhythm, containers, animation, visual depth
- [radius.md](radius.md) — border-radius scale
- [shadows.md](shadows.md) — elevation tokens
- [borders.md](borders.md) — border widths and styles

### Components
- [buttons.md](buttons.md) — button variants, sizes, states, glint effect
- [button-group.md](button-group.md) — grouped button structure
- [cards.md](cards.md) — card structure, background, interactivity
- [inputs.md](inputs.md) — form controls, labels, states
- [alerts.md](alerts.md) — alert variants
- [badges.md](badges.md) — badge variants, sizes, dismissible chips
- [lists.md](lists.md) — list components
- [avatars.md](avatars.md) — avatar variants, sizes, indicators
- [icon-shapes.md](icon-shapes.md) — icon containers

### Complex Components
- [accordion.md](accordion.md) — accordion variants
- [dropdown.md](dropdown.md) — dropdown menus
- [modals.md](modals.md) — modal dialogs
- [tabs.md](tabs.md) — tab navigation
- [tables.md](tables.md) — table structure
- [pagination.md](pagination.md) — pagination components
- [sidebars.md](sidebars.md) — sidebar navigation
- [radios-checkboxes-toggle.md](radios-checkboxes-toggle.md) — selection controls
- [tooltips-popovers.md](tooltips-popovers.md) — tooltips and popovers
- [content.md](content.md) — grid system, responsiveness

# Accordion

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Wrapper:** full width, 1px border (border-default color), 12px radius — clips first/last item corners
- **Item separator:** 1px bottom border (border-default) on every item except last

## Trigger (Button)

- **Layout:** flex, space-between, full width
- **Padding:** 20px horizontal, 16px vertical
- **Font:** 14px, medium weight
- **Text color:** heading
- **Background:** neutral-secondary-soft
- **Hover:** neutral-tertiary-soft background
- **Focus:** outline none, 2px ring in brand color
- **Transition:** colors, 150ms
- **Open state:** neutral-tertiary-soft background

## Panel (Content)

- **Padding:** 20px horizontal, 16px vertical
- **Background:** neutral-primary-soft
- **Top border:** 1px, border-default color
- **Font:** 14px, body color, 1.625 line-height

## Chevron Icon

- Size: 16x16px
- Color: body text color
- Closed: 0deg rotation
- Open: 180deg rotation
- Transition: transform, 150ms

## Variants

### Default (Collapse)
One panel open at a time. Items stacked inside a single shared bordered/rounded wrapper.

### Separated Cards
Each item is independent — has its own 1px border, 12px radius, and shadow-xs. 8px bottom margin between items. No shared outer border.

### Always Open
Multiple panels can expand simultaneously. Same styling as Default.

### Flush
No outer border. Trigger and panel have transparent backgrounds. Only bottom border dividers between items. Use inside containers that already provide a background.

## States

| State | Trigger appearance |
|---|---|
| Closed | heading text, neutral-secondary-soft background |
| Open | heading text, neutral-tertiary-soft background |
| Hover | neutral-tertiary-soft background |
| Focus | 2px brand ring, no outline |
| Disabled | fg-disabled text, not-allowed cursor, no hover/focus |

# Alerts

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Padding:** 16px
- **Radius:** 12px (base)
- **Border:** 1px
- **Heading:** 16px, medium weight
- **Body:** 14px, normal weight, 1.6 line-height

## Variants

### Brand
- **Background:** brand-softer
- **Border:** border-brand-subtle
- **Text:** fg-brand-strong

### Success
- **Background:** success-soft
- **Border:** border-success-subtle
- **Text:** fg-success-strong

### Danger
- **Background:** danger-soft
- **Border:** border-danger-subtle
- **Text:** fg-danger-strong

### Warning
- **Background:** warning-soft
- **Border:** border-warning-subtle
- **Text:** fg-warning

# Avatars

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Circular shape:** fully rounded (9999px)
- **Rounded square shape:** 12px radius
- **Default size:** 40x40px
- **Image fit:** cover

## Sizes

| Size | Dimensions | Radius |
|---|---|---|
| Extra Small | 18x18px | 4px |
| Small | 24x24px | 4px |
| Base | 32x32px | 12px |
| Large | 44x44px | 12px |
| XL | 56x56px | 12px |
| 2XL | 64x64px | 12px |

## Bordered Avatar

- 4px padding, fully rounded, 2px outline in border-default color
- Alternative: 2px box-shadow ring in border-default color

## Stacked Avatars

- Displayed in a row (flex)
- Each avatar: 40x40px, fully rounded, 2px border in border-buffer color
- Overlap: -16px negative margin on all except first

### Stacked Counter
- Same size as avatars (40x40px), fully rounded
- Background: dark-strong, text: white, 12px font, medium weight
- Same overlap margin as other avatars

## Avatar with Text

- Flex row, 10px gap between avatar and text
- Avatar: 40x40px, fully rounded, cover fit
- Name: heading color, medium weight
- Subtitle: 14px, body color

# Badges

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Border:** 1px
- **Default radius:** 8px
- **Pill radius:** 9999px

## Sizes

| Size | Font size | Horizontal padding | Vertical padding |
|---|---|---|---|
| Default (small) | 12px | 6px | 2px |
| Large | 14px | 8px | 4px |

## Variants

### Brand
- **Background:** brand-softer
- **Border:** border-brand-subtle
- **Text:** fg-brand-strong

### Alternative (Neutral Soft)
- **Background:** neutral-primary-soft
- **Border:** border-default
- **Text:** body

### Gray (Neutral Medium)
- **Background:** neutral-secondary-medium
- **Border:** border-default
- **Text:** heading

### Danger
- **Background:** danger-soft
- **Border:** border-danger-subtle
- **Text:** fg-danger-strong

### Success
- **Background:** success-soft
- **Border:** border-success-subtle
- **Text:** fg-success-strong

### Warning
- **Background:** warning-soft
- **Border:** border-warning-subtle
- **Text:** fg-warning

### Dark
- **Background:** dark
- **Border:** transparent
- **Text:** white

## Pill Badges

Use 9999px radius instead of 8px on any variant.

## Badges with Icons

- Icon size (default): 12x12px
- Icon size (large): 14x14px
- Icon spacing: 4px margin next to label

## Icon-only Badge

Square shape — equalize dimensions to 24x24px, no horizontal text padding.

## Dismissible Badges

Badge content + a close button. Close button hover backgrounds per variant:

| Variant | Close button hover background |
|---|---|
| Brand | brand-soft |
| Alternative | neutral-tertiary |
| Gray | neutral-quaternary |
| Danger | danger-medium |
| Success | success-medium |
| Warning | warning-medium |

## Dot / Notification Badge

- Positioned absolutely: -4px top, -4px right
- Size: 12x12px, fully rounded
- 2px border in border-buffer color
- Background: danger

# Borders

## Width Scale

| Context | Width |
|---|---|
| Default (inputs, buttons, cards) | 1px |
| Emphasis / focus | 2px |

## Rules

- Use solid borders by default
- Dashed borders only for special cases like file dropzones
- Components in the same family must use matching border widths
- Never mix 1px and 2px borders within a single component

## Usage

| Context | Width |
|---|---|
| Inputs / selects / textareas | 1px default; 2px on focus or error |
| Buttons | 1px for variants that require outlining |
| Cards / containers | 1px subtle; avoid stacked heavy borders |
| Section frame (rails + dividers) | 1px, border-dark |

## Section Framing

Borders are the primary way sections are separated in this system — use them whenever possible.

- Wrap the centered content column in 1px left + right rails (border-dark) that run the full page height.
- Give each section a 1px bottom divider in the same token so consecutive sections are fully boxed by the shared rails.
- Close the frame with a 1px top border on the page shell and a 1px bottom border on the sticky header.
- Keep the whole frame to a single 1px width and the border-dark color so rails and dividers align into one grid. Never mix widths or colors within the frame, and never replace the frame with a shadow.

# Button Groups

> Dependencies: `buttons.md`, `colors.md`, `radius.md`

## Core Specs

- **Wrapper:** inline-flex, 12px radius, no shadow
- **Children overlap:** -1px left margin on all except first button
- **Buttons inside the group share one continuous surface.** The wrapper and buttons carry no box-shadow; separation comes from the 1px borders between segments.

## Anatomy

### Wrapper
- Display: inline-flex
- Radius: 12px
- Shadow: none

### First Button
- 12px radius on inline-start side only, 0 on inline-end

### Middle Button(s)
- No radius (0 on all corners)

### Last Button
- 12px radius on inline-end side only, 0 on inline-start

### All buttons except first
- -1px left margin to overlap borders

## Rules

- Buttons inside groups follow all styles from `buttons.md` (background, border, focus rings) except individual shadows
- Icon-only buttons: 16x16px icon, match height of text buttons

# Buttons

> Dependencies: `colors.md`, `radius.md`, `shadows.md`

## Core Specs (every button except ghost and disabled)

Buttons use a **tactile, raised pill** construction. The depth is built entirely from layered *inset* highlights and shadows that live on the button surface itself — this is not an elevation box-shadow (the system stays flat per `shadows.md`). Every color, highlight, and shadow is drawn from the mars palette: mars red/orange/slate accents over the #050505 (rgba(5,5,5,…)) surface, with warm specular highlights shared across variants.

- **Shape:** pill — `border-radius: 100em` (the tactile button is the one component that is fully rounded rather than 12px)
- **Surface:** a two-stop linear-gradient in the variant's accent (lighter stop → base stop)
- **Highlights:** warm specular insets — `rgba(255, 225, 180, …)` (shared warm highlight on every variant), never pure white
- **Shadows / contours:** surface-color insets — `rgba(5, 5, 5, …)` (the #050505 surface)
- **Font:** Space Grotesk, weight 500, letter-spacing -0.05em
- **Text:** drawn with `background-clip: text` from a dark contrast gradient on orange/secondary variants, or a warm light gradient on brand/danger variants, or mars red gradient on dark variants
- **Box sizing:** border-box
- **Padding:** scales with font size — `1em 1.5em` on the inner layer
- **Transition:** box-shadow, clip-path, background-image and transform (250–300ms ease)
- **Press feedback:** `:hover` tightens the inner clip-path inset and deepens the inner contour; `:active` scales the inner layer to 0.975

This is **stack-agnostic** — the structure below is plain CSS with three nested layers (`.button` → `.button-outer` → `.button-inner` → `span`). Implement the same three-layer model in any framework (React, Vue, Svelte, web components, plain HTML) using whatever class/style mechanism your stack provides. Do not hardcode these hex values in app code; map them to the tokens in `colors.md`.

### Reference construction (Brand / primary)

```css
.button {
  all: unset;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  position: relative;
  border-radius: 100em;
  background-color: rgba(5, 5, 5, 0.75);
  box-shadow:
    -0.15em -0.15em 0.15em -0.075em rgba(5, 5, 5, 0.25),
    0.0375em 0.0375em 0.0675em 0 rgba(5, 5, 5, 0.1);
}

.button::after {
  content: "";
  position: absolute;
  z-index: 0;
  width: calc(100% + 0.3em);
  height: calc(100% + 0.3em);
  top: -0.15em;
  left: -0.15em;
  border-radius: inherit;
  background: linear-gradient(
    -135deg,
    rgba(5, 5, 5, 0.5),
    transparent 20%,
    transparent 100%
  );
  filter: blur(0.0125em);
  opacity: 0.25;
  mix-blend-mode: multiply;
}

.button .button-outer {
  position: relative;
  z-index: 1;
  border-radius: inherit;
  transition: box-shadow 300ms ease;
  will-change: box-shadow;
  box-shadow:
    0 0.05em 0.05em -0.01em rgba(5, 5, 5, 1),
    0 0.01em 0.01em -0.01em rgba(5, 5, 5, 0.5),
    0.15em 0.3em 0.1em -0.01em rgba(5, 5, 5, 0.25);
}

.button:hover .button-outer {
  box-shadow:
    0 0 0 0 rgba(5, 5, 5, 1),
    0 0 0 0 rgba(5, 5, 5, 0.5),
    0 0 0 0 rgba(5, 5, 5, 0.25);
}

.button-inner {
  --inset: 0.035em;
  position: relative;
  z-index: 1;
  border-radius: inherit;
  padding: 1em 1.5em;
  /* variant surface — Brand = mars red (brand-light → brand) */
  background-image: linear-gradient(
    135deg,
    rgba(208, 103, 92, 1),
    rgba(189, 83, 71, 1)
  );
  transition:
    box-shadow 300ms ease,
    clip-path 250ms ease,
    background-image 250ms ease,
    transform 250ms ease;
  will-change: box-shadow, clip-path, background-image, transform;
  overflow: clip;
  clip-path: inset(0 0 0 0 round 100em);
  box-shadow:
    /* 1 */ 0 0 0 0 inset rgba(5, 5, 5, 0.1),
    /* 2 */ -0.05em -0.05em 0.05em 0 inset rgba(5, 5, 5, 0.25),
    /* 3 */ 0 0 0 0 inset rgba(5, 5, 5, 0.1),
    /* 4 */ 0 0 0.05em 0.2em inset rgba(255, 225, 180, 0.25),
    /* 5 */ 0.025em 0.05em 0.1em 0 inset rgba(255, 225, 180, 1),
    /* 6 */ 0.12em 0.12em 0.12em inset rgba(255, 225, 180, 0.25),
    /* 7 */ -0.075em -0.25em 0.25em 0.1em inset rgba(5, 5, 5, 0.25);
}

.button:hover .button-inner {
  clip-path: inset(
    clamp(1px, 0.0625em, 2px) clamp(1px, 0.0625em, 2px)
      clamp(1px, 0.0625em, 2px) clamp(1px, 0.0625em, 2px) round 100em
  );
  box-shadow:
    /* 1 */ 0.1em 0.15em 0.05em 0 inset rgba(5, 5, 5, 0.75),
    /* 2 */ -0.025em -0.03em 0.05em 0.025em inset rgba(5, 5, 5, 0.5),
    /* 3 */ 0.25em 0.25em 0.2em 0 inset rgba(5, 5, 5, 0.5),
    /* 4 */ 0 0 0.05em 0.5em inset rgba(255, 225, 180, 0.15),
    /* 5 */ 0 0 0 0 inset rgba(255, 225, 180, 1),
    /* 6 */ 0.12em 0.12em 0.12em inset rgba(255, 225, 180, 0.25),
    /* 7 */ -0.075em -0.12em 0.2em 0.1em inset rgba(5, 5, 5, 0.25);
}

.button .button-inner span {
  position: relative;
  z-index: 4;
  font-family: "Space Grotesk", sans-serif;
  letter-spacing: -0.05em;
  font-weight: 500;
  color: rgba(0, 0, 0, 0);
  /* warm light label for contrast on the mars-red brand surface */
  background-image: linear-gradient(
    135deg,
    rgba(255, 237, 225, 1),
    rgba(255, 205, 195, 1)
  );
  -webkit-background-clip: text;
  background-clip: text;
  transition: transform 250ms ease;
  display: block;
  will-change: transform;
  text-shadow: rgba(5, 5, 5, 0.1) 0 0 0.1em;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.button:hover .button-inner span {
  transform: scale(0.975);
}

.button:active .button-inner {
  transform: scale(0.975);
}
```

Only two things change between variants: the `.button-inner` surface gradient and the `span` text gradient. The contour/highlight layers (`rgba(5,5,5,…)` shadows + `rgba(255,225,180,…)` highlights) stay the same on every variant so the whole set feels like one family.

## Sizes

Font size drives the whole button (padding is `em`-based). Use these as the per-size font sizes:

| Size | Font size | Horizontal padding | Vertical padding |
|---|---|---|---|
| Extra small | 12px | 12px | 6px |
| Small | 14px | 12px | 8px |
| Base (default) | 14px | 16px | 10px |
| Large | 16px | 20px | 12px |
| Extra large | 16px | 24px | 14px |

## Variants

### Brand
- **Surface gradient:** `rgba(208,103,92,1)` → `rgba(189,83,71,1)` (brand mars red `#BD5347`)
- **Text:** warm light gradient `rgba(255,237,225,1)` → `rgba(255,205,195,1)`
- **Tactile layers:** yes (full construction above)

### Secondary
- **Surface gradient:** `rgba(255,140,90,1)` → `rgba(255,107,53,1)` (secondary orange `#FF6B35`)
- **Text:** dark gradient `rgba(20,8,4,1)` → `rgba(60,24,12,1)`
- **Tactile layers:** yes

### Tertiary
- **Surface gradient:** `rgba(127,160,176,1)` → `rgba(98,131,149,1)` (tertiary slate `#628395`)
- **Text:** dark gradient `rgba(6,12,16,1)` → `rgba(20,34,42,1)`
- **Tactile layers:** yes

### Success
- **Surface gradient:** `rgba(92,203,154,1)` → `rgba(52,178,125,1)` (success)
- **Text:** dark gradient `rgba(4,16,11,1)` → `rgba(12,40,28,1)`
- **Tactile layers:** yes

### Danger
- **Surface gradient:** `rgba(240,88,77,1)` → `rgba(240,68,56,1)` (danger)
- **Text:** warm light gradient `rgba(255,237,225,1)` → `rgba(255,213,200,1)`
- **Tactile layers:** yes

### Warning
- **Surface gradient:** `rgba(255,179,71,1)` → `rgba(245,158,43,1)` (warning amber)
- **Text:** dark gradient `rgba(20,14,4,1)` → `rgba(60,44,14,1)`
- **Tactile layers:** yes

### Dark
- **Surface gradient:** `rgba(31,24,16,1)` → `rgba(13,11,8,1)` (deep surface)
- **Text:** mars red gradient `rgba(208,103,92,1)` → `rgba(189,83,71,1)`
- **Highlights:** soften the warm highlights to `rgba(255,225,180,0.15)` so the dark surface stays dark
- **Tactile layers:** yes

### Ghost (NO tactile layers)
- **Background:** transparent
- **Border:** transparent
- **Text:** heading color
- **Radius:** pill (100em) to match the family
- **Hover:** neutral-secondary-medium background
- **Focus ring:** 4px, neutral-tertiary color
- **No surface gradient, no inset highlight/contour layers**

### Disabled (NO tactile layers)
- **Background:** disabled token
- **Border:** border-default-medium
- **Text:** fg-disabled color
- **Cursor:** not-allowed
- **No hover, no focus, no surface gradient, no tactile layers**

## Icons in Buttons

- Icon size: 16x16px
- Spacing: 8px gap between icon and label
- Layout: inline-flex, vertically centered (place the icon inside the inner `span` so it inherits the same press transform)

# Cards

> Dependencies: `colors.md`, `radius.md`, `shadows.md`, `typography.md`

## Core Specs

- **Background:** neutral-primary-soft (#0D0B08) — a lighter derivate of the section surface it sits on, so the card lifts off the #050505 background without any shadow
- **Border:** 1px, border-default color (#201909)
- **Radius:** 12px (base)
- **Shadow:** none — cards never use box-shadow; separation comes from the lighter surface + 1px border

## Card Heading

- Desktop: 20px, medium weight, heading color
- Mobile: 16px, medium weight, heading color
- Never skip heading levels — the page hierarchy must logically arrive at the card heading level.

## Surface Derivation

- A card always uses a surface one step lighter than the surface it overlays.
- On a section (neutral-primary / #050505) → card uses neutral-primary-soft (#0D0B08).
- A card nested inside another card steps up again (neutral-primary-medium, then neutral-primary-strong) so layered cards stay readable on the dark base.

## States

### Static Card (no interactivity)
- Background: neutral-primary-soft
- Border: 1px, border-default
- Radius: 12px
- Shadow: none
- No hover styles. Non-interactive cards must NOT have hover background changes.

### Interactive Card (clickable)
- Same base styles as static card
- Hover: neutral-secondary-medium background
- Transition: colors
- Cursor: pointer

## Rules

- Background: neutral-primary-soft (lighter derivate of the underlying section)
- Border: 1px, border-default
- Radius: 12px
- Shadow: none
- Interactive hover: neutral-secondary-medium background
- Non-interactive: no hover styles

# Color Tokens

## Background Tokens

### Neutral
| Token | Light | Dark |
|---|---|---|
| neutral-primary-soft | #0D0B08 | #0D0B08 |
| neutral-primary | #050505 | #050505 |
| neutral-primary-medium | #15110A | #15110A |
| neutral-primary-strong | #1F1810 | #1F1810 |
| neutral-secondary-soft | #050505 | #050505 |
| neutral-secondary | #050505 | #050505 |
| neutral-secondary-medium | #1A150C | #1A150C |
| neutral-secondary-strong | #241D11 | #241D11 |
| neutral-tertiary-soft | #0D0B08 | #0D0B08 |
| neutral-tertiary | #15110A | #15110A |
| neutral-tertiary-medium | #241D11 | #241D11 |
| neutral-quaternary | #2E2415 | #2E2415 |
| quaternary-medium | #3A2E1B | #3A2E1B |
| gray | #5C4D34 | #5C4D34 |

### Brand
| Token | Light | Dark |
|---|---|---|
| brand-softer | #1B0C0A | #1B0C0A |
| brand-soft | #36130F | #36130F |
| brand | #BD5347 | #BD5347 |
| brand-medium | #6E2A22 | #6E2A22 |
| brand-strong | #A23E33 | #A23E33 |

### Status
| Token | Light | Dark |
|---|---|---|
| success-soft | #07140E | #07140E |
| success | #2C9A6B | #34B27D |
| success-medium | #0E2418 | #0E2418 |
| success-strong | #34B27D | #5CCB9A |
| danger-soft | #1F0907 | #1F0907 |
| danger | #F04438 | #F04438 |
| danger-medium | #3A0F0B | #3A0F0B |
| danger-strong | #F0584D | #F0584D |
| warning-soft | #1F1405 | #1F1405 |
| warning | #F59E2B | #F59E2B |
| warning-medium | #3A2607 | #3A2607 |
| warning-strong | #FFB347 | #FFB347 |

### Button Glint (CSS custom properties, used for the glint box-shadow effect)
| Variable | Light | Dark |
|---|---|---|
| `--color-1-400` | rgba(189,83,71,0.20) | rgba(189,83,71,0.14) |
| `--color-1-700` | rgba(5,5,5,0.40) | rgba(5,5,5,0.55) |

### Utility
| Token | Light | Dark |
|---|---|---|
| dark | #0D0B08 | #0D0B08 |
| dark-strong | #050505 | #050505 |
| disabled | #15110A | #15110A |

### Accent
| Token | Value (same both modes) |
|---|---|
| purple | #9A6B63 |
| sky | #628395 |
| teal | #4E6B7C |
| pink | #FF6B35 |
| cyan | #7FA0B0 |
| fuchsia | #FF8C5A |
| indigo | #3D5563 |
| orange | #FF6B35 |

## Text Color Tokens

### Base
| Token | Light | Dark |
|---|---|---|
| white | #FFFFFF | #FFFFFF |
| black | #050505 | #050505 |
| heading | #BD5347 | #BD5347 |
| body | #B7A98E | #B7A98E |
| body-subtle | #9A6B63 | #9A6B63 |

### Brand
| Token | Light | Dark |
|---|---|---|
| fg-brand-subtle | #6E2A22 | #6E2A22 |
| fg-brand | #BD5347 | #BD5347 |
| fg-brand-strong | #D77A6E | #D77A6E |

### Status
| Token | Light | Dark |
|---|---|---|
| fg-success | #34B27D | #2C9A6B |
| fg-success-strong | #5CCB9A | #34B27D |
| fg-danger | #F0584D | #F04438 |
| fg-danger-strong | #FF8475 | #F0584D |
| fg-warning-subtle | #F59E2B | #FFB347 |
| fg-warning | #FFC65E | #F59E2B |
| fg-disabled | #5C4D34 | #5C4D34 |

### Informational / Accent
| Token | Light | Dark |
|---|---|---|
| fg-yellow | #FFB347 | #FFB347 |
| fg-info | #9DB3C0 | #628395 |
| fg-purple | #A68078 | #9A6B63 |
| fg-purple-strong | #C9A098 | #A68078 |
| fg-cyan | #7FA0B0 | #628395 |
| fg-indigo | #628395 | #7FA0B0 |
| fg-pink | #FF6B35 | #FF8C5A |
| fg-lime | #A8B36A | #B7CC84 |

## Border Color Tokens

| Token | Light | Dark |
|---|---|---|
| border-dark | #2E2415 | #3A2E1B |
| border-buffer | #050505 | #050505 |
| border-buffer-medium | #0D0B08 | #0D0B08 |
| border-buffer-strong | #15110A | #15110A |
| border-muted | #14110A | #14110A |
| border-light-subtle | #1A150C | #1A150C |
| border-light | #201909 | #201909 |
| border-light-medium | #2A2114 | #2A2114 |
| border-default-subtle | #1A150C | #1A150C |
| border-default | #201909 | #201909 |
| border-default-medium | #2A2114 | #2A2114 |
| border-default-strong | #3A2E1B | #3A2E1B |
| border-success-subtle | #0E2418 | #0E2418 |
| border-success | #2C9A6B | #34B27D |
| border-danger-subtle | #3A0F0B | #3A0F0B |
| border-danger | #F04438 | #F04438 |
| border-warning-subtle | #3A2607 | #3A2607 |
| border-warning | #F59E2B | #FFB347 |
| border-brand-subtle | #36130F | #36130F |
| border-brand-light | #A23E33 | #A23E33 |
| border-brand | #BD5347 | #BD5347 |
| border-dark-subtle | #2A2114 | #2A2114 |
| border-purple | #9A6B63 | #9A6B63 |
| border-orange | #FF6B35 | #FF6B35 |

## Semantic Usage Rules

- Page/section backgrounds: all sections share the same surface — neutral-primary (#050505). Do not alternate or tint section backgrounds.
- Cards over sections: neutral-primary-soft — a lighter derivate of the section surface so the card lifts off the background. Nested cards step up one neutral level (neutral-primary-medium / -strong).
- Inputs: use neutral-secondary-medium so the field reads with clear contrast against whatever surface it sits on.
- Primary buttons: brand background
- Headings: heading text color (brand mars red `#BD5347`)
- Body text: body text color
- All-caps section labels: fg-brand-strong
- Metadata, captions, footer copy: gray
- Placeholders and subtle helpers: body-subtle (dusty mars, never gold/amber)
- CTA links: fg-brand text color
- Default borders: border-default
- Status borders match intent: success → border-success, danger → border-danger, warning → border-warning
- Disabled: disabled background + fg-disabled text

## Prohibited

- No raw hex/rgb values in component code — always use design tokens
- No brand text color for long-form paragraphs
- No accent text tokens (fg-purple, etc.) for body copy or navigation
- No brand/accent backgrounds for large layout surfaces (pages, sections) unless it's a hero/campaign area
- No manual light/dark value swapping — let the CSS custom properties handle it

# Content & Grid System

> Dependencies: `layout.md`, `typography.md`

## Containers

| Type | Max width | Horizontal padding |
|---|---|---|
| Standard | 1280px | 16px |
| Internal (reading) | 768px | — (45–75 char line length) |

## Vertical Padding

| Breakpoint | Vertical padding |
|---|---|
| Mobile | 32px |
| Tablet (≥768px) | 48px |
| Desktop (≥1024px) | 64px or 96px for hero/feature sections |

## Grid System

Mobile-first with flexible desktop configurations.

| Context | Gap |
|---|---|
| Standard content/cards | 32px |
| Compact widgets/metadata | 16px |

### Responsive Columns

| Breakpoint | Columns |
|---|---|
| Mobile (default) | 1–2 |
| Small/Tablet (≥640px) | 2–4 |
| Desktop (≥1024px) | 3–12 |

Full support for 6, 7, 8, 9+ column grids where needed.

## Breakpoints

| Name | Width |
|---|---|
| Small | 640px |
| Medium | 768px |
| Large | 1024px |
| Extra large | 1280px |
| 2x Extra large | 1536px |

## Rules

- Always design mobile-first
- Use layout shifts (column → row) to accommodate horizontal space
- Lists: 24px indentation, 8px vertical gap between items
- Body copy: 16px, 1.625 line-height
- All interactive links follow brand underline/hover protocol

# Dropdown

> Dependencies: `colors.md`, `radius.md`, `shadows.md`, `inputs.md`

## Core Specs

### Chevron Icon
- Size: 16x16px
- Spacing: 6px left margin, -2px right margin
- Color: inherits from trigger button

### Menu Container
- Background: neutral-primary-soft
- Border: 1px, border-default
- Radius: 12px (base)
- Shadow: shadow-lg
- Z-index: elevated above content

### Menu List
- Padding: 8px
- Font: 14px, body color, medium weight

### Menu Item
- Layout: inline-flex, vertically centered, full width
- Padding: 8px horizontal, 8px vertical
- Radius: 8px (default)
- Hover: neutral-tertiary-medium background, heading text
- Transition: colors, 150ms

## Trigger Sizes

| Size | Font size | Horizontal padding | Vertical padding |
|---|---|---|---|
| Small | 14px | 12px | 8px |
| Base | 14px | 16px | 10px |
| Large | 16px | 20px | 12px |

## Icon-only Trigger

- Padding: 8px
- Min size: 44x44px
- Icon: 20x20px

## Variants

### Default
- Menu width: 176px, items have 8px radius

### With Divider
- Top border (border-default) between child groups, skip first group

### With Header
- Header padding: 16px horizontal, 12px vertical
- Bottom border: border-default
- Name: heading color, 14px, semibold weight
- Email: body-subtle color, 14px, truncated

### With Icons
- Icon before label: 16x16px, 8px right margin, body color
- On hover, icon color changes to heading

### With Checkbox / Radio
- Inputs: 16x16px, 4px radius, focus ring in brand-soft
- Helper text: 12px, body-subtle color, 2px top margin

### With Search
- Search input at top of menu following `inputs.md` specs
- Left icon: 12px left padding, input 36px left padding

### Scrollable
- Max height: 192px, vertical scroll overflow

## States

| State | Appearance |
|---|---|
| Focused trigger | no outline, 2px brand ring |
| Hover item | neutral-tertiary-medium background, heading text |
| Active/open item | neutral-tertiary-soft background, heading text |
| Disabled item | fg-disabled text, not-allowed cursor, no pointer events |

# Icon Shapes

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- Box sizing: border-box
- Icon must be perfectly centered (inline-flex, centered both axes)
- Circle: fully rounded (9999px)
- Rounded square: 12px radius (MD/LG/XL), 8px radius (XS/SM)

## Sizes

| Size | Container | Icon |
|---|---|---|
| XS | 24x24px | 14x14px |
| SM | 32x32px | 16x16px |
| MD | 40x40px | 20x20px |
| LG | 48x48px | 24x24px |
| XL | 56x56px | 28x28px |

## Color Variants

### Brand
- Shape: circle
- Background: brand-softer
- Icon color: fg-brand-strong

### Gray
- Shape: circle
- Background: neutral-secondary-soft
- Icon color: body

### Danger
- Shape: circle
- Background: danger-soft
- Icon color: fg-danger-strong

### Success
- Shape: circle
- Background: success-soft
- Icon color: fg-success-strong

### Warning
- Shape: circle
- Background: warning-soft
- Icon color: fg-warning

# Inputs

> Dependencies: `colors.md`, `radius.md`

## Core Specs

- **Display:** block, full width
- **Radius:** 12px (base)
- **Border:** 1px, border-default-medium
- **Background:** neutral-secondary-medium (#1A150C) — deliberately lifted off the section/card surface so the field stays clearly distinct from the background it sits on
- **Shadow:** none — contrast comes from the field background + 1px border, never box-shadow
- **Font:** 14px, heading color
- **Padding:** 12px horizontal, 10px vertical
- **Placeholder:** body color
- **Transition:** all properties, 200ms

The input background must always read with contrast against its surrounding surface (section or card). Use the neutral-secondary-medium token rather than matching the surface color.

## Label

- Display: block
- Font: 14px, medium weight, heading color
- Margin bottom: 8px
- Label `htmlFor` must match the input `id`

## States

### Default
- Border: border-default-medium
- Background: neutral-secondary-medium

### Hover
- Border: border-default-strong

### Focus
- No outline
- Border: border-brand
- Ring: 1px, brand color

### Success
- Border: border-success
- Focus ring: 1px, success color

### Error / Danger
- Border: border-danger
- Focus ring: 1px, danger color

### Disabled
- Background: disabled
- Text: fg-disabled
- Cursor: not-allowed

## Input with Icons

- Icon size: 16x16px
- Icon color: body
- Container: relative positioned wrapper
- Start icon: absolutely positioned left, 12px left padding — input gets 36px left padding
- End icon: absolutely positioned right, 12px right padding — input gets 36px right padding
- Icons vertically centered within the wrapper

## Rules

- Every input must have a unique `id`
- Every label must have a matching `htmlFor`
- Padding: 12px horizontal, 10px vertical unless overridden for icon variants
- No arbitrary hex or hardcoded colors

# Layout & Spacing

## Spacing Rhythm

Base unit: **8px**. All spacing values should be multiples of 8px.

| Context | Value |
|---|---|
| Section vertical padding | 96px |
| Section header → content | 48px or 64px |
| Heading → paragraph | 16px |
| Container horizontal padding | 24px |
| Flex/grid row gap | 16px |
| Card grid gap | 24px |
| Wide component grid gap | 32px |
| Column layout gap | 48px |

## Container

Standard section container: max-width 1152px, centered, 24px horizontal padding.

Every major section wraps content in this container.

## Content Composition Order

Inside each section, follow this order:
1. Heading (`h1`–`h3`)
2. Leading paragraph
3. Normal paragraph(s)
4. Lists, CTA links, or component grids

## Section Pattern

Each section has:
- 96px vertical padding — identical top and bottom so the gap between consecutive sections is always symmetric
- A single shared background surface: neutral-primary (#050505). Do NOT alternate or tint section backgrounds — the whole app reads as one continuous surface.
- A centered container (max-width 1152px, 24px horizontal padding)
- A section header area with 48px bottom margin
- Section content below

## Section Framing

Whenever possible, frame the sections with borders so the whole page reads as one continuous mission-control panel. This is the default section treatment — apply it unless a layout genuinely cannot accommodate it.

- **Vertical rails:** the centered content column carries a 1px left and right border (border-dark / `--layout-border`) running the full height of the page, so every section shares the same two vertical rails.
- **Horizontal dividers:** each section has a 1px bottom border in the same token, separating it from the next. Combined with the rails, every section is fully enclosed (top edge = previous section's divider or the shell's top border).
- **Shell edges:** the page shell gets a 1px top border and the sticky header a 1px bottom border, so the frame is closed at the top.
- **One token, one weight:** use border-dark for the entire frame — same color and 1px width everywhere — so the rails and dividers line up into a single grid. Never mix widths or colors in the frame.
- **No shadows:** the frame is the separation device. Do not add shadows or glows to lift sections (see `shadows.md`).
- Borders sit on the column, not the full viewport width, so the rails stay aligned with the max-width container (1152px) on every section.

## Motion & Animation

- Prefer CSS-native: `transition`, `animation`, `@keyframes`. Use Motion library only when CSS cannot achieve the behavior.
- Prioritize high-impact orchestrated moments over scattered micro-interactions. A single well-sequenced page-load animation using staggered `animation-delay` delivers more perceived quality than many isolated effects.
- Reserve scroll-triggered and hover transitions for moments that reinforce hierarchy or reward attention.

## Backgrounds & Visual Depth

- Default to flat, solid fills on the single surface color (#050505). This is a mission-control system — no gradients, gradient meshes, or atmospheric washes.
- Create depth through surface color steps (neutral-primary → neutral-primary-soft → neutral-primary-medium), 1px borders, and the mars red accent (`#BD5347`) — never through shadows or glows.
- Allowed structural treatments are restrained and functional: thin grid lines, hairline dividers, and 1px borders. Every element must serve a compositional purpose (separation or emphasis). No purely ornamental effects competing with content.

## Must

- All sections: consistent 96px vertical padding, equal top and bottom (symmetric gap between every pair of sections)
- All sections share the same background surface (#050505) — never alternate section colors
- Frame sections with borders whenever possible: 1px vertical rails on the content column + a 1px bottom divider per section, all in border-dark (see Section Framing)
- All containers: max-width 1152px, centered, 24px horizontal padding
- Section headers: 48px or 64px bottom margin
- Consistent vertical rhythm, no crowded sections
- Layouts readable and properly spaced on both desktop and mobile

# Lists

> Dependencies: `colors.md`

## Core Specs

- Item spacing: 16px vertical gap between list items
- Text: body color

## List Icons

- Size: 20x20px
- Prevent squishing: no shrink
- Spacing: 6px right margin between icon and text
- Active/featured icon: fg-brand color
- Neutral icon: body color

## Inactive / Disabled Items

Strikethrough text with body color decoration on the list item.

## Pattern

Vertical flex list with 16px gap. Each item is a flex row with centered alignment — icon (20x20, no-shrink, 6px right margin) followed by a span of body-colored text.

# Modals

> Dependencies: `colors.md`, `radius.md`, `shadows.md`, `buttons.md`, `inputs.md`

## Core Specs

### Overlay (Backdrop)
- Fixed, covers full screen
- Z-index: 40
- Background: black at 50% opacity
- Backdrop blur: small amount

### Content Container
- Background: neutral-primary
- Radius: 12px (base)
- Shadow: shadow-xl
- Padding: 20px

## Anatomy

### Header
- Bottom border: border-default
- Top corners rounded (12px)
- Title: 20px, semibold weight, heading color
- Close button: Ghost variant from `buttons.md`, 6px padding

### Body
- Vertical padding: 24px
- Vertical spacing between elements: 24px
- Text: 16px, 1.625 line-height, body color

### Footer
- Top border: border-default
- Bottom corners rounded (12px)

## Variants

### Default (Information)
Standard header + body + footer with primary/secondary action buttons.

### Pop-up (Confirmation)
Centered text, prominent icon, reduced padding:
- Body: 24px padding, text centered
- Icon: centered, 16px bottom margin, 48x48px, gray color

### Form Modal
Body contains inputs following `inputs.md`. Vertical spacing between form elements: 16px.

## Rules

- Backdrop covers full screen with fixed positioning
- Content: neutral-primary background, 12px radius, shadow-xl
- Header/Footer separated by border-default borders
- Close button must be present and functional
- Accessibility: `role="dialog"`, implement focus trap in code
- Dark mode automatic via token system

# Pagination

> Dependencies: `colors.md`, `radius.md`

## Container

Font: 14px. Items displayed as flex with -1px overlap for seamless borders.

## Pagination Item

- Layout: flex, centered both axes
- Size: 36x36px (or 40x40px)
- Text: body color, medium weight
- Background: neutral-secondary-medium
- Border: 1px, border-default-medium
- Hover: neutral-tertiary-medium background, heading text
- Focus: no outline
- Overlap: -1px left margin

## Previous / Next Buttons

- Horizontal padding: 12px, height: 36px
- First item: 12px radius on inline-start side
- Last item: 12px radius on inline-end side

## Active Page Item

- Text: fg-brand color
- Background: neutral-tertiary-medium
- Hover text: fg-brand (stays same)

## Rules

- Display as flex with -1px child overlap for seamless borders
- Items: neutral-secondary-medium background, border-default-medium border, body text
- Active: fg-brand text, neutral-tertiary-medium background
- First item: rounded start, Last item: rounded end
- All items need hover and focus states

# Radios, Checkboxes & Toggles

> Dependencies: `colors.md`, `radius.md`

## Checkbox

- Size: 16x16px
- Radius: 4px
- Border: 1px, border-default-medium
- Background: neutral-secondary-medium
- Focus ring: 2px, brand-soft

### Disabled
- Border: border-light
- Text: fg-disabled

## Radio

- Size: 16x16px
- Radius: fully rounded
- Border: 1px, border-default-medium
- Background: neutral-secondary-medium
- Focus ring: 2px, brand-soft
- Checked: border-brand, indicator: neutral-primary color

### Disabled
- Border: border-light-medium
- Text: fg-disabled

Group all radio items under the same `name` attribute.

## Toggle

### Track
- Fully rounded
- Background: neutral-quaternary
- Focus-within ring: 2px, brand-soft
- Checked track: brand background
- Disabled track: neutral-tertiary background

### Thumb
- Fully rounded
- Background: white
- Border: border-buffer

### Disabled
- Track: neutral-tertiary background
- Label: fg-disabled text

## Rules

- All selection inputs must have `id` matching label `htmlFor`
- Focus states use the appropriate brand token for each control type
- Disabled states: no hover/focus interaction

# Border Radius

| Token | Value | Default usage |
|---|---|---|
| base | 12px | Buttons, cards, inputs, modals, sections |
| default | 8px | Badges, tooltips, dropdown items, small controls |
| sm | 4px | Checkboxes, tiny elements |
| full | 9999px | Pills, avatars, toggles, dot indicators |

## Rules

- 12px is the default radius across the product
- Never use arbitrary radius values outside this scale
- Radius must be consistent within each component family

# Shadows

This is a flat, mission-control system. Depth comes from surface color steps and 1px borders, never from drop shadows. Every elevation token resolves to `none`.

| Token | CSS value |
|---|---|
| shadow-2xs | `none` |
| shadow-xs | `none` |
| shadow-sm | `none` |
| shadow-md | `none` |
| shadow-lg | `none` |
| shadow-xl | `none` |
| shadow-2xl | `none` |

## Component Mapping

| Component type | Token |
|---|---|
| Subtle separators, tiny UI details | shadow-2xs or shadow-xs |
| Inputs, buttons, small controls, lightweight cards | shadow-xs or shadow-sm |
| Standard cards, popovers, dropdowns | shadow-md |
| Prominent cards, sticky surfaces | shadow-lg |
| Modals, high-priority overlays | shadow-xl |
| Hero overlays, top-level emphasis (sparingly) | shadow-2xl |

## Rules

- The system is flat on purpose — cards, buttons, inputs, and every other component carry **no box-shadow**.
- Express elevation with surface steps (neutral-primary → neutral-primary-soft → neutral-primary-medium) and 1px borders instead of shadows.
- Use only these tokens — no custom box-shadow values.
- The single exception is the tactile button construction in `buttons.md`, whose layered inset highlights are part of the button surface itself, not an elevation shadow.
- Never reintroduce drop shadows or glows to separate surfaces; rely on contrast and borders.

# Sidebars

> Dependencies: `colors.md`, `radius.md`, `typography.md`, `badges.md`, `alerts.md`

## Core Specs

- Background: neutral-primary-soft
- Right border: 1px, border-default (for left-sidebar); left border for right-sidebar
- Width: 256px

## Anatomy

### Outer Container
Hidden on mobile, visible at small breakpoint. Needs a toggle/trigger for mobile.

### Inner Wrapper
- Full height, vertical scroll overflow
- Padding: 12px horizontal, 16px vertical

### Navigation List
- Vertical spacing: 8px between items
- Font weight: medium

### Navigation Item
- Layout: flex, vertically centered
- Padding: 8px horizontal, 8px vertical
- Text: heading color
- Radius: 12px (base)
- Hover: neutral-secondary-medium background
- Transition: colors
- Icon: 20x20px, body color, hover → heading color, 75ms transition
- Label: 12px left margin from icon

### Active Item
- Background: neutral-secondary-strong
- Text: fg-brand-strong

### Separator
- 16px top padding, 16px top margin
- Top border: border-default
- 8px vertical spacing below

### Bottom CTA / Card
- Padding: 16px
- Top margin: 24px
- Radius: 12px (base)
- Background: brand-softer
- Can also use any alert variant from `alerts.md`

## Rules

- Responsive: hidden on mobile with a trigger mechanism
- Icons: 20x20px, body color (hover: heading color)
- Multi-level menus: indent with 44px left padding
- Spacing follows 8px grid
- Only neutral, brand, or status tokens — no arbitrary colors

# Tables

> Dependencies: `colors.md`, `radius.md`, `shadows.md`

## Wrapper

- Horizontal scroll overflow
- Background: neutral-primary-soft
- Radius: 12px (base)
- Border: 1px, border-default
- Shadow: shadow-xs

## Table Element

- Full width, left-aligned text (right-aligned for RTL)
- Font: 14px, body color

## Table Head

- Font: 14px, body color, medium weight
- Background: neutral-secondary-soft
- Bottom border: border-default
- Cell padding: 24px horizontal, 12px vertical

## Table Body

- Row background: neutral-primary
- Row bottom border: border-default (omit on last row to avoid doubling with wrapper border)
- Row hover: neutral-secondary-soft background (optional)
- Row header: medium weight, heading color, no-wrap
- Cell padding: 24px horizontal, 16px vertical

## Rules

- Wrapper must have horizontal scroll overflow for responsive scrolling
- Last row: omit bottom border to avoid doubling with wrapper border
- Row headers: always `scope="row"` for semantic structure
- Hover on rows is optional
- No arbitrary hex codes — use token colors only

# Tabs

> Dependencies: `colors.md`, `radius.md`, `shadows.md`

## Core Specs

- Typography: 14px, medium weight, body color
- Transitions: all properties, 200ms

## Variants

### 1. Underline (Default)

**Wrapper:** bottom border, border-default

**Tab Item:**
- Padding: 16px horizontal, 16px vertical
- Bottom border: 2px, transparent
- Top corners: 12px radius
- Transition: colors, 150ms

| State | Appearance |
|---|---|
| Active | fg-brand text, border-brand bottom border |
| Inactive | transparent bottom border; hover → heading text, border-default-strong bottom border |
| Disabled | fg-disabled text, not-allowed cursor |

### 2. Pills

**Tab Item:**
- Padding: 16px horizontal, 10px vertical
- Radius: 12px (base)
- Font weight: medium
- Transition: all, 200ms

| State | Appearance |
|---|---|
| Active | brand background, warm light text on mars red, shadow-sm |
| Inactive | body text; hover → neutral-secondary-soft background, heading text |
| Disabled | fg-disabled text, not-allowed cursor |

### 3. Full Width

Children overlap with -1px left margin on all except first.

**Tab Item:**
- Full width, centered text
- Padding: 16px horizontal, 16px vertical
- Background: neutral-primary-soft
- Border: 1px, border-default
- Transition: colors, 150ms
- Hover: neutral-secondary-medium background, heading text

| State | Appearance |
|---|---|
| Active | neutral-secondary-soft background, fg-brand text |
| First item | rounded start (12px) |
| Last item | rounded end (12px) |

## Tabs with Icons

- Icon size: 16x16px or 20x20px
- Spacing: 8px right margin
- Layout: inline-flex, centered
- Icons inherit the text color of the tab state

# Tooltips & Popovers

> Dependencies: `colors.md`, `radius.md`, `shadows.md`

## Tooltips

### Core Specs
- Padding: 12px horizontal, 8px vertical
- Font: 14px, medium weight
- Radius: 8px (default)
- Shadow: shadow-xs
- Transition: opacity, 300ms

### Dark (Default)
- Background: dark
- Text: white
- Border: transparent

### Light
- Background: neutral-primary-medium
- Text: heading color
- Border: 1px, border-default

## Popovers

### Core Specs
- Background: neutral-primary
- Radius: 12px (base)
- Shadow: shadow-md
- Border: 1px, border-default
- Transition: opacity, 300ms

### Header / Title
- Padding: 12px horizontal, 8px vertical
- Background: neutral-secondary-soft
- Bottom border: border-default
- Font: 14px, medium weight, heading color

### Body / Content
- Standard: 12px horizontal, 8px vertical padding; 14px, body color
- Rich: 16px padding; 14px, body color

## Arrows

- Size: 8x8px rotated 45deg
- Color must match the background of the tooltip/popover variant

## Rules

- Tooltips: 8px radius
- Popovers: 12px radius
- Dark tooltips: dark background, white text
- Light tooltips/popovers: semantic neutral background + border tokens
- Arrows match parent background color

# Typography

> Dependencies: `colors.md`

## Core Rules

- **Font:** Space Grotesk, sans-serif — configured at app level, never override
- **Headings:** medium weight (500), heading text color
- **Body copy:** body text color, never use brand color for paragraphs longer than one sentence
- **Semantic HTML:** Use `h1`–`h6` in order, never skip levels

## Heading Scale

### Desktop

| Element | Size | Line-height | Letter-spacing | Margin-bottom |
|---|---|---|---|---|
| `h1` | 60px | 1 | -0.8px | 24px |
| `h2` | 44px | 1.15 | — | — |
| `h3` | 36px | 1.2 | — | — |
| `h4` | 30px | 1.25 | — | — |
| `h5` | 24px | 1.5 | — | — |
| `h6` | 20px | 1.25 | — | — |

### Responsive

| Element | Tablet (≥768px) | Mobile (default) |
|---|---|---|
| `h1` | 40px | 32px |
| `h2` | 36px | 28px |
| `h3` | 30px | 24px |
| `h4` | 26px | 22px |
| `h5` | 22px | 20px |
| `h6` | 18px | 18px |

Mobile-first: start with mobile sizes, scale up at tablet and desktop breakpoints.

Never reduce line-height below 1.1 for any heading.

## Paragraphs

### Leading Paragraph
- Size: 20px
- Weight: normal
- Color: body
- Line-height: 1.7
- Max width: ~70 characters

### Normal Paragraph
- Size: 16px
- Weight: normal
- Color: body
- Line-height: 1.7
- Max width: ~65 characters

### Small Supporting Copy
- Size: 14px
- Weight: normal
- Color: body
- Line-height: 1.6
- Use only for helper text, legal text, captions, metadata.

## UI Labels

| Context | Size | Weight |
|---|---|---|
| Button labels | 16px | 500 (medium) |
| Input labels | 14px or 16px | 500 (medium) |
| Captions / meta / badges | 12px or 14px | 500 (medium) |
| Stat labels (below large values) | 14px | 500 (medium), gray color |

Do not apply paragraph line-height (1.7) to control labels.

## Links

- **Inline links:** Same size as surrounding text, fg-brand color, underline, hover → no underline
- **CTA links:** fg-brand color, medium weight, underline, hover → no underline

## Emphasis

- `<strong>` for high-priority emphasis in body text
- `<em>` for tone emphasis only, not visual hierarchy
- All-caps only for short labels: uppercase, 0.1em letter-spacing (wide mission-control tracking), 12px or 14px, **fg-brand-strong** color
- Metadata, footer copy, and agency names: **gray** — never body-subtle gold tones

## Dark Mode

Hierarchy stays identical. Only color tokens change (automatic via CSS custom properties). Size, weight, and spacing remain constant.
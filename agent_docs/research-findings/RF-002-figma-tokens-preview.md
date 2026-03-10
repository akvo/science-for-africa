# Research Findings: Figma Tokens Preview (RF-002)

**Project**: Science for Africa
**Source**: [Figma Token Preview](https://www.figma.com/design/9pJSajNx54DrJ1rafYOr6e/Science-for-Africa?node-id=6-87&m=dev)

## 1. Foundation Systems

### Spacing System
The spacing system follows a multi-step scale, likely base-8 with some smaller increments:
- `#0`: 4px
- `#1`: 8px
- `#2`: 16px
- `#3`: 24px
- `#4`: 32px
- `#5`: 40px
- `#6`: 48px
- `#7`: 64px
- `#8`: 80px
- `#9`: 96px
- `#10`: 112px

### Radius System
- `#none`: 0px
- `#1`: 8px
- `#2`: 16px
- `#3`: 24px
- `#4`: 32px
- `#5`: 40px
- `#6`: 48px
- `#7`: 64px
- `#full`: 999px (Full circle)

### Stroke System
- `#0`: 0px
- `#1`: 1px
- `#2`: 2px
- `#3`: 3px

### Color Palette Analysis (Green Scale)
Exact hex values extracted from Figma swatches:
- `green-50`: `#e6eeee`
- `green-100`: `#b0cbc9`
- `green-200`: `#8ab2af`
- `green-300`: `#548f8a`
- `green-400`: `#337973`
- `green-500`: `#005850` (Primary Focus)
- `green-600`: `#005049`
- `green-700`: `#003e39`
- `green-800`: `#00302c`
- `green-900`: `#002522`
- `green-1000/1110`: (Extensions for deep contrast)

**Alignment Analysis**:
- **Colors**: These do NOT align with Tailwind defaults. We must define a custom `theme.extend.colors` or `@theme` block in Tailwind v4.
- **Spacing/Radius**: Nomenclature is custom (#0, #1). Mapping to Tailwind utilities is required.

## 3. Visual Preview
![Figma Token Preview](/Users/galihpratama/.gemini/antigravity/brain/3911752c-86b8-4282-bc2f-8ef1b2a2955a/.system_generated/steps/26/screenshot.png)

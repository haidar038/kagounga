# Kagōunga Design Specification

## Typography

### Headline Font
- **Family:** Familjen Grotesk
- **Weights:** 600-800
- **Usage:** H1, H2, section titles, product names

### Body Font
- **Family:** Outfit
- **Weights:** 300-500
- **Usage:** Body text, buttons, labels, captions

## Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#DBF066` | Primary button backgrounds |
| Primary Border | `#AFC051` | Button borders, focus rings |
| Accent | `#2F31F5` | Section headlines, footer CTA bg |
| Text Primary | `#0F172A` | Main text |
| Muted | `#6B7280` | Captions, secondary text |
| Background | `#FAFAF9` | Page backgrounds |
| Surface | `#FFFFFF` | Cards, elevated surfaces |

## Component Guidelines

### Primary Button
- Background: Primary (#DBF066)
- Border: 2px Primary Border (#AFC051)
- Text: #071100 (dark for contrast)
- Hover: brightness-95
- Focus: 4px ring with Primary Border at 40% opacity

### Micro Section Headlines
- Color: Accent (#2F31F5)
- Size: 12-14px
- Style: Uppercase, tracking-wide, font-semibold

### Footer CTA
- Background: Accent (#2F31F5)
- Text: White
- Buttons: Inverted (white bg, accent text)

## Accessibility

- All text meets WCAG AA contrast requirements
- Focus states visible with 3-4px offset rings
- Primary buttons use dark text for sufficient contrast on lime background

## Font Loading

Fonts loaded via Google Fonts:
- Outfit: https://fonts.google.com/specimen/Outfit
- Familjen Grotesk: https://fonts.google.com/specimen/Familjen+Grotesk

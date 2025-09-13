Chakra v3 UI TODOs

- Adopt v3 slot API consistently:
  - [ ] Select: replace native `<select>` with `Select.Root/Trigger/Content/Item` once needed
  - [ ] Table: adopt `Table.Root/Head/Body/Row/Cell`
  - [ ] Tooltip: adopt `Tooltip.Root/Trigger/Content`
  - [ ] Tag/Badge: use recipes for consistent sizes/variants
- Theme centralization (`src/theme/`):
  - [ ] Define brand palette (Floorp Blue), success/warn/danger tokens
  - [ ] Add `semanticTokens` for `fg`, `bg`, `border`, `accent`
  - [ ] Create recipes: `Button`, `Badge`, `Tag`
  - [ ] High-contrast & color-vision presets (protanopia/deuteranopia-friendly)
- Color mode:
  - [x] Remove next-themes dependency
  - [ ] Add ColorModeScript if SSR is introduced
  - [ ] Persist last color mode (localStorage) if desired
- Accessibility:
  - [ ] Focus ring tokens & visible focus states
  - [ ] Motion preferences (`prefers-reduced-motion`) tokens


import {
  createSystem,
  defaultConfig,
  defineTokens,
  defineSemanticTokens,
  defineRecipe,
  defaultSystem,
} from "@chakra-ui/react";

// Floorp OS theme extensions (brand palette, semantic tokens, recipes)

// 1) Design tokens: brand palette ("floorp")
const brandTokens = defineTokens({
  colors: {
    // Floorp brand: Purple base (can be replaced with custom HEX scale later)
    floorp: {
      50: { value: "{colors.purple.50}" },
      100: { value: "{colors.purple.100}" },
      200: { value: "{colors.purple.200}" },
      300: { value: "{colors.purple.300}" },
      400: { value: "{colors.purple.400}" },
      500: { value: "{colors.purple.500}" },
      600: { value: "{colors.purple.600}" },
      700: { value: "{colors.purple.700}" },
      800: { value: "{colors.purple.800}" },
      900: { value: "{colors.purple.900}" },
      950: { value: "{colors.purple.950}" },
    },
  },
});

// 2) Semantic tokens: role-based colors and color palette mapping for "floorp"
const brandSemantic = defineSemanticTokens({
  colors: {
    // Accent roles (for links, highlights, focus, etc.)
    accent: {
      fg: { value: { _light: "{colors.floorp.700}", _dark: "{colors.floorp.300}" } },
      subtle: { value: { _light: "{colors.floorp.100}", _dark: "{colors.floorp.900}" } },
      muted: { value: { _light: "{colors.floorp.200}", _dark: "{colors.floorp.800}" } },
      emphasized: { value: { _light: "{colors.floorp.300}", _dark: "{colors.floorp.700}" } },
      solid: { value: { _light: "{colors.floorp.600}", _dark: "{colors.floorp.600}" } },
      contrast: { value: { _light: "white", _dark: "white" } },
      focusRing: { value: { _light: "{colors.floorp.500}", _dark: "{colors.floorp.500}" } },
    },

    // colorPalette for floorp → enables `colorPalette="floorp"` on components
    floorp: {
      contrast: { value: { _light: "white", _dark: "white" } },
      fg: { value: { _light: "{colors.floorp.700}", _dark: "{colors.floorp.300}" } },
      subtle: { value: { _light: "{colors.floorp.100}", _dark: "{colors.floorp.900}" } },
      muted: { value: { _light: "{colors.floorp.200}", _dark: "{colors.floorp.800}" } },
      emphasized: { value: { _light: "{colors.floorp.300}", _dark: "{colors.floorp.700}" } },
      solid: { value: { _light: "{colors.floorp.600}", _dark: "{colors.floorp.600}" } },
      focusRing: { value: { _light: "{colors.floorp.500}", _dark: "{colors.floorp.500}" } },
    },
  },
});

// 3) Recipes: override a few defaults with brand-friendly tweaks
//    We shallow-override to preserve Chakra defaults (variants/sizes remain intact)
const brandRecipes = {
  // Rounder buttons by default (inherits base & variants from Chakra)
  button: defineRecipe({
    base: { borderRadius: "l3", fontWeight: "semibold" },
  }),

  // Pills for badges by default
  badge: defineRecipe({
    base: { borderRadius: "full" },
  }),
};

// 4) Create the system by merging Chakra's default config with our extensions
export const system = createSystem(
  defaultConfig,
  {
    theme: {
      tokens: brandTokens,
      semanticTokens: brandSemantic,
      recipes: brandRecipes,
    },
  },
);

// Keep a named export for potential incremental adoption
export { defaultSystem };

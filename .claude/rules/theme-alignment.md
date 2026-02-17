Whenever the user asks for a styling change or a new UI component, run `get_theme_details` to ensure we use existing CSS variables (like colors and spacing) instead of hardcoded values. Specifically:

- Use Tailwind theme utilities (e.g. `bg-card`, `text-primary`, `border-border`) that map to the `@theme` block in `tailwind.css`.
- For any value not covered by a Tailwind utility, reference the CSS custom properties from `styles.scss` (e.g. `var(--accent)`, `var(--card-bg)`).
- Never hardcode hex colors or raw spacing values when a theme variable already exists.
- Respect both light and dark mode — all colors must flow through CSS variables so the `body.dark-mode` toggle works automatically.

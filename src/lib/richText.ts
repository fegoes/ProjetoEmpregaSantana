// Estilo do texto rico (descrições): usado ao exibir e, nas listas, também ao editar.
export const RICH_TEXT_CLASS = [
  'max-w-[68ch] text-sm leading-relaxed [&_a]:text-primary [&_a]:underline [&_p]:mb-3 [&_strong]:font-semibold',
  '[&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_li]:marker:text-muted-foreground',
  '[&_h2]:mt-6 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold',
  '[&_h3]:mt-5 [&_h3]:mb-1.5 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-bold',
  '[&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
].join(' ')

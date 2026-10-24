import { registerHooks } from 'node:module';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
registerHooks({ resolve(specifier, context, next) {
  if (specifier.startsWith('.') && context.parentURL) {
    const url = new URL(specifier, context.parentURL);
    if (!existsSync(fileURLToPath(url))) { for (const ext of ['.ts', '.js']) if (existsSync(fileURLToPath(url) + ext)) return next(specifier + ext, context); }
  }
  return next(specifier, context);
}});

import { store } from './store.js';
import { camelCaseify } from './utils.js';
import { atomicConfig } from './config.js';

enum Inserts {
  MODULE_ALIAS = '{{1}}',
  IMPORTS = '{{2}}',
  REGISTER_ARGS = '{{3}}',
  EXTERNALS_IMPORT = '{{4}}',
}

const TEMPLATE = `
/* -----------------------------------
* GENERATED WITH @tomic/cli
* -------------------------------- */

import { registerOntologies } from '${
  // Prevents a circular dependency
  atomicConfig._ISLIB_ ? '../ontology.js' : Inserts.MODULE_ALIAS
}';

${Inserts.IMPORTS}

export function initOntologies(): void {
  registerOntologies(${Inserts.REGISTER_ARGS});
}
`;

export const generateIndex = (
  ontologies: string[],
  inludeExternals: boolean,
) => {
  const names = ontologies.map(x => {
    const res = store.getResourceLoading(x);

    return camelCaseify(res.title);
  });

  if (inludeExternals) {
    names.push('externals');
  }

  const importLines = names.map(createImportLine).join('\n');
  const registerArgs = names.join(', ');

  const content = TEMPLATE.replaceAll(
    Inserts.MODULE_ALIAS,
    atomicConfig.moduleAlias ?? '@tomic/lib',
  )
    .replace(Inserts.IMPORTS, importLines)
    .replace(Inserts.REGISTER_ARGS, registerArgs);

  return {
    filename: 'index.ts',
    content,
  };
};

const createImportLine = (name: string) =>
  `import { ${name} } from './${name}.js';`;

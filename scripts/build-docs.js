const childProcess = require('child_process');
const fs = require('fs');
const _ = require('lodash');

const COMPONENTS_DOCS_DIR = './docs/components';

const result = childProcess.execSync('find ./src -name "*api.json"');
const apiFiles = result.toString().trim().split('\n');

const components = apiFiles.map(filePath => {
  const file = fs.readFileSync(filePath);
  const api = JSON.parse(file.toString());
  return api;
});

if (!fs.existsSync(COMPONENTS_DOCS_DIR)) {
  fs.mkdirSync(COMPONENTS_DOCS_DIR);
}

const compoundComponents = components.filter(c => c.name.includes('.'));
const parentComponents = _.chain(compoundComponents)
  .map(c => c.name.split('.')[0])
  .uniq()
  .value();

components.forEach(component => {
  const [componentName, componentParentName] = getComponentNameParts(component.name);
  const isParentComponent = parentComponents.includes(componentName);

  let content = '';
  /* Markdown Front Matter */
  content += `---\n`;
  if (isParentComponent) {
    content += `sidebar_position: 1\n`;
  }
  content += `id: ${component.name}\n`;
  content += `title: ${component.name}\n`;
  content += `sidebar_label: ${componentName}\n`;
  content += `---\n`;

  /* General */
  content += `${component.description}  \n`;
  content += `[(code example)](${component.example})\n`;

  if (component.extends) {
    let extendsText = component.extends?.join(', ');
    if (component.extendsLink) {
      extendsText = `[${extendsText}](${component.extendsLink})`;
    } else {
      const extendedComponentName = _.last(_.split(extendsText, '/')); // Incubator/TextField -> TextField
      extendsText = `[${extendedComponentName}](/docs/components/${extendsText})`;
    }
    content += `:::info\n`;
    content += `This component extends **${extendsText}** props.\n`;
    content += `:::\n`;
  }

  if (component.modifiers) {
    content += `:::tip\n`;
    content += `This component support **${component.modifiers?.join(', ')}** modifiers.\n`;
    content += `:::\n`;
  }

  /* Images */
  content += `<div style={{display: 'flex', flexDirection: 'row', overflowX: 'auto', maxHeight: '500px', alignItems: 'center'}}>`;
  component.images?.forEach(image => {
    content += `<img style={{maxHeight: '420px'}} src={'${image}'}/>`;
    content += '\n\n';
  });
  content += '</div>\n\n';

  /* Props */
  content += `## API\n`;
  _.sortBy(component.props, p => p.name)?.forEach(prop => {
    content += `### ${prop.name}\n`;
    content += `${prop.description}  \n`;
    // content += `<span style={{color: 'grey'}}>${_.escape(prop.type)}</span>\n\n`;
    content += `\`${prop.type} \` \n\n`;
  });

  const componentParentDir = componentParentName || isParentComponent ? `/${componentParentName || componentName}` : '';
  const dirPath = `${COMPONENTS_DOCS_DIR}/${component.category}${componentParentDir}`;

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {recursive: true});
  }

  fs.writeFileSync(`${dirPath}/${component.name}.md`, content, {encoding: 'utf8'});
});

function getComponentNameParts(componentName) {
  const parts = componentName.split('.');
  if (parts.length === 1) {
    return [parts[0], undefined];
  } else {
    return [parts[1], parts[0]];
  }
}

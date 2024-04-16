import * as fs from 'fs';
import * as path from 'path';
// todo
const defaultConfig = {
  files: ['package.json'],
  API_URL: '',
  vector_store_local_path: '.vector_store',
  EMBEDDING_API_URL: '',
  GATEWAY_TOKEN: '',
  EMBEDDING_API_TOKEN: '',
  EMBEDDING_MODEL: '',
};

type Config = typeof defaultConfig;

const getConfig = (): Config => {
  const configFile = path.resolve('.aishellrc'); // Change the path of config file
  if (!fs.existsSync(configFile)) {
    console.error(
      `${configFile} not found. Please place a valid configuration file inside the project root directory.`,
    );
    process.exit(1);
  }

  try {
    const configData = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    if (!configData.GATEWAY_TOKEN) {
      console.error(
        "API key not found!. Please define 'api_key' in configuration file.",
      );
      process.exit(1);
    }
    return { ...defaultConfig, ...configData };
  } catch (err) {
    console.error(`Error parsing ${configFile}:`, err);
    process.exit(1);
  }
};

export default getConfig();

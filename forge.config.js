module.exports = {
  packagerConfig: {
    name: 'Ollama Voice Orchestrator',
    executableName: 'ovo',
    icon: './assets/icons/icon',
    asar: true,
    extraResource: [
      './database',
      './scripts'
    ]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'OVO Team',
          homepage: 'https://github.com/Men6d656e/ibm_hackaton_bob_ide',
          categories: ['Utility', 'Development'],
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          homepage: 'https://github.com/Men6d656e/ibm_hackaton_bob_ide',
          categories: ['Utility', 'Development'],
        }
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};

// Made with Bob

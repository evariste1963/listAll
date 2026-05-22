const { withAppBuildGradle, withGradleProperties } = require('expo/config-plugins');

const PROPERTIES = {
  reactNativeArchitectures: 'arm64-v8a',
  'expo.gif.enabled': 'false',
  'expo.webp.enabled': 'false',
};

module.exports = function withBuildOptimizations(config) {
  config = withGradleProperties(config, (cfg) => {
    const keys = Object.keys(PROPERTIES);
    cfg.modResults = cfg.modResults.filter(
      (item) => item.type !== 'property' || !keys.includes(item.key)
    );
    for (const [key, value] of Object.entries(PROPERTIES)) {
      cfg.modResults.push({ type: 'property', key, value });
    }
    return cfg;
  });

  config = withAppBuildGradle(config, (cfg) => {
    let contents = cfg.modResults.contents;

    contents = contents.replace(
      /(enableBundleCompression = \(findProperty\('android\.enableBundleCompression'\) \?: )\w+(\)\.toBoolean\(\))/,
      '$1true$2'
    );

    contents = contents.replace(
      /(def enableMinifyInReleaseBuilds = \(findProperty\('android\.enableMinifyInReleaseBuilds'\) \?: )\w+(\)\.toBoolean\(\))/,
      '$1true$2'
    );

    contents = contents.replace(
      /(def enableShrinkResources = findProperty\('android\.enableShrinkResourcesInReleaseBuilds'\) \?: )'[^']*'/,
      "$1'true'"
    );

    if (!contents.includes('splits {')) {
      contents = contents.replace(
        /(androidResources \{)/,
        `splits {
        abi {
            reset()
            enable true
            include "arm64-v8a"
            universalApk false
        }
    }
    $1`
      );
    }

    cfg.modResults.contents = contents;
    return cfg;
  });

  return config;
};

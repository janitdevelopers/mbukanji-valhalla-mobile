module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.jansoft.mbukanji.valhalla.ValhallaPackage;',
        packageInstance: 'new ValhallaPackage()',
      },
      ios: {
        podspecPath: './ios/MbukanjiValhallaMobile.podspec',
      },
    },
  },
};

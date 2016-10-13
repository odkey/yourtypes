# YourTypes
## Created by Yota Odaka (id: odkey_)

---

## Setup
### Node.js setup
- This project contains two package.json
- You have to ```$ npm i``` at root and app directory

---

## Developing
### Gulp environment
- To watch Sass files, you have to run ```$ gulp watch``` at root dir.

### Run app
- At app directory, ```$ electron .```

---

## Packaging
- ```$ electron-packager . YourTypes --platform=darwin --arch=x64 --version=1.4.3 --icon=./resources/icon/icon.incs --overwrite``` at app directory

---

## Tips
### Libraries
- YourTypes uses some libraries
  - [html2canvas](https://github.com/niklasvh/html2canvas)
  - [FileSaver.js](https://github.com/eligrey/FileSaver.js)

### if you wanna fix "Module version mismatch. Expected x, got y" error

- ```$ sh electron-abi-fix.sh **Expected Num.** **electron version**```
- Such as: ```$ sh electron-abi-fix.sh 50 1.4.3```
- More info: [https://github.com/TomAshley303/electron-abi-fix](https://github.com/TomAshley303/electron-abi-fix)

### Git branches
- Branches in release/ are archived versions

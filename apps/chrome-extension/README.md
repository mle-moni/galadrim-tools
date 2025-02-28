# extension chrome

## Dev

- go to chrome://extensions
- click on "Load unpacked"
- select the folder "apps/chrome-extension"

## Publish

- make sure to bump the version in the manifest.json file
- go to chrome://extensions
- on the top left, click on "Pack extension"
- select the folder "apps/chrome-extension"
- select the private key
- click on "Pack extension"
- this will create a .crx file
- move the .crx file to the folder "apps/chrome-extension"
- zip the folder "apps/chrome-extension"

```bash
zip -r extension.zip ./chrome-extension
```

- go to https://developer.chrome.com/
- upload the zip file
- click on "Publish"

# Update icons font

1) Import erdapfel_icomoon.json on [icomoon.io](https://icomoon.io/)
2) Select or unselect icons
3) Download the updated .json file
4) Click on "Generate fonts", then "Download". You should obtain a zip file.
5) Uncompress the zip,
6) extract `/fonts` folder into `/public/fonts` and replace existing files.
7) Overwrite `dev/erdapfel_icomoon.json` with `selection.json`
8) Overwrite `src/scss/includes/font.scss` with `style.css`

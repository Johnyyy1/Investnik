# Social-image font

`inter-share.ttf` is a static instance of the existing brand font Inter, weight 400 and optical size 14. The source is the Google Fonts Inter file (`ofl/inter/Inter[opsz,wght].ttf`, retrieved 2026-10-26), https://github.com/google/fonts/tree/main/ofl/inter. License: [SIL OFL 1.1](Inter-OFL.txt).

The image renderer in this bundled Next.js version fails on the variable TTF for Czech glyphs; the static instance retains those glyphs and renders without an external request. It was produced with fontTools 4.60.2 `instantiateVariableFont(font, {"wght": 400, "opsz": 14})`. This does not add another font family or change the app's next/font loading.

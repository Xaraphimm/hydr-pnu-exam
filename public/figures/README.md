Official FAA/ASA figure exhibit images are not included in this repository.

Place supplied Airframe figures at:

- `public/figures/airframe/figure-1.png`
- `public/figures/airframe/figure-2.png`
- etc.

The app detects question text like `(Refer to Figure 12.)` and loads
`/figures/airframe/figure-12.png`. If an image is missing, the UI shows the
expected path so the asset can be added without changing question data.

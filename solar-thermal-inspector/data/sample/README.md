# Bundled demo sample

627 infrared module images (24 x 40 px PNG) used by the demo inspection, the Docker smoke test and the
model-quality test in `tests/test_model.py`.

- **Source:** [InfraredSolarModules](https://github.com/RaptorMaps/InfraredSolarModules) by Raptor Maps, Inc.
  (ICLR 2020 AI for Earth Sciences workshop). Pixels are copied losslessly from the original JPEGs.
- **Selection:** drawn only from this project's **test** split (`data/splits.csv`), so no image here was seen in
  training, model selection or threshold choice. 300 normal modules plus up to 30 of each fault class
  (Diode-Multi has 27 and Soiling 30 in the test split), with seed 42 (`training/prepare_data.py`).
- **`layout.csv`:** `filename, block, row, position, label`. `label` is the dataset's class. **Block, row and
  position are synthetic** (a random placement on a 4 x 8 x 20 grid); the dataset has no location data.

## Licence of the images

The images are redistributed under the dataset's MIT licence:

```
MIT License

Copyright (c) 2020 Raptor Maps, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

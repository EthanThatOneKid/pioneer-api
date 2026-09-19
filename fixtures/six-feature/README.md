# Six-feature upload fixture

Upload these two files to the hosted review service:

- `source.iwp`
- `bubbled.png`

The image is 1200×800. Use the default transform values in the service UI, source units `in`, and a tolerance of `90` pixels.

Expected mapping, where image bubble numbers intentionally differ from IWP names:

| IWP name | Image bubble |
| --- | --- |
| A17 | 705 |
| A18 | 102 |
| A19 | 991 |
| A20 | 314 |
| A21 | 808 |
| A22 | 127 |

`transform.json` contains the known fixture transform for independent verification. The expected result is six observations, six geometric matches, six replacements, and a downloadable UTF-16LE IWP.

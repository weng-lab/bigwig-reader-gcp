# BigWig Reader - GCP Loader

An add-on to the [Bigwig Reader](https://github.com/weng-lab/bigwig-reader) project for loading data from files stored in [Google Cloud Storage](https://cloud.google.com/storage).

## Installation

For npm use: `npm install bigwig-reader-gcp --save`

For yarn use: `yarn add bigwig-reader-gcp`

## Usage
```typescript
import { AxiosDataLoader, BigWigReader } from "bigwig-reader";
import { GoogleBucketDataLoader } from "bigwig-reader-gcp";

const loader = new GoogleBucketDataLoader("my-test-bucket", "my-test-file.txt");
const reader = new BigWigReader(loader);
```


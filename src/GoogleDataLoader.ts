import { Storage, Bucket, File } from '@google-cloud/storage';
import { DataLoader } from 'bigwig-reader';
import { Readable } from 'stream';

/**
 * DataLoader for reading data from a file in a GCP storage bucket.
 */
export class GoogleBucketDataLoader implements DataLoader {

	private storage_: Storage;
	private bucket_: Bucket;
	private file_: File;

	constructor(private bucket: string, private file: string, private billedProject?: string) {
		this.storage_ = new Storage();
		this.bucket_ = this.storage_.bucket(bucket);
		this.file_ = this.bucket_.file(file);
	}

	async load(start: number, size?: number): Promise<ArrayBuffer> {
		const fsize = +(await this.file_.getMetadata({ userProject: this.billedProject }))[0].size;
		const bsize = size === undefined || size + start > fsize ? fsize - start : size;
		const stream = await this.file_.createReadStream({
			userProject: this.billedProject,
			start,
			end: start - 1 + bsize
		});
		if (!stream) throw new Error("could not open gs://" + this.bucket + "/" + this.file);

		const buffer: Uint8Array = new Uint8Array(bsize);
		let ptr: number = 0;
		for await (const chunk of stream) {
			if (chunk !== undefined && chunk !== null && chunk.length) {
				buffer.set(chunk, ptr);
				ptr += chunk.length;
			} else {
				throw new Error(`could not read ${bsize} bytes from gs://${this.bucket}/${this.file}; did read ${ptr}`);
			}
		}
		if (ptr !== buffer.length) {
			throw new Error(`could not read ${bsize} bytes from gs://${this.bucket}/${this.file}; did read ${ptr}`);
		}

		return buffer.buffer as ArrayBuffer;
	}

	async loadStream(start: number, size?: number): Promise<Readable> {
		const fsize = +(await this.file_.getMetadata({ userProject: this.billedProject }))[0].size;
		const bsize = size === undefined || size + start > fsize ? fsize - start : size;
		const stream = await this.file_.createReadStream({
			userProject: this.billedProject,
			start,
			end: start - 1 + bsize
		});
		if (!stream) throw new Error("could not open gs://" + this.bucket + "/" + this.file);
		return stream;
	}

}

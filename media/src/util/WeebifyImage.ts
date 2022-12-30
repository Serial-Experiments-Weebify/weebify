import sharp from 'sharp';

const ALLOW_ANIMATED = true;

function inRange(a: number, v: number, b: number) {
    return a <= v && b >= v;
}

function makeEven(n: number) {
    return Math.round(n) & (~1);
}

export class WeebifyImage {
    protected img: sharp.Sharp;
    protected meta: sharp.Metadata;
    protected valid: boolean;

    constructor(imgData: Buffer) {
        this.img = sharp(imgData, { animated: ALLOW_ANIMATED });
        this.valid = false;
    }

    public async validate(minW: number, maxW: number): Promise<boolean>
    public async validate(minW: number, maxW: number, minH?: number, maxH?: number): Promise<boolean> {
        if (!minH) minH = minW;
        if (!maxH) maxH = maxW;

        this.meta = await this.img.metadata();
        if (!this.meta.width || !this.meta.height) {
            console.warn('Image is missing width/height');
            return false;
        }
        this.valid = inRange(minW, this.meta.width, maxW) && inRange(minH, this.meta.height, maxH);
        return this.valid;
    }

    public async export(): Promise<Buffer> {
        if (!this.valid) throw "Invalid image";
        return await this.img.webp({
            quality: 100,
            effort: 5
        }).toBuffer();
    }

    public toAspectRatio(targetRatio: number) {
        if (!this.valid || !this.meta.width || !this.meta.height) throw "Invalid image";
        const currentRatio = this.meta.width / this.meta.height;
        let dW = 0, dH = 0;

        if (currentRatio == targetRatio) { //ratio is the same
            return;
        } else if (targetRatio > currentRatio) {// target is wider
            dW = this.meta.width;
            dH = Math.round((1 / targetRatio) * dW);
        } else { // target is narrower
            dH = this.meta.height;
            dW = makeEven(targetRatio * dH);
        }

        this.img.resize(dW, dH, { fit: 'cover' });
    }

    public async getImageWithMaxHeight(newHeight: number, quality: number = 80, effort = 4) {
        if (!this.valid || !this.meta.width || !this.meta.height) throw "Invalid image";

        const scalingFactor = newHeight / this.meta.height;

        if (scalingFactor > 1) return this.export();

        const newWidth = makeEven(this.meta.width * scalingFactor);

        const tempImg = this.img.clone();
        const buffer = await tempImg.resize(newWidth, newHeight).webp({ quality, effort }).toBuffer();
        tempImg.destroy();

        return buffer;
    }

    public destroy() {
        this.img.destroy();
    }
}
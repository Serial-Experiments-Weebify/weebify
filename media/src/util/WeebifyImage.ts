import sharp from "sharp";
import getColors from "get-image-colors";

const ALLOW_ANIMATED = true;

function inRange(a: number, v: number, b: number) {
    return a <= v && b >= v;
}

function makeEven(n: number) {
    return Math.round(n) & ~1;
}

export class WeebifyImage {
    protected img: sharp.Sharp;
    protected meta: sharp.Metadata;
    protected valid: boolean;

    constructor(imgData: Buffer) {
        this.img = sharp(imgData, { animated: ALLOW_ANIMATED });
        this.valid = false;
    }

    public async validate(minW: number, maxW: number): Promise<boolean>;
    public async validate(
        minW: number,
        maxW: number,
        minH?: number,
        maxH?: number
    ): Promise<boolean> {
        if (!minH) minH = minW;
        if (!maxH) maxH = maxW;

        this.meta = await this.img.metadata();
        if (!this.meta.width || !this.meta.height) {
            console.warn("Image is missing width/height");
            return false;
        }
        this.valid =
            inRange(minW, this.meta.width, maxW) &&
            inRange(minH, this.meta.pageHeight ?? this.meta.height, maxH);
        return this.valid;
    }

    public async export(): Promise<Buffer> {
        if (!this.valid) throw "Invalid image";
        return await this.img
            .webp({
                quality: 100,
                effort: 5,
            })
            .toBuffer();
    }

    public async getColor(saturationBased?: boolean): Promise<string> {
        //get low effort png buffer
        const b = await this.img.png({ effort: 5 }).toBuffer();
        const colors = await getColors(b, { count: 3, type: "image/png" });

        if (saturationBased) {
            //sort so that the most satureated color is first
            colors.sort((a, b) => b.hsv()[1] - a.hsv()[1]);
        }

        return colors[0].hex();
    }

    public get currentRatio() {
        if (!this.valid || !this.meta.width || !this.meta.height)
            throw "Invalid image";
        return this.meta.width / this.meta.height;
    }

    public toAspectRatio(targetRatio: number) {
        if (!this.valid || !this.meta.width || !this.meta.height)
            throw "Invalid image";
        let dW = 0,
            dH = 0;

        if (this.currentRatio == targetRatio) {
            //ratio is the same
            return;
        } else if (targetRatio > this.currentRatio) {
            // target is wider
            dW = this.meta.width;
            dH = Math.round((1 / targetRatio) * dW);
        } else {
            // target is narrower
            dH = this.meta.height;
            dW = makeEven(targetRatio * dH);
        }

        this.img.resize(dW, dH, { fit: "cover" });
    }

    public async getImageWithMaxHeight(
        newHeight: number,
        quality: number = 80,
        effort = 4
    ) {
        if (!this.valid || !this.meta.width || !this.meta.height)
            throw "Invalid image";

        const scalingFactor = newHeight / this.meta.height;

        if (scalingFactor > 1) return this.export();

        const newWidth = makeEven(this.meta.width * scalingFactor);

        const tempImg = this.img.clone();
        const buffer = await tempImg
            .resize(newWidth, newHeight)
            .webp({ quality, effort })
            .toBuffer();
        tempImg.destroy();

        return buffer;
    }

    public destroy() {
        this.img.destroy();
    }
}

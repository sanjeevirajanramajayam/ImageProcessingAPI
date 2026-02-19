import crypto from 'crypto'
import sharp from 'sharp'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import os from 'os'

const execFileAsync = promisify(execFile)

export const getRandomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

export const applyTransformations = async (imageBuffer: Buffer, transformations: any) => {
    const metadata = await sharp(imageBuffer).metadata()
    const imgWidth = metadata.width ?? 0
    const imgHeight = metadata.height ?? 0

    const {
        resize,
        crop,
        rotate,
        format,
        filters,
        remove_bg
    } = transformations || {}

    if (remove_bg === true) {
        const tmpDir = os.tmpdir()
        const tmpInput = path.join(tmpDir, `rembg_in_${Date.now()}.png`)
        const tmpOutput = path.join(tmpDir, `rembg_out_${Date.now()}.png`)
        try {
            await fs.promises.writeFile(tmpInput, imageBuffer)

            const scriptPath = path.resolve(process.cwd(), 'scripts/remove_bg.py')
            await execFileAsync('python', [scriptPath, tmpInput, tmpOutput], {
                timeout: 120_000
            })

            imageBuffer = await fs.promises.readFile(tmpOutput)
        } catch (err) {
            throw new Error("Background removal failed: " + err);
        } finally {
            fs.promises.unlink(tmpInput).catch(() => {})
            fs.promises.unlink(tmpOutput).catch(() => {})
        }
    }

    if (!imageBuffer || imageBuffer.length === 0) {
        throw new Error("Invalid image buffer")
    }

    let image = sharp(imageBuffer)

    if (crop) {
        const width = Number(crop.width)
        const height = Number(crop.height)
        const x = Number(crop.x)
        const y = Number(crop.y)

        if (
            !isNaN(width) &&
            !isNaN(height) &&
            !isNaN(x) &&
            !isNaN(y) &&
            width > 0 &&
            height > 0 &&
            x >= 0 &&
            y >= 0 &&
            x + width <= imgWidth &&
            y + height <= imgHeight
        ) {
            image = image.extract({
                left: x,
                top: y,
                width,
                height
            })
        } else {
            throw new Error("Invalid crop dimensions")
        }
    }

    if (resize) {
        const width = Number(resize.width)
        const height = Number(resize.height)

        if (!isNaN(width) || !isNaN(height)) {
            image = image.resize(
                !isNaN(width) ? width : undefined,
                !isNaN(height) ? height : undefined
            )
        }
    }

    if (rotate !== undefined) {
        const angle = Number(rotate)
        if (!isNaN(angle)) {
            image = image.rotate(angle)
        }
    }

    if (filters?.grayscale === true) {
        image = image.grayscale()
    }

    if (filters?.sepia === true) {
        image = image
            .modulate({ saturation: 0.5 })
            .tint({ r: 112, g: 66, b: 20 })
    }

    let outputFormat = metadata.format || "jpeg"

    if (remove_bg === true && !format) {
        outputFormat = "png"
    }

    if (format) {
        const f = format.toLowerCase()

        if (["jpeg", "jpg", "png", "webp"].includes(f)) {
            outputFormat = f === "jpg" ? "jpeg" : f
        }
    }

    if (outputFormat === "jpeg") {
        image = image.jpeg({ quality: 80 })
    } else if (outputFormat === "png") {
        image = image.png()
    } else if (outputFormat === "webp") {
        image = image.webp()
    }

    const finalBuffer = await image.toBuffer()

    return finalBuffer
}

export function normalizeTransformations(t: any) {
    return {
        resize: t.resize
            ? { width: t.resize.width ?? null, height: t.resize.height ?? null }
            : null,

        crop: t.crop
            ? {
                width: t.crop.width ?? null,
                height: t.crop.height ?? null,
                x: t.crop.x ?? null,
                y: t.crop.y ?? null
            }
            : null,

        rotate: t.rotate ?? null,
        format: t.format ?? null,

        filters: t.filters
            ? {
                grayscale: !!t.filters.grayscale,
                sepia: !!t.filters.sepia
            }
            : null,

        remove_bg: t.remove_bg
    }
}

export function generateHash(versionId: String, transformations: any) {
    const hash = crypto
        .createHash("sha256")
        .update(JSON.stringify({
            key: versionId,
            transformations: normalizeTransformations(transformations)
        }))
        .digest("hex")
    return `cache/${hash}`
}
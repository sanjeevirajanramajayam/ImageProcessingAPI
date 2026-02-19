import sys
from rembg import remove
from PIL import Image


def remove_background(input_path: str, output_path: str):
    input_image = Image.open(input_path)
    output_image = remove(input_image)
    output_image.save(output_path, format="PNG")
    print(f"Saved to {output_path}", file=sys.stderr)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python remove_bg.py <input_path> <output_path>", file=sys.stderr)
        sys.exit(1)

    remove_background(sys.argv[1], sys.argv[2])

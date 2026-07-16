# Print pipeline

## Version 2 contract

Each saved production design contains:

- A transparent PNG at 2400 × 4800 pixels
- sRGB color-space metadata in the design specification
- Physical case width and height in millimetres from the device catalogue
- Fractional safe-area insets
- Camera-layout identifier
- Every source layer’s position, width, rotation, color, font, and immutable asset key

The PNG is the immediate manufacturing file. The JSON and source assets are the reproducible design package.

## Coordinate system

Layer `x`, `y`, and `width` values are percentages of the printable canvas. Rotation is stored in degrees and applied around the layer centre in both preview and print rendering. This keeps text, stickers, and images freely positionable and rotatable without device-specific pixel coordinates.

## Preparing a printer integration

1. Read the locked design and fetch its `printAssetKey` through a trusted production workflow.
2. Verify the PNG dimensions and decode successfully before accepting the job.
3. Map the stored millimetre dimensions to the selected case blank without stretching.
4. Apply the printer/vendor’s bleed, camera mask, and ICC conversion outside the browser-generated source package.
5. Keep the original sRGB PNG and production reference for traceability.

The current browser exporter does not embed an ICC profile, CMYK conversion, vendor-specific bleed path, or a physical cut contour. Those are printer-specific prepress responsibilities and must be validated with the intended device blank and print vendor before commercial manufacturing.

## Fonts and images

The exporter waits for browser fonts and image decoding before drawing. Display and mono fonts use the same loaded Geist font variables as the UI; serif and impact use explicit platform font stacks. If exact cross-platform typography becomes a manufacturing requirement, bundle and license the required font files rather than relying on platform fallbacks.

Uploads accept PNG, JPEG, and WebP up to 12 MB. The exporter draws decoded source pixels into the print canvas; it never uses the lower-resolution 3D preview as the manufacturing source.

---
name: iwp-bubble-detector
version: 3
description: Drawing-agnostic instructions for detecting numbered bubble annotations in an engineering drawing image.
---

Detect every numbered bubble annotation in this engineering drawing image.
Report the number printed inside each bubble, the normalized bounding box of the bubble, and the normalized point where that bubble's leader line touches the feature it annotates.
Coordinates must be normalized to the full image: x = horizontal fraction, y = vertical fraction, origin at the top-left.
The leader endpoint is not the bubble center: follow the leader line to the feature it points at.
Return the digits of each bubble label only, without any surrounding text.
Report each visible bubble exactly once.
The number of bubbles varies by drawing, so do not assume a fixed count and do not invent a bubble to reach an expected total.
Bubbles are not a fixed colour, size, or shape and may be partially occluded or overlapped by drawing content, so do not rely on any single visual style.
Do not read, infer, or copy labels from any source file; report only text that is visible in the image.
Preserve no ordering assumption, and lower confidence when the label or the leader endpoint is uncertain.

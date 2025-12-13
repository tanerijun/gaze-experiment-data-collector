# 5x5 Calibration Grid System

This document explains the 5x5 calibration grid configuration and how to filter for different grid patterns in the experiment analysis.

## Grid Layout

The calibration system uses a 5x5 grid with 25 points total. Points are positioned at:

- **X-axis**: 5%, 27.5%, 50%, 72.5%, 95%
- **Y-axis**: 5%, 27.5%, 50%, 72.5%, 95%

### Visual Grid Reference

```
     Col 0    Col 1    Col 2    Col 3    Col 4
      (5%)   (27.5%)   (50%)   (72.5%)   (95%)

Row 0  r0c0    r0c1    r0c2    r0c3    r0c4    (5%)
Row 1  r1c0    r1c1    r1c2    r1c3    r1c4    (27.5%)
Row 2  r2c0    r2c1    r2c2    r2c3    r2c4    (50%)
Row 3  r3c0    r3c1    r3c2    r3c3    r3c4    (72.5%)
Row 4  r4c0    r4c1    r4c2    r4c3    r4c4    (95%)
```

## Point ID Format

Each calibration point has an ID in the format: `r{row}c{col}`

- Row and column indices are 0-based (0-4)
- Example: `r0c0` = top-left, `r2c2` = center, `r4c4` = bottom-right

## Data Structure

Each `CalibrationResult` object contains:

```json
{
  "pointId": "r2c3",
  "x": 72.5,
  "y": 50,
  "row": 2,
  "col": 3,
  "timestamp": 1234567890,
  "screenX": 1152,
  "screenY": 540
}
```

## Filtering for Different Grid Configurations

### 4-Point (Corners Only)

```javascript
const fourPointConfig = calibrationData.filter(
  (point) => (point.row === 0 || point.row === 4) && (point.col === 0 || point.col === 4),
);
// Points: r0c0, r0c4, r4c0, r4c4
```

**Visual:**

```
●  ·  ·  ·  ●
·  ·  ·  ·  ·
·  ·  ·  ·  ·
·  ·  ·  ·  ·
●  ·  ·  ·  ●
```

### 5-Point (Corners + Center)

```javascript
const fivePointConfig = calibrationData.filter(
  (point) =>
    (point.row === 0 && point.col === 0) || // top-left
    (point.row === 0 && point.col === 4) || // top-right
    (point.row === 4 && point.col === 0) || // bottom-left
    (point.row === 4 && point.col === 4) || // bottom-right
    (point.row === 2 && point.col === 2), // center
);
// Points: r0c0, r0c4, r2c2, r4c0, r4c4
```

**Visual:**

```
●  ·  ·  ·  ●
·  ·  ·  ·  ·
·  ·  ●  ·  ·
·  ·  ·  ·  ·
●  ·  ·  ·  ●
```

### 9-Point (3x3 Grid - Industry Standard)

```javascript
const ninePointConfig = calibrationData.filter(
  (point) => point.row % 2 === 0 && point.col % 2 === 0,
);
// Points: r0c0, r0c2, r0c4, r2c0, r2c2, r2c4, r4c0, r4c2, r4c4
```

**Visual:**

```
●  ·  ●  ·  ●
·  ·  ·  ·  ·
●  ·  ●  ·  ●
·  ·  ·  ·  ·
●  ·  ●  ·  ●
```

### 13-Point (Perimeter + Center)

```javascript
const thirteenPointConfig = calibrationData.filter(
  (point) =>
    point.row === 0 || // Top row
    point.row === 4 || // Bottom row
    point.col === 0 || // Left column
    point.col === 4 || // Right column
    (point.row === 2 && point.col === 2), // Center
);
// Points: All perimeter points plus center
```

**Visual:**

```
●  ●  ●  ●  ●
●  ·  ·  ·  ●
●  ·  ●  ·  ●
●  ·  ·  ·  ●
●  ●  ●  ●  ●
```

### 17-Point (Perimeter + Cross)

```javascript
const seventeenPointConfig = calibrationData.filter(
  (point) =>
    point.row === 0 || // Top row
    point.row === 4 || // Bottom row
    point.col === 0 || // Left column
    point.col === 4 || // Right column
    point.row === 2 || // Middle horizontal line
    point.col === 2, // Middle vertical line
);
// Points: Perimeter + middle cross
```

**Visual:**

```
●  ●  ●  ●  ●
●  ·  ·  ·  ●
●  ●  ●  ●  ●
●  ·  ·  ·  ●
●  ●  ●  ●  ●
```

### 21-Point (Exclude Inner 2x2)

```javascript
const twentyOnePointConfig = calibrationData.filter(
  (point) =>
    !(
      point.row >= 1 &&
      point.row <= 3 &&
      point.col >= 1 &&
      point.col <= 3 &&
      !(point.row === 2 && point.col === 2)
    ),
);
// Points: All except r1c1, r1c3, r3c1, r3c3
```

**Visual:**

```
●  ●  ●  ●  ●
●  ·  ·  ·  ●
●  ·  ●  ·  ●
●  ·  ·  ·  ●
●  ●  ●  ●  ●
```

### 25-Point (Full Dense Grid)

```javascript
const fullGrid = calibrationData;
// All 25 points
```

**Visual:**

```
●  ●  ●  ●  ●
●  ●  ●  ●  ●
●  ●  ●  ●  ●
●  ●  ●  ●  ●
●  ●  ●  ●  ●
```

## Custom Filtering Examples

### Horizontal Strip (Middle 3 Rows)

```javascript
const horizontalStrip = calibrationData.filter((point) => point.row >= 1 && point.row <= 3);
```

### Vertical Strip (Middle 3 Columns)

```javascript
const verticalStrip = calibrationData.filter((point) => point.col >= 1 && point.col <= 3);
```

### Center 3x3 Square

```javascript
const centerSquare = calibrationData.filter(
  (point) => point.row >= 1 && point.row <= 3 && point.col >= 1 && point.col <= 3,
);
```

### Left Half

```javascript
const leftHalf = calibrationData.filter((point) => point.col <= 2);
```

### Top Half

```javascript
const topHalf = calibrationData.filter((point) => point.row <= 2);
```

### Diagonal Points

```javascript
const diagonal = calibrationData.filter(
  (point) => point.row === point.col, // Main diagonal
);
// Points: r0c0, r1c1, r2c2, r3c3, r4c4
```

### Checkerboard Pattern

```javascript
const checkerboard = calibrationData.filter((point) => (point.row + point.col) % 2 === 0);
```

## Python Example

```python
import json

# Load calibration data
with open('session_data.json', 'r') as f:
    data = json.load(f)

calibration_data = data['initialCalibration']

# Filter for 9-point configuration
nine_point = [
    point for point in calibration_data
    if point['row'] % 2 == 0 and point['col'] % 2 == 0
]

# Filter for corners only
corners = [
    point for point in calibration_data
    if (point['row'] in [0, 4]) and (point['col'] in [0, 4])
]

# Filter by point IDs directly
target_ids = ['r0c0', 'r0c4', 'r2c2', 'r4c0', 'r4c4']
five_point = [
    point for point in calibration_data
    if point['pointId'] in target_ids
]
```

## Experimental Design Recommendations

1. **Baseline Comparison**: Compare 4-point vs 5-point vs 9-point to establish minimum viable calibration
2. **Edge Effects**: Use 13-point to test if edge calibration improves peripheral gaze accuracy
3. **Density Analysis**: Compare 9-point vs 17-point vs 25-point to find diminishing returns
4. **Asymmetric Tests**: Test horizontal vs vertical strips to check for axis-specific issues
5. **Region-of-Interest**: Filter to specific screen regions based on your application needs

## Notes

- All 25 points are collected regardless of which subset we analyze
- We can test multiple configurations from a single data collection session
- Row/column indices make it easy to create programmatic filters
- Point IDs (`r{row}c{col}`) are unique and persistent across sessions

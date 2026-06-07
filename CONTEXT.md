# PassDrop

A mobile app for storing and displaying barcodes and QR codes at point-of-sale. All data stays on the device.

## Language

**Pass**:
A saved barcode or QR code — the core entity of the app. Has a label, color, format, raw data value, optional expiry date, optional notes, and an optional category.
_Avoid_: Card, ticket, item, entry

**Category**:
A user-defined group that passes can be assigned to, used to filter the pass list.
_Avoid_: Tag, folder, group, label

**Scan**:
The act of capturing a barcode or QR code using the device camera to extract its raw data value.
_Avoid_: Read, capture, import

**Detail Page**:
The full-screen page showing a single pass — its barcode, metadata, and actions. Reached by tapping a pass in the list.
_Avoid_: Sheet, modal, detail view

**Fullscreen Viewer**:
An overlay that fills the entire screen to display a pass's barcode or QR code at maximum size for scanning at checkout. Reached by tapping the barcode area in the Detail Page.
_Avoid_: Expanded view, zoom, lightbox

**Add Flow**:
The two-step sequence for creating a new pass: scan a barcode first, then fill in the form. Triggered from the FAB on the pass list.
_Avoid_: Create, import, onboarding

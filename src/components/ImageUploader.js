import React, { useState } from "react";
import "./ImageUploader.css";

function ImageUploader({
                           previewUrl,
                           onImageSelected,
                           imageUrl,
                           onImageUrlChange,
                           urlIsValid,
                       }) {
    const [isHovering, setIsHovering] = useState(false);

    const handleFileChange = (event) => {
        const selected = event.target.files[0];
        if (!selected) {
            onImageSelected(null);
            return;
        }

        if (!selected.type.startsWith("image/")) {
            alert("Please select an image file (JPEG, PNG...).");
            onImageSelected(null);
            return;
        }

        onImageSelected(selected);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsHovering(false);

        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const selected = event.dataTransfer.files[0];
            if (!selected.type.startsWith("image/")) {
                alert("Please drop an image file (JPEG, PNG...).");
                return;
            }
            onImageSelected(selected);
        }
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        setIsHovering(true);
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        setIsHovering(false);
    };

    const onUrlInputChange = (e) => {
        onImageUrlChange(e.target.value);
    };

    const showInvalidUrl =
        imageUrl && imageUrl.trim().length > 0 && !urlIsValid;

    return (
        <div className="uploader-wrapper">
            {/* Clean URL Bar */}
            <div className="uploader-url-bar">
                <div className="uploader-url-label">Image URL</div>
                <div className="uploader-url-input-row">
                    <input
                        type="text"
                        className={
                            showInvalidUrl
                                ? "uploader-url-input uploader-url-input--invalid"
                                : "uploader-url-input"
                        }
                        placeholder="https://example.com/fresh-fruit.jpg"
                        value={imageUrl}
                        onChange={onUrlInputChange}
                    />
                </div>
                <div className="uploader-url-hint">
                    {showInvalidUrl ? (
                        <span className="uploader-url-hint--error">
              Invalid URL. Ensure it starts with <code>http://</code> or <code>https://</code>.
            </span>
                    ) : (
                        <span>
              Paste a public image URL or use the drag & drop zone below.
            </span>
                    )}
                </div>
            </div>

            {/* Dropzone */}
            <label
                className={
                    isHovering
                        ? "uploader-dropzone uploader-dropzone--hover"
                        : "uploader-dropzone"
                }
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept="image/*"
                    className="uploader-input"
                    onChange={handleFileChange}
                />

                {previewUrl ? (
                    <>
                        <div className="uploader-title">Image Preview</div>
                        <img src={previewUrl} alt="preview" className="uploader-preview" />
                        <div className="uploader-hint">
                            Click or drop another image to change.
                        </div>
                    </>
                ) : (
                    <>
                        <div className="uploader-title">Drag & Drop an image</div>
                        <div className="uploader-subtitle">
                            or click here to select a file (JPEG, PNG...)
                        </div>
                    </>
                )}
            </label>
        </div>
    );
}

export default ImageUploader;
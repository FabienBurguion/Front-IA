import React, { useState } from "react";
import "./ImageUploader.css";

function ImageUploader({
                           previewUrl,
                           onImageSelected,
                           imageUrl,
                           onImageUrlChange,
                           onLoadPreviewFromUrl,
                       }) {
    const [isHovering, setIsHovering] = useState(false);

    const handleFileChange = (event) => {
        const selected = event.target.files[0];
        if (!selected) {
            onImageSelected(null);
            return;
        }

        if (!selected.type.startsWith("image/")) {
            alert("Veuillez sélectionner un fichier image (JPEG, PNG…).");
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
                alert("Veuillez déposer un fichier image (JPEG, PNG…).");
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

    return (
        <div className="uploader-wrapper">
            {/* Barre URL */}
            <div className="uploader-url-bar">
                <div className="uploader-url-label">URL de l’image</div>
                <div className="uploader-url-input-row">
                    <input
                        type="text"
                        className="uploader-url-input"
                        placeholder="https://exemple.com/mon-image.jpg"
                        value={imageUrl}
                        onChange={onUrlInputChange}
                    />
                    <button
                        type="button"
                        className="uploader-url-button"
                        onClick={onLoadPreviewFromUrl}
                    >
                        Charger
                    </button>
                </div>
                <div className="uploader-url-hint">
                    Vous pouvez soit fournir une URL, soit utiliser le drag & drop ci-dessous.
                </div>
            </div>

            {/* Zone drag & drop / fichier local */}
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
                        <div className="uploader-title">Aperçu de l’image</div>
                        <img src={previewUrl} alt="preview" className="uploader-preview" />
                        <div className="uploader-hint">
                            Cliquez ou déposez une autre image pour changer.
                        </div>
                    </>
                ) : (
                    <>
                        <div className="uploader-title">Glissez-déposez une image</div>
                        <div className="uploader-subtitle">
                            ou cliquez ici pour choisir un fichier (JPEG, PNG…)
                        </div>
                    </>
                )}
            </label>
        </div>
    );
}

export default ImageUploader;

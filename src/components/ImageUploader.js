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

    const showInvalidUrl =
        imageUrl && imageUrl.trim().length > 0 && !urlIsValid;

    return (
        <div className="uploader-wrapper">
            {/* Barre URL futuriste */}
            <div className="uploader-url-bar">
                <div className="uploader-url-label">URL de l’image</div>
                <div className="uploader-url-input-row">
                    <input
                        type="text"
                        className={
                            showInvalidUrl
                                ? "uploader-url-input uploader-url-input--invalid"
                                : "uploader-url-input"
                        }
                        placeholder="https://exemple.com/mon-image.jpg"
                        value={imageUrl}
                        onChange={onUrlInputChange}
                    />
                </div>
                <div className="uploader-url-hint">
                    {showInvalidUrl ? (
                        <span className="uploader-url-hint--error">
              URL invalide ou incomplète. Assurez-vous qu’elle commence par{" "}
                            <code>http://</code> ou <code>https://</code>.
            </span>
                    ) : (
                        <span>
              Collez une URL d’image accessible publiquement ou utilisez le drag & drop ci-dessous.
            </span>
                    )}
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

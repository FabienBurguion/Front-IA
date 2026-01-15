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
    const [imageLoadError, setImageLoadError] = useState(false); // NOUVEAU : État pour l'erreur d'image

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
        setImageLoadError(false); // Reset erreur
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
            setImageLoadError(false); // Reset erreur
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
        setImageLoadError(false); // Reset erreur quand l'user tape
        onImageUrlChange(e.target.value);
    };

    // Gestion de l'erreur d'affichage (Protection Hotlink / 403 Forbidden)
    const handleImageError = () => {
        setImageLoadError(true);
    };

    const showInvalidUrl = imageUrl && imageUrl.trim().length > 0 && !urlIsValid;

    return (
        <div className="uploader-wrapper">
            {/* Barre URL */}
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
                        placeholder="https://example.com/fruit.jpg"
                        value={imageUrl}
                        onChange={onUrlInputChange}
                    />
                </div>
                <div className="uploader-url-hint">
                    {showInvalidUrl ? (
                        <span className="uploader-url-hint--error">
                            URL invalide. Doit commencer par http:// ou https://
                        </span>
                    ) : (
                        <span>Collez une URL publique ou déposez une image ci-dessous.</span>
                    )}
                </div>
            </div>

            {/* Zone de Drop / Preview */}
            <label
                className={isHovering ? "uploader-dropzone uploader-dropzone--hover" : "uploader-dropzone"}
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
                        <div className="uploader-title">Aperçu</div>

                        {/* AFFICHE L'IMAGE OU UN MESSAGE D'ERREUR SI PROTÉGÉE */}
                        {!imageLoadError ? (
                            <img
                                src={previewUrl}
                                alt="preview"
                                className="uploader-preview"
                                onError={handleImageError} // Détecte si l'image casse
                            />
                        ) : (
                            <div className="uploader-preview-error">
                                <p>⚠️ <strong>Image protégée</strong></p>
                                <p>Le site source empêche l'affichage, mais l'URL est valide.</p>
                                <p>Vous pouvez quand même lancer l'analyse !</p>
                            </div>
                        )}

                        <div className="uploader-hint">
                            Cliquez ou déposez une autre image pour changer.
                        </div>
                    </>
                ) : (
                    <>
                        <div className="uploader-title">Glisser & Déposer une image</div>
                        <div className="uploader-subtitle">
                            ou cliquez ici pour sélectionner un fichier
                        </div>
                    </>
                )}
            </label>
        </div>
    );
}

export default ImageUploader;
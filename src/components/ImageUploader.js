import React, { useState } from "react";
import "./ImageUploader.css";

function ImageUploader({ previewUrl, onImageSelected }) {
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

    return (
        <div className="uploader-wrapper">
            <label
                className={
                    isHovering ? "uploader-dropzone uploader-dropzone--hover" : "uploader-dropzone"
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
                        <div className="uploader-title">Image sélectionnée</div>
                        <img
                            src={previewUrl}
                            alt="preview"
                            className="uploader-preview"
                        />
                        <div className="uploader-hint">
                            Cliquez ou déposez une autre image pour changer.
                        </div>
                    </>
                ) : (
                    <>
                        <div className="uploader-title">Cliquez pour choisir une image</div>
                        <div className="uploader-subtitle">
                            ou déposez un fichier ici (JPEG, PNG…)
                        </div>
                    </>
                )}
            </label>
        </div>
    );
}

export default ImageUploader;

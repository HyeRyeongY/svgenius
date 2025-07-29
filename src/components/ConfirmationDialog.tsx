
import React from "react";
import RippleButton from "./RippleButton";

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="confirmation-overlay">
            <div className="confirmation-dialog">
                <h2 className="confirmation-title">{title}</h2>
                <p className="confirmation-message">{message}</p>
                <div className="confirmation-actions">
                    <RippleButton onClick={onClose} className="btn text">
                        Cancel
                    </RippleButton>
                    <RippleButton
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="btn primary"
                    >
                        Confirm
                    </RippleButton>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;

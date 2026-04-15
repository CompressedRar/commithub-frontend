import { useState } from "react";

export default function useFieldHandlers(formBuilderHook) {
    const {
        selectedField,
        setSelectedField,
        addField,
        updateField,
        deleteField,
    } = formBuilderHook;

    const [editorOpen, setEditorOpen] = useState(false);

    const handleAddAdminField = () => {
        const field = addField("Admin");
        setSelectedField(field);
        setEditorOpen(true);
    };

    const handleAddUserField = () => {
        const field = addField("User");
        setSelectedField(field);
        setEditorOpen(true);
    };

    const handleEditField = (field) => {
        setSelectedField(field);
        setEditorOpen(true);
    };

    const handleSaveField = (updatedData) => {
        if (updatedData === null) {
            setEditorOpen(false);
            return;
        }
        if (selectedField) {
            updateField(selectedField.id, updatedData);
        }
        setEditorOpen(false);
    };

    const handleDeleteField = (fieldId) => {
        deleteField(fieldId);
    };

    return {
        editorOpen,
        setEditorOpen,
        selectedField,
        handleAddAdminField,
        handleAddUserField,
        handleEditField,
        handleSaveField,
        handleDeleteField,
    };
}

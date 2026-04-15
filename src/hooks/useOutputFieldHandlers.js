import { useState } from "react";

export default function useOutputFieldHandlers(formBuilderHook) {
    const {
        selectedOutputField,
        setSelectedOutputField,
        addOutputField,
        updateOutputField,
        deleteOutputField,
    } = formBuilderHook;

    const [editorOpen, setEditorOpen] = useState(false);

    const handleAddIntegerModifier = () => {
        const field = addOutputField("IntegerModifier");
        setSelectedOutputField(field);
        setEditorOpen(true);
    };

    const handleAddCaseOutput = () => {
        const field = addOutputField("CaseOutput");
        setSelectedOutputField(field);
        setEditorOpen(true);
    };

    const handleEditField = (field) => {
        setSelectedOutputField(field);
        setEditorOpen(true);
    };

    const handleSaveField = (updatedData) => {
        if (updatedData === null) {
            setEditorOpen(false);
            return;
        }
        if (selectedOutputField) {
            updateOutputField(selectedOutputField.id, updatedData);
        }
        setEditorOpen(false);
    };

    const handleDeleteField = (fieldId) => {
        deleteOutputField(fieldId);
    };

    return {
        editorOpen,
        setEditorOpen,
        selectedOutputField,
        handleAddIntegerModifier,
        handleAddCaseOutput,
        handleEditField,
        handleSaveField,
        handleDeleteField,
    };
}

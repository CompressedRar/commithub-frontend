import { useState } from 'react';

export default function useFormBuilder() {
  const [fields, setFields] = useState([]);
  const [outputFields, setOutputFields] = useState([]);
  const [selectedField, setSelectedField] = useState(null);
  const [selectedOutputField, setSelectedOutputField] = useState(null);

  const addField = (user = 'Admin') => {
    const newField = {
      id: Date.now(),
      title: `Field ${fields.length + 1}`,
      placeholder: '',
      description: '',
      name: user === 'User' ? `field_${Date.now()}` : '',
      type: user === 'Admin' ? 'String' : 'Integer',
      user: user,
      required: false,
    };
    setFields([...fields, newField]);
    setSelectedField(newField);
    return newField;
  };

  const updateField = (fieldId, updates) => {
    setFields(
      fields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
    setSelectedField((prev) =>
      prev && prev.id === fieldId ? { ...prev, ...updates } : prev
    );
  };

  const deleteField = (fieldId) => {
    setFields(fields.filter((field) => field.id !== fieldId));
    if (selectedField?.id === fieldId) {
      setSelectedField(null);
    }
  };

  const addOutputField = (type = 'IntegerModifier') => {
    const newOutputField = {
      id: Date.now(),
      title: `Output ${outputFields.length + 1}`,
      type: type,
      inputFieldName: '',
      formula: type === 'IntegerModifier' ? '0' : '',
      cases: type === 'CaseOutput' ? [] : undefined,
    };
    setOutputFields([...outputFields, newOutputField]);
    setSelectedOutputField(newOutputField);
    return newOutputField;
  };

  const updateOutputField = (fieldId, updates) => {
    setOutputFields(
      outputFields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      )
    );
    setSelectedOutputField((prev) =>
      prev && prev.id === fieldId ? { ...prev, ...updates } : prev
    );
  };

  const deleteOutputField = (fieldId) => {
    setOutputFields(outputFields.filter((field) => field.id !== fieldId));
    if (selectedOutputField?.id === fieldId) {
      setSelectedOutputField(null);
    }
  };

  const clearFields = () => {
    setFields([]);
    setOutputFields([]);
    setSelectedField(null);
    setSelectedOutputField(null);
  };

  const loadFields = (fieldsArray) => {
    setFields(fieldsArray);
    setSelectedField(null);
  };

  const loadOutputFields = (outputFieldsArray) => {
    setOutputFields(outputFieldsArray);
    setSelectedOutputField(null);
  };

  const getFieldsByUser = (user) => {
    return fields.filter((field) => field.user === user);
  };

  const getUserInputFields = () => {
    return fields.filter((field) => field.user === 'User');
  };

  return {
    fields,
    outputFields,
    selectedField,
    selectedOutputField,
    setSelectedField,
    setSelectedOutputField,
    addField,
    updateField,
    deleteField,
    addOutputField,
    updateOutputField,
    deleteOutputField,
    clearFields,
    loadFields,
    loadOutputFields,
    getFieldsByUser,
    getUserInputFields,
  };
}

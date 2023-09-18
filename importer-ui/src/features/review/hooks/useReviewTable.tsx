import { useEffect, useMemo, useState } from "react";
import { Checkbox, Input } from "@tableflow/ui-library";
import { InputOption } from "@tableflow/ui-library/build/Input/types";
import { CsvTemplateMapping, TemplateColumn, UploadColumn } from "../../../api/types";
import useAiColumnMapping from "../../../api/useAiColumnMapping";
import stringsSimilarity from "../../../utils/stringSimilarity";
import useMutableLocalStorage from "../../main/hooks/useMutableLocalStorage";
import style from "../style/Review.module.scss";
import useTransformValue from "./useNameChange";

type Include = {
  template: string;
  use: boolean;
};

export default function useReviewTable(
  items: UploadColumn[] = [],
  templateColumns: TemplateColumn[] = [],
  importerId: string,
  schemaless?: boolean,
  isAiColumnMappingEnabled?: boolean
) {
  const [tusId, setTusId] = useMutableLocalStorage(importerId + "-tusId", "");
  const { data: aiMappedColumns = {} as CsvTemplateMapping, isLoading, isError } = useAiColumnMapping(tusId, isAiColumnMappingEnabled);

  const getFormValues = () => {
    return items.reduce((acc, uc) => {
      const matchedSuggestedTemplateColumn = templateColumns?.find((tc) => {
        if (!tc?.suggested_mappings) {
          return false;
        }
        for (const suggestion of tc.suggested_mappings) {
          if (suggestion.toLowerCase() === uc?.name?.toLowerCase()) {
            return true;
          }
        }
        return false;
      });
      if (matchedSuggestedTemplateColumn) {
        return { ...acc, [uc.id]: { template: matchedSuggestedTemplateColumn.id || "", use: !!matchedSuggestedTemplateColumn.id } };
      }
      if (aiMappedColumns) {
        // match columns from mappedColumnsResult
        const similarTemplateColumn = templateColumns?.find((tc) => tc.name == aiMappedColumns[uc.name]);
        return { ...acc, [uc.id]: { template: similarTemplateColumn?.id || "", use: !!similarTemplateColumn?.id } };
      } else {
        // use string similarity
        const similarTemplateColumn = templateColumns?.find((tc) => stringsSimilarity(tc.name, uc.name) > 0.9);
        return { ...acc, [uc.id]: { template: similarTemplateColumn?.id || "", use: !!similarTemplateColumn?.id } };
      }
    }, {});
  };

  const [values, setValues] = useState<{ [key: string]: Include }>(getFormValues());
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  useEffect(() => {
    setValues(getFormValues());
  }, [isLoading]);

  const templateFields: { [key: string]: InputOption } = useMemo(
    () => templateColumns.reduce((acc, field) => ({ ...acc, [field.name]: { value: field.id, required: field.required } }), {}),
    [JSON.stringify(templateColumns)]
  );

  const handleTemplateChange = (id: string, template: string) => {
    setValues((prev) => {
      const oldTemplate = prev[id].template;
      setSelectedTemplates((currentSelected) => {
        if (currentSelected.includes(oldTemplate)) {
          return currentSelected.filter((t) => t !== oldTemplate);
        }
        if (template && !currentSelected.includes(template)) {
          return [...currentSelected, template];
        }
        return currentSelected;
      });
      return { ...prev, [id]: { ...prev[id], template, use: !!template } };
    });
  };

  const handleUseChange = (id: string, value: boolean) => {
    setValues((prev) => ({ ...prev, [id]: { ...prev[id], use: !!prev[id].template && value } }));
  };

  const handleValueChange = (id: string, value: string) => {
    setValues((prev) => ({ ...prev, [id]: { ...prev[id], template: value, use: !!value } }));
  };

  const heading = {
    "File Column": {
      raw: "",
      content: "File Column",
    },
    "Sample Data": {
      raw: "",
      content: "Sample Data",
    },
    "Destination Column": {
      raw: "",
      content: "Destination Column 1",
    },
    Include: {
      raw: "",
      content: "Include",
    },
  };
  const rows = useMemo(() => {
    return items.map((item) => {
      const { id, name, sample_data } = item;
      const suggestion = values?.[id] || {};
      const samples = sample_data.filter((d) => d);
      const transformedName = name
        .replace(/\s/g, "_")
        .replace(/[^a-zA-Z0-9_]/g, "")
        .toLowerCase();

      const filteredUsedValues = Object.entries(values).reduce((acc, [key, value]) => {
        if (value.use && key !== id) {
          acc[key] = value;
        }
        return acc;
      }, {} as { [key: string]: Include });

      let currentOptions;

      if (selectedTemplates && selectedTemplates.length > 0) {
        currentOptions = Object.keys(templateFields).filter((key) => {
          const isTemplateSelected = selectedTemplates.includes(templateFields[key].value as string);
          const isSuggestionTemplate = templateFields[key].value === suggestion.template;
          return !isTemplateSelected || isSuggestionTemplate;
        });
      } else {
        if (suggestion.use) {
          setSelectedTemplates((prevTemplates) => [...prevTemplates, suggestion.template]);
        }
        currentOptions = Object.keys(templateFields).filter((key) => {
          const isSuggestionTemplate = templateFields[key].value === suggestion.template;
          const isTemplateUsed = Object.values(filteredUsedValues).some((val) => val.template === templateFields[key].value);
          return !isTemplateUsed || isSuggestionTemplate;
        });
      }
      currentOptions = currentOptions?.reduce((acc, key) => {
        acc[key] = templateFields[key];
        return acc;
      }, {} as { [key: string]: InputOption });

      const isCurrentOptions = currentOptions && Object.keys(currentOptions).length > 0;

      return {
        "File Column": {
          raw: name || false,
          content: name || <em>- empty -</em>,
        },
        "Sample Data": {
          raw: "",
          content: (
            <div title={samples.join(", ")} className={style.samples}>
              {samples.map((d, i) => (
                <small key={i}>{d}</small>
              ))}
            </div>
          ),
        },
        "Destination Column": {
          raw: "",
          content: schemaless ? (
            <SchemaLessInput
              value={transformedName}
              setValues={(value) => {
                handleValueChange(id, value);
              }}
            />
          ) : (
            <Input
              options={currentOptions}
              value={suggestion.template}
              placeholder="- Select one -"
              variants={["small"]}
              onChange={(template: any) => handleTemplateChange(id, template)}
              disabled={!isCurrentOptions}
            />
          ),
        },
        Include: {
          raw: false,
          content: <Checkbox checked={suggestion.use} disabled={!suggestion.template} onChange={(e) => handleUseChange(id, e.target.checked)} />,
        },
      };
    });
  }, [values]);
  return { rows, formValues: values, isLoading };
}

const SchemaLessInput = ({ value, setValues }: { value: string; setValues: (value: string) => void }) => {
  const { transformedValue, transformValue } = useTransformValue(value);
  const [inputValue, setInputValue] = useState(transformedValue);

  useEffect(() => {
    setInputValue(transformedValue);
    setValues(transformedValue);
  }, [transformedValue]);

  const handleOnChange = (e: any) => {
    transformValue(e.target.value);
    setInputValue(e.target.value);
    setValues(transformedValue);
  };

  return <Input value={inputValue} variants={["small"]} onChange={handleOnChange} />;
};

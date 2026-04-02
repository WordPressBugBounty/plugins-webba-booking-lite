import { dispatch, useDispatch, useSelect } from "@wordpress/data";
import { FormFieldMisc, IOption } from "../../types";
import { store_name } from "../../../../../store/backend";
import apiFetch from "@wordpress/api-fetch";

export const getSelectFieldOptions = (fieldName: string): IOption[] => {
  if (fieldName === "payment_method") {
    return [
      {
        label: "Woocommerce",
        value: "woocommerce",
      },
      {
        label: "Credit card",
        value: "credit_card",
      },
    ];
  }

  return [];
};

interface IOptionRequest {
  options: Record<string, string> | string;
  model: string;
  field: string;
  formData: Record<string, unknown>;
  nullValue?: string[];
  misc?: FormFieldMisc;
}

export const useOptions = ({
  options,
  field,
  model,
  formData,
  nullValue = [],
  misc,
}: IOptionRequest) => {
  const nullValues = createNullValues(nullValue);

  if (options && typeof options === "object") {
    return [...nullValues, ...formatOptions(options)];
  } else if (
    options &&
    typeof options === "string" &&
    options !== "backend" &&
    !options.startsWith("source:")
  ) {
    const modelObject = useSelect(
      // @ts-ignore
      (select) => select(store_name).getItems(options),
      []
    );

    const stateOptions = processModelOptions(model, modelObject);

    return [...nullValues, ...formatOptions(stateOptions)];
  } else if (options && typeof options === "string" && options.startsWith("source:")) {
    const source = options.split(":")[1];
    const sourceModel = options.split(":")[2];

    const modelObject = useSelect(
      // @ts-ignore
      (select) => select(store_name).getItems(sourceModel),
      [formData[source]]
    );

    const sourcedOptions = useSelect(
      (select) =>
        // @ts-ignore
        select(store_name).getSourcedOptions(model, field),
      [model, field]
    );

    let formattedSourcedOptions: string[] = [];

    try {
      formattedSourcedOptions = JSON.parse(sourcedOptions);
    } catch (e) {
      formattedSourcedOptions = sourcedOptions;
    }

    if (!Array.isArray(formattedSourcedOptions) && !isNaN(formattedSourcedOptions)) {
      formattedSourcedOptions = [formattedSourcedOptions];
    }

    formattedSourcedOptions = formattedSourcedOptions.map((item) => String(item));

    let selectedSourceEntities = modelObject.filter((item: any) =>
      Object.values(formattedSourcedOptions as any).includes(String(item.id))
    );

    if (misc?.source_filter) {
      selectedSourceEntities = selectedSourceEntities.filter((item: any) => {
        return misc?.source_filter?.every((filter: [string, string, string]) => {
          const [fieldName, operator, value] = filter;
          const itemValue = item[fieldName];

          switch (operator) {
            case "=":
              return String(itemValue) === String(value);
            case "!=":
              return String(itemValue) !== String(value);
          }
        });
      });
    }

    const selectedSourceOptions = selectedSourceEntities.map((item: any) => ({
      value: item.id,
      label: item.name,
    }));

    return [...nullValues, ...selectedSourceOptions];
  } else if (options && typeof options === "string" && options === "backend") {
    const isDependent = isDependentField(model, field);
    const stateOptions = useSelect(
      (select) =>
        // @ts-ignore
        select(store_name).getFieldOptions(model, field, formData, isDependent),
      [isDependent ? formData : null]
    );

    if (Array.isArray(stateOptions)) {
      const normalized = stateOptions.map(
        (o: { value?: string; label?: string; title?: string; is_disabled?: boolean }) => ({
          value: String(o.value ?? ""),
          label: o.label ?? o.title ?? "",
          ...(o.is_disabled !== undefined && { isDisabled: !!o.is_disabled }),
        })
      );
      return [...nullValues, ...normalized];
    }
    return [...nullValues, ...formatOptions(stateOptions || {})];
  }

  return [];
};

type OptionInput = string | { label: string; is_disabled?: boolean };

export const formatOptions = (
  options: Record<string, string> | Record<string, OptionInput>
): IOption[] => {
  const formattedOptions: IOption[] = [];

  for (const key in options) {
    const raw = options[key];
    if (typeof raw === "string") {
      formattedOptions.push({ value: key, label: raw });
    } else if (raw && typeof raw === "object" && "label" in raw) {
      formattedOptions.push({
        value: key,
        label: raw.label,
        ...(raw.is_disabled !== undefined && { isDisabled: !!raw.is_disabled }),
      });
    }
  }

  return formattedOptions;
};

export const processModelOptions = (modelName: string, model: []) => {
  let options = {};

  model.forEach((item) => {
    options = {
      ...options,
      [item["id"] as string]: item["name"],
    };
  });

  return options;
};

const createNullValues = (nullValues: string[]) =>
  nullValues.map((nullValue, index) => ({
    value: index.toString(),
    label: nullValue,
  }));

// static records
export const fieldConnection: Record<string, Record<string, string[]>> = {
  appointments: {
    time: ["service_id", "day"],
    quantity: ["service_id", "day", "time"],
  },
  services: {
    google_meet_calendar: ["connected_calendars"],
  },
  connected_calendars: {
    in_provider_id: ["provider"],
  },
};

export const sourcedFields: Record<string, Record<string, string[]>> = {
  services: {
    google_meet_calendar: ["connected_calendars"],
  },
};

export const isSourcedField = (model: string, field: string) => {
  if (sourcedFields[model] && sourcedFields[model][field]) {
    return true;
  }

  return false;
};

export const isFieldBelongsSource = (model: string, field: string) => {
  for (let sourceModel in sourcedFields[model]) {
    for (let sourceField in sourcedFields[model][sourceModel]) {
      if (sourcedFields[model][sourceModel][sourceField].includes(field)) {
        return true;
      }
    }
  }

  return false;
};

export const getSourceField = (model: string, field: string) => {
  for (let sourceField in sourcedFields[model]) {
    if (sourcedFields[model][sourceField].includes(field)) {
      return sourceField;
    }
  }

  return null;
};

export const getSourceModel = (model: string, field: string) => {
  for (let sourceModel in sourcedFields[model]) {
    for (let sourceField in sourcedFields[model][sourceModel]) {
      if (sourcedFields[model][sourceModel][sourceField].includes(field)) {
        return sourceModel;
      }
    }
  }

  return null;
};

export const isConnectedField = (model: string, field: string) => {
  for (let dependentField in fieldConnection[model]) {
    if (fieldConnection[model][dependentField].includes(field)) {
      return true;
    }
  }

  return false;
};

export const isDependentField = (model: string, field: string) => {
  return fieldConnection[model] && fieldConnection[model][field];
};

export const fetchConnectedOptions = async (
  model: string,
  field: string,
  formData: Record<string, string>
) => {
  const dependentFields = Object.keys(fieldConnection[model]).filter((parentFieldName: string) =>
    fieldConnection[model][parentFieldName].includes(field)
  );

  dependentFields.forEach((dependentField) => {
    // @ts-ignore
    dispatch(store_name).setFieldLoading(model, dependentField, true);
  });

  dependentFields.forEach(async (dependentField) => {
    let isValid = true;

    fieldConnection[model][dependentField].forEach((connectedField) => {
      if (!formData[connectedField]) {
        isValid = false;
      }
    });

    if (isValid) {
      const options = await apiFetch({
        path: `/wbk/v2/get-field-options/`,
        method: "POST",
        data: {
          model,
          field,
          form: formData,
        },
      });

      // @ts-ignore
      dispatch(store_name).setFieldOptions(model, field, options);
    }
  });
};

export const isModelOptions = (options: string | Record<string, string>) =>
  typeof options === "string" && options !== "backend";

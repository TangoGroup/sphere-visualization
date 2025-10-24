import * as React from 'react';
export type ComboboxOption = {
    value: string;
    label: string;
    group?: string;
};
export declare function Combobox({ value, onChange, options, placeholder, renderOption }: {
    value: string;
    onChange: (value: string) => void;
    options: ComboboxOption[];
    placeholder?: string;
    renderOption?: (opt: ComboboxOption) => React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=combobox.d.ts.map
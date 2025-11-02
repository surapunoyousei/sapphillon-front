"use client";

import { Field as ChakraField } from "@chakra-ui/react";
import type { ReactNode } from "react";

export interface FieldProps extends ChakraField.RootProps {
  label?: string;
  errorText?: string;
  helperText?: string;
  children: ReactNode;
}

export const Field = (props: FieldProps) => {
  const { label, errorText, helperText, children, ...rest } = props;
  return (
    <ChakraField.Root {...rest}>
      {label && <ChakraField.Label>{label}</ChakraField.Label>}
      {children}
      {helperText && (
        <ChakraField.HelperText>{helperText}</ChakraField.HelperText>
      )}
      {errorText && (
        <ChakraField.ErrorText>{errorText}</ChakraField.ErrorText>
      )}
    </ChakraField.Root>
  );
};


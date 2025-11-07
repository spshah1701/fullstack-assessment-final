extern crate proc_macro;
use proc_macro::TokenStream;
use quote::quote;
use syn::{Data, DeriveInput, Fields, parse_macro_input};

#[cfg(test)]
pub mod test_utils;

#[proc_macro_derive(FilterBuilder)]
pub fn filter_builder_derive(input: TokenStream) -> TokenStream {
    // Parse input struct
    let input = parse_macro_input!(input as DeriveInput);
    let struct_name = &input.ident;

    // Ensure struct has named fields
    let fields = match &input.data {
        Data::Struct(data_struct) => match &data_struct.fields {
            Fields::Named(fields_named) => &fields_named.named,
            _ => panic!("FilterBuilder only works on structs with named fields"),
        },
        _ => panic!("FilterBuilder only works on structs"),
    };

    // Generate SQL clause logic for each field type
    let field_conditions = fields.iter().map(|field| {
        let field_name = &field.ident;
        let field_name_str = field_name.as_ref().unwrap().to_string();
        let field_type = &field.ty;
        let inner_type_str = quote!(#field_type).to_string();

        // Integer filters (e.g., equals, gt, lt, gte, lte)

        if inner_type_str.contains("IntFilter") {
            quote! {
                if let Some(ref filter) = self.#field_name {
                    if let Some(value) = filter.equals {
                        params.push(serde_json::json!(value));
                        conds.push(format!("{} = ${}", #field_name_str, params.len()));
                    }
                    if let Some(value) = filter.gt {
                        params.push(serde_json::json!(value));
                        conds.push(format!("{} > ${}", #field_name_str, params.len()));
                    }
                    if let Some(value) = filter.lt {
                        params.push(serde_json::json!(value));
                        conds.push(format!("{} < ${}", #field_name_str, params.len()));
                    }
                    if let Some(value) = filter.gte {
                        params.push(serde_json::json!(value));
                        conds.push(format!("{} >= ${}", #field_name_str, params.len()));
                    }
                    if let Some(value) = filter.lte {
                        params.push(serde_json::json!(value));
                        conds.push(format!("{} <= ${}", #field_name_str, params.len()));
                    }
                }
            }
        }
        // String filters (e.g., equals, contains, starts_with, ends_with)
        else if inner_type_str.contains("StringFilter") {
            quote! {
                if let Some(ref filter) = self.#field_name {
                    if let Some(ref value) = filter.equals {
                        params.push(serde_json::json!(value));
                        conds.push(format!("{} = ${}", #field_name_str, params.len()));
                    }
                    if let Some(ref value) = filter.contains {
                        params.push(serde_json::json!(format!("%{}%", value)));
                        conds.push(format!("{} LIKE ${}", #field_name_str, params.len()));
                    }
                    if let Some(ref value) = filter.starts_with {
                        params.push(serde_json::json!(format!("{}%", value)));
                        conds.push(format!("{} LIKE ${}", #field_name_str, params.len()));
                    }
                    if let Some(ref value) = filter.ends_with {
                        params.push(serde_json::json!(format!("%{}", value)));
                        conds.push(format!("{} LIKE ${}", #field_name_str, params.len()));
                    }
                    if let Some(ref value) = filter.contains_insensitive {
                        params.push(serde_json::json!(format!("%{}%", value)));
                        conds.push(format!("{} ILIKE ${}", #field_name_str, params.len()));
                    }
                }
            }
        }
        // Handle nested AND filters recursively
        else if field_name_str == "and" {
            quote! {
                if let Some(ref subfilters) = self.and {
                    let mut sub_clauses = Vec::new();
                    for f in subfilters {
                        // Build clause and parameters from nested filter
                        let (clause, mut sub_params) = f.build_where_clause_inner();
                        if !clause.is_empty() {
                            // Adjust parameter indices based on current params length
                            let base = params.len();
                            let adjusted_clause = {
                                let mut c = clause;
                                for i in (1..=sub_params.len()).rev() {
                                    let old = format!("${}", i);
                                    let new = format!("${}", base + i);
                                    c = c.replace(&old, &new);
                                }
                                c
                            };
                            // Add adjusted subclause and merge parameters
                            sub_clauses.push(format!("({})", adjusted_clause));
                            params.append(&mut sub_params);
                        }
                    }
                    // Combine all nested clauses with AND
                    if !sub_clauses.is_empty() {
                        conds.push(sub_clauses.join(" AND "));
                    }
                }
            }
        }
        // Handle nested OR filters recursively
        else if field_name_str == "or" {
            quote! {
                if let Some(ref subfilters) = self.or {
                    let mut sub_clauses = Vec::new();
                    for f in subfilters {
                        // Build clause and parameters from nested filter
                        let (clause, mut sub_params) = f.build_where_clause_inner();
                        if !clause.is_empty() {
                            // Adjust parameter numbering for nested OR filters
                            let base = params.len();
                            let adjusted_clause = {
                                let mut c = clause;
                                for i in (1..=sub_params.len()).rev() {
                                    let old = format!("${}", i);
                                    let new = format!("${}", base + i);
                                    c = c.replace(&old, &new);
                                }
                                c
                            };
                            // Add adjusted subclause and merge parameters
                            sub_clauses.push(format!("({})", adjusted_clause));
                            params.append(&mut sub_params);
                        }
                    }
                    // Combine all nested clauses with OR
                    if !sub_clauses.is_empty() {
                        conds.push(sub_clauses.join(" OR "));
                    }
                }
            }
        } else {
            quote! {}
        }
    });

    let expanded = quote! {
        impl #struct_name {
            pub fn build_where_clause(&self) -> (String, Vec<serde_json::Value>) {
                let (inner, params) = self.build_where_clause_inner();
                if inner.is_empty() {
                    ("".to_string(), params)
                } else {
                    (format!(" WHERE {}", inner), params)
                }
            }

            fn build_where_clause_inner(&self) -> (String, Vec<serde_json::Value>) {
                let mut conds = Vec::new();
                let mut params = Vec::new();
                #(#field_conditions)*

                let clause = if conds.is_empty() {
                    "".to_string()
                } else {
                    conds.join(" AND ")
                };
                (clause, params)
            }
        }
    };

    TokenStream::from(expanded)
}
